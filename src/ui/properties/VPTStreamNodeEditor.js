import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import StringInputTall from "../inputs/StringInput";

import { Link } from "styled-icons/fa-solid/Link";

export default class VPTStreamNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconComponent = Link;

  static description = "Volumetric Performance Toolkit Stream ";

  onChangeSrc = src => {
    this.props.editor.setPropertySelected("src", src);
  };

  onChangeMeta = meta => {
    this.props.editor.setPropertySelected("meta", meta);
  };

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={VPTStreamNodeEditor.description} {...this.props}>
        <InputGroup name="Stream URL">
          <StringInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
        <InputGroup name="Meta json">
          <StringInputTall value={node.meta} onChange={this.onChangeMeta} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
