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

    const { src, meta, sensor, renderMode, pointSize, startat, thresholdMin, thresholdMax } = json.components.find(c => c.name === "vpt-stream").props;

    console.log(json.components.find(c => c.name === "vpt-stream").props);

    loadAsync(
      (async () => {
        node.params.src = src;
        node.params.meta = meta == undefined ? node.params.meta : meta;
        node.params.sensor = sensor == undefined ? node.params.sensor : sensor;
        node.params.renderMode = renderMode == undefined ? node.params.renderMode : renderMode;
        node.params.pointSize = pointSize == undefined ? node.params.pointSize : pointSize;
        node.params.startat = startat == undefined ? node.params.startat : startat;
        node.params.thresholdMin = thresholdMin == undefined ? node.params.thresholdMin : thresholdMin;
        node.params.thresholdMax = thresholdMax == undefined ? node.params.thresholdMax : thresholdMax;

        node._thresholdX = new Vector2(node.params.thresholdMin.x, node.params.thresholdMax.x);
        node._thresholdY = new Vector2(node.params.thresholdMin.y, node.params.thresholdMax.y);
        node._thresholdZ = new Vector2(node.params.thresholdMin.z, node.params.thresholdMax.z);

        node.loadMedia().catch(console.error);
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
      startat: 0.0,
      thresholdMin: { x: -2.0, y: -2.0, z: 0.0 },
      thresholdMax: { x: 2.0, y: 2.0, z: 4.0 },
    }

    this._thresholdX = new Vector2(this.params.thresholdMin.x, this.params.thresholdMax.x);
    this._thresholdY = new Vector2(this.params.thresholdMin.y, this.params.thresholdMax.y);
    this._thresholdZ = new Vector2(this.params.thresholdMin.z, this.params.thresholdMax.z);



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

    this.loadMedia().catch(console.error);
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
    this.updateStream("pointSize", value);
  }

  get startat() { return this.params.startat; }

  set startat(value) {
    if (!value) return;
    this.params.startat = value;
    this.updateStream("startat", value);
  }

  get thresholdX() { return this._thresholdX; }

  set thresholdX(value) {
    if (!value) return;

    this._thresholdX = value;

    this.params.thresholdMin.x = this._thresholdX.x;
    this.params.thresholdMax.x = this._thresholdX.y;

    this.updateStream("thresholdMin", this.params.thresholdMin);
    this.updateStream("thresholdMax", this.params.thresholdMax);
  }

  get thresholdY() { return this._thresholdY; }

  set thresholdY(value) {
    if (!value) return;

    this._thresholdY = value;

    this.params.thresholdMin.y = this._thresholdY.x;
    this.params.thresholdMax.y = this._thresholdY.y;

    this.updateStream("thresholdMin", this.params.thresholdMin);
    this.updateStream("thresholdMax", this.params.thresholdMax);
  }

  get thresholdZ() { return this._thresholdZ; }

  set thresholdZ(value) {
    if (!value) return;

    this._thresholdZ = value;

    this.params.thresholdMin.z = this._thresholdZ.x;
    this.params.thresholdMax.z = this._thresholdZ.y;

    this.updateStream("thresholdMin", this.params.thresholdMin);
    this.updateStream("thresholdMax", this.params.thresholdMax);
  }

  onAdd() {
    console.log("vptstream onAdd " + this.params.src);
  }

  onRemove() {
    console.log("vptstream onRemove " + this.params.src);
    this.vptstream.dispose();

  }

  onChange() {
    //console.log("vptstream onChange " + this.params.src);
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
      scale: this.scale.z,
      startat: this.params.startat,
      thresholdMin: this.params.thresholdMin,
      thresholdMax: this.params.thresholdMax
    }
    this.vptstream.load(params);

  }

  updateStream(param, value) {

    if (this.vptstream) {
      this.vptstream.updateParameter(param, value);
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
    this.params.renderMode = source.renderMode;
    this.params.pointSize = source.pointSize;
    this.params.startat = source.startat;
    this.params.thresholdMin = source.thresholdMin;
    this.params.thresholdMax = source.thresholdMax;

    return this;
  }

  serialize() {
    return super.serialize({
      "vpt-stream": {
        src: this.params.src,
        meta: this.params.meta,
        renderMode: this.params.renderMode,
        pointSize: this.params.pointSize,
        scale: this.scale.z,
        startat: this.params.startat,
        thresholdMin: this.params.thresholdMin,
        thresholdMax: this.params.thresholdMax
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
      scale: this.scale.z,
      startat: this.params.startat,
      thresholdMin: this.params.thresholdMin,
      thresholdMax: this.params.thresholdMax
    });
    this.replaceObject();
  }
}
