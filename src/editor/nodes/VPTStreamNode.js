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
import { Vector2 } from "three";
import "depthkit";
import Hls from "hls.js/dist/hls.light";

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

    window.Hls = Hls;

    //TODO: refactor to match how audiosource/videosource, where the base functionality is an "object" and the node is a simple wrapper around it

    this.params = {
      src: "",
      meta: realsense415,
      sensor: "realsenseD415",
      renderMode: "perspective",
      pointSize: 8.0,
      thresholdX: { min: -2.0, max: 2.0 },
      thresholdY: { min: -2.0, max: 2.0 },
      thresholdZ: { min: 0.0, max: 4.0 },
    }

    this.vptstream = new VPTStream();
    this.vptstream.nodeName = "IgnoreForExport";
    this.vptstream.hls_xhroverride = this.proxyHLS;

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
    return this.params.src;
  }

  set src(value) {
    if (value) {
      console.log("vptstream set src " + value);
      this.params.src = value;
      this.loadMedia().catch(console.error);
    }
  }

  //TODO: consider embedding the meta data json instead of a url to the data
  get meta() {
    return this.params.meta;
  }

  set meta(value) {
    if (value) {
      console.log("vptstream set meta " + value);
      this.params.meta = value;
      //this.loadMedia().catch(console.error);
    }
  }

  get sensor() { return this.params.sensor; }

  set sensor(value) {
    //TODO: add support for more sensor calibrations
    if (value == "realsenseD415") {
      this.params.meta = realsense415;
    }
    this.params.sensor = value;
  }

  get renderMode() { return this.params.renderMode; }

  set renderMode(value) {
    if (!value) return;
    this.params.renderMode = value;

    this.loadMedia().catch(console.error);
  }

  get pointSize() { return this.params.pointSize; }

  set pointSize(value) {
    if (!value) return;
    this.params.pointSize = value;
    this.updateStream();
  }

  get thresholdX() { return new Vector2(this.params.thresholdX.min, this.params.thresholdX.max); }

  set thresholdX(value) {
    if (!value) return;

    this.params.thresholdX.min = value.x;
    this.params.thresholdX.max = value.y;
    this.updateStream();
  }

  get thresholdY() { return new Vector2(this.params.thresholdY.min, this.params.thresholdY.max); }

  set thresholdY(value) {
    if (!value) return;

    this.params.thresholdY.min = value.x;
    this.params.thresholdY.max = value.y;
    this.updateStream();
  }

  get thresholdZ() { return new Vector2(this.params.thresholdZ.min, this.params.thresholdZ.max); }

  set thresholdZ(value) {
    if (!value) return;

    this.params.thresholdZ.min = value.x;
    this.params.thresholdZ.max = value.y;
    this.updateStream();
  }

  onAdd() {
    console.log("vptstream onAdd " + this.params.src);
  }

  onChange() {
    //console.log("vptstream onChange " + this.params.src);
    this.updateStream();
  }

  onSelect() { }

  onDeselect() { }

  async loadMedia() {

    if (!this.params.src || this.params.src.length < 5) {
      console.error("vptstream invalid src")
      return;
    }

    if (!this.params.meta) {
      console.error("vptstream invalid meta")
      return;
    }

    let url = this.params.src;
    const fileExtension = url.substr((this.params.src.lastIndexOf('.') + 1));

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
      meta: this.params.meta,
      renderMode: this.params.renderMode,
      pointSize: this.params.pointSize,
      scale: this.scale.z
    }
    this.vptstream.load(params);
  }

  updateStream() {

    if (this.vptstream) {

      this.vptstream.updateParameter("pointSize", this.params.pointSize);

      this.vptstream.updateParameter("scale", this.scale.z);

    }

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

    this.params.src = source.src;
    this.params.meta = source.meta;
    return this;
  }

  serialize() {
    return super.serialize({
      "vpt-stream": {
        src: this.params.src,
        meta: this.params.meta,
        renderMode: this.params.renderMode,
        pointSize: this.params.pointSize,
        scale: this.params.scale
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("vpt-stream", {
      src: this.params.src,
      meta: this.params.meta,
      renderMode: this.params.renderMode,
      pointSize: this.params.pointSize,
      scale: this.params.scale
    });
    this.replaceObject();
  }
}
