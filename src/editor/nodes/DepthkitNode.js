/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import spokeLogoSrc from "../../assets/spoke-icon.png";

import loadTexture from "../utils/loadTexture";

import "depthkit";

//let linkHelperTexture = null;

export default class DepthkitNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = "depthkit-player";

  static nodeName = "Depthkit Player";

  static async load() {
    //linkHelperTexture = await loadTexture(spokeLogoSrc);
  }

  static async deserialize(editor, json, loadAsync, onError) {
    const node = await super.deserialize(editor, json);

    const { src } = json.components.find(c => c.name === "depthkit-player").props;

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
    this.player = new Depthkit();

    /*
    const geometry = new PlaneBufferGeometry();
    const material = new MeshBasicMaterial();
    material.map = linkHelperTexture;
    material.side = DoubleSide;
    material.transparent = true;
    this.helper = new Mesh(geometry, material);
    this.helper.layers.set(1);
    this.add(this.helper);
    */
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

  async load(src) {
    const isMp4 = this._src.toLowerCase().endsWith(".mp4");
    if (!isMp4) {
      console.error("depthkit-player: video url invalid:" + src);
      this.player.stop();
      return;
    }

    const metaPath = src.substring(0, this._src.length - 4) + ".txt";

    const proxyMeta = this.editor.api.proxyUrl(metaPath);
    const proxySrc = this.editor.api.proxyUrl(src);

    console.log("Depthkit loadVideo - meta:" + metaPath + " video:" + src);

    this.player.load(proxyMeta, proxySrc, dkCharacter => {
      this.character = dkCharacter;

      console.log("Depthkit Loaded");

      //Position and rotation adjustments
      //dkCharacter.rotation.set( Math.PI - 0.25, 0, Math.PI / -2.0 );
      // dkCharacter.rotation.y = Math.PI;
      this.character.position.set(0, 0, 0);

      // Depthkit video playback control
      //this.player.video.muted = "muted"; // Necessary for auto-play in chrome now
      this.player.setLoop(true);
      this.player.play();

      //Add the character to the scene
      this.add(this.character);
    });

    return this;
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
