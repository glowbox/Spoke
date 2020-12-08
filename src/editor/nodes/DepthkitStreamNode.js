/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import spokeLogoSrc from "../../assets/spoke-icon.png";

import loadTexture from "../utils/loadTexture";

import "depthkit";

//let linkHelperTexture = null;

export default class DepthkitStreamNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = "depthkit-stream";

  static nodeName = "Depthkit Stream";

  static async load() {
    //linkHelperTexture = await loadTexture(spokeLogoSrc);
  }

  static async deserialize(editor, json, loadAsync, onError) {
    const node = await super.deserialize(editor, json);

    const { src } = json.components.find(c => c.name === "depthkit-stream").props;

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

    this._src = "";
    this.depthkit = new DepthkitStream();

    document.body.appendChild(this.depthkit.video);

    this.depthkit.addEventListener(STREAMEVENTS.PLAY_SUCCESS, function (event) {
      console.log(`${event.type} ${event.message}`);
    });

    this.depthkit.addEventListener(STREAMEVENTS.PLAY_ERROR, function (event) {
      console.log(`${event.type} ${event.message}`);
    });

    this.add(this.depthkit);

  }

  get src() {
    return this._src;
  }

  set src(value) {
    console.log("Depthkit set src " + this._src);
    this._src = value;
    this.load(value).catch(console.error);
  }

  onAdd() { }

  onChange() {
    console.log("Depthkit onChange " + this._src);
  }

  onSelect() { }

  onDeselect() { }


  async load(params) {

    let url = params.videoPath;
    fileExtension = url.substr((url.lastIndexOf('.') + 1));

    console.log(fileExtension);
    if (fileExtension != "m3u8") {
      try {
        url = await fetch(url);
        url = await url.text();

      } catch (error) {
        // show error
        console.error("Depthkit Stream Load error", error)
      }
    }

    params.videoPath = url;
    depthkit.load(params);

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

    return this;
  }

  serialize() {
    return super.serialize({
      "depthkit-player": {
        src: this._src
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("depthkit-player", {
      src: this._src
    });
    this.replaceObject();
  }
}
