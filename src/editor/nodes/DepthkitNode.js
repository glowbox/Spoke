import EditorNodeMixin from "./EditorNodeMixin";
import { Object3D, PlaneBufferGeometry, MeshBasicMaterial, Mesh, DoubleSide } from "three";
import spokeLogoSrc from "../../assets/spoke-icon.png";

import loadTexture from "../utils/loadTexture";

let linkHelperTexture = null;

export default class DepthkitNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = "depthkit-player";

  static nodeName = "Depthkit Player";

  static async load() {
    linkHelperTexture = await loadTexture(spokeLogoSrc);
  }

  static async deserialize(editor, json) {
    const node = await super.deserialize(editor, json);

    const { src } = json.components.find(c => c.name === "depthkit-player").props;

    node.src = src;

    return node;
  }

  constructor(editor) {
    super(editor);

    this.src = "";

    const geometry = new PlaneBufferGeometry();
    const material = new MeshBasicMaterial();
    material.map = linkHelperTexture;
    material.side = DoubleSide;
    material.transparent = true;
    this.helper = new Mesh(geometry, material);
    this.helper.layers.set(1);
    this.add(this.helper);
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

    this.src = source.src;

    return this;
  }

  serialize() {
    return super.serialize({
      "depthkit-player": {
        src: this.src
      }
    });
  }

  prepareForExport() {
    super.prepareForExport();
    this.addGLTFComponent("depthkit-player", {
      src: this.src
    });
    this.replaceObject();
  }
}
