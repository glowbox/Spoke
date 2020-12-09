import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import { Link } from "styled-icons/fa-solid/Link";

export default class DepthkitStreamNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconComponent = Link;

  static description = "HLS stream url";

  onChangeSrc = src => {
    this.props.editor.setPropertySelected("src", src);
  };

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={DepthkitStreamNodeEditor.description} {...this.props}>
        <InputGroup name="Url">
          <StringInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
