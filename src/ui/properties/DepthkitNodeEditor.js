import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import { Link } from "styled-icons/fa-solid/Link";

export default class DepthkitNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconComponent = Link;

  static description = "Depthkit Player url";

  onChangeSrc = src => {
    this.props.editor.setPropertySelected("src", src);
  };

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={DepthkitNodeEditor.description} {...this.props}>
        <InputGroup name="Url">
          <StringInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
