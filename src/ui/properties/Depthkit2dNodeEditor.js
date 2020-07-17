import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import { Link } from "styled-icons/fa-solid/Link";

export default class Depthkit2dNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  };

  static iconComponent = Link;

  static description = "Depthkit2d Player url";

  onChangeHref = href => {
    this.props.editor.setPropertySelected("href", href);
  };

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={Depthkit2dNodeEditor.description} {...this.props}>
        <InputGroup name="Url">
          <StringInput value={node.href} onChange={this.onChangeHref} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
