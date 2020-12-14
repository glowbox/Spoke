/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import spokeLogoSrc from "../../assets/spoke-icon.png";
import realsense415 from "../../assets/vpt/realsense415_480.json";
import { buildAbsoluteURL } from "url-toolkit";
import { proxiedUrlFor } from "../../api/Api";
import configs from '../../configs'
import loadTexture from "../utils/loadTexture";

import "depthkit";

//let linkHelperTexture = null;

export default class VPTStreamNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = "vpt-stream";

  static nodeName = "VPT Stream";

  static async load() {

  }

  static async deserialize(editor, json, loadAsync, onError) {
    const node = await super.deserialize(editor, json);

    const { src } = json.components.find(c => c.name === "vpt-stream").props;

    loadAsync(
      (async () => {
        node.src = src;
        //await node.load(src, onError);
      })()
    );

    return node;
  }

  constructor(editor) {
    super(editor);

    //TODO: refactor to match how audiosource/videosource, where the base functionality is an "object" and the node is a simple wrapper around it
    this._src = "";
    this._meta = realsense415;

    this.vptstream = new VPTStream();
    this.vptstream.hls_xhroverride = this.proxyHLS;
    document.body.appendChild(this.vptstream.video);

    this.vptstream.addEventListener(STREAMEVENTS.PLAY_SUCCESS, function (event) {
      console.log(`${event.type} ${event.message}`);
    });

    this.vptstream.addEventListener(STREAMEVENTS.PLAY_ERROR, function (event) {
      console.log(`${event.type} ${event.message}`);
    });

    this.add(this.vptstream);

  }

  proxyHLS(xhr, u) {
    const corsProxyPrefix = `https://${configs.CORS_PROXY_SERVER}/`;
    if (u.startsWith(corsProxyPrefix)) {
      u = u.substring(corsProxyPrefix.length);
    }
    // HACK HLS.js resolves relative urls internally, but our CORS proxying screws it up. Resolve relative to the original unproxied url.
    // TODO extend HLS.js to allow overriding of its internal resolving instead
    if (!u.startsWith("http")) {
      u = buildAbsoluteURL(baseUrl, u.startsWith("/") ? u : `/${u}`);
    }
    xhr.open("GET", proxiedUrlFor(u));
  }

  get src() {
    return this._src;
  }

  set src(value) {
    if (value) {
      console.log("vptstream set src " + value);
      this._src = value;
      this.loadMedia().catch(console.error);
    }
  }

  //TODO: consider embedding the meta data json instead of a url to the data
  get meta() {
    return this._meta;
  }

  set meta(value) {
    if (value) {
      console.log("vptstream set meta " + value);
      this._meta = value;
      this.loadMedia().catch(console.error);
    }
  }

  onAdd() {
    console.log("vptstream onAdd " + this._src);
  }

  onChange() {
    console.log("vptstream onChange " + this._src);
  }

  onSelect() { }

  onDeselect() { }

  async loadMedia() {

    if (!this._src || this._src.length < 5) {
      console.error("vptstream invalid src")
      return;
    }

    if (!this._meta || this._meta.length < 5) {
      console.error("vptstream invalid meta")
      return;
    }

    let url = this._src;
    const fileExtension = url.substr((this._src.lastIndexOf('.') + 1));

    if (fileExtension != "m3u8") {
      try {
        url = await fetch(url);
        url = await url.text();
      } catch (error) {
        console.error("vptstream Stream Load error", error)
      }
    }

    const proxySrc = proxiedUrlFor(url);

    console.log("load " + proxySrc)

    const params = {
      videoPath: proxySrc,
      meta: this._meta,
      renderMode: 'perspective',
    }
    this.vptstream.load(params);

  }


  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.helper);
    }

    super.copy(source, recursive);

    if (recursive) {
      const helperIndex = source.children.findIndex(child => child === source.helper);

      if (helperIndex !== -1) {
        this.helper = this.children[helperIndex];
      }
    }

    this._src = source.src;
    this._meta = source.meta;
    return this;
  }

  serialize() {
    return super.serialize({
      "vpt-stream": {
        src: this._src,
        meta: this._meta
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("vpt-stream", {
      src: this._src,
      meta: this._meta
    });
    this.replaceObject();
  }
}
