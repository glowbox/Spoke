import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import CompoundNumericInput from "../inputs/CompoundNumericInput";
import Vector2Input from "../inputs/Vector2Input";
import SelectInput from "../inputs/SelectInput";

import { Link } from "styled-icons/fa-solid/Link";

const renderModeOptions = [
  { label: "Perspective Points", value: "perspective" },
  { label: "Cutout 2D", value: "cutout" }
];

const cameraOptions = [
  { label: "Realsense D415", value: "realsenseD415" },
  { label: "Azure Kinect", value: "azurekinect" },
  { label: "Custom", value: "custom" }
];

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

  onChangeCamera = sensor => {
    this.props.editor.setPropertySelected("sensor", sensor);
  };

  onChangeRenderMode = renderMode => {
    this.props.editor.setPropertySelected("renderMode", renderMode);
  };

  onChangePointSize = pointSize => {
    this.props.editor.setPropertySelected("pointSize", pointSize);
  };

  onChangeThresholdX = thresholdX => {
    this.props.editor.setPropertySelected("thresholdX", thresholdX);
  };

  onChangeThresholdY = thresholdY => {
    this.props.editor.setPropertySelected("thresholdY", thresholdY);
  };

  onChangeThresholdZ = thresholdZ => {
    this.props.editor.setPropertySelected("thresholdZ", thresholdZ);
  };

  render() {
    const node = this.props.node;

    return (
      <NodeEditor description={VPTStreamNodeEditor.description} {...this.props}>
        <InputGroup name="Stream URL">
          <StringInput value={node.src} onChange={this.onChangeSrc} />
        </InputGroup>
        <InputGroup name="Camera/Sensor" info="What camera is use to capture depth">
          <SelectInput options={cameraOptions} value={node.sensor} onChange={this.onCameraChange} />
        </InputGroup>
        <InputGroup name="Render Mode" info="Limit what type of media this frame will capture">
          <SelectInput options={renderModeOptions} value={node.renderMode} onChange={this.onChangeRenderMode} />
        </InputGroup>
        <InputGroup name="Point Size">
          <CompoundNumericInput
            min={0.1}
            max={20}
            step={0.1}
            value={node.pointSize}
            onChange={this.onChangeStartOpacity}
          />
        </InputGroup>
        <InputGroup name="Threshold X (width)">
          <Vector2Input
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            min={0}
            max={4}
            value={node.thresholdX}
            onChange={this.onChangeThresholdX}
          />
        </InputGroup>
        <InputGroup name="Threshold Y (height)">
          <Vector2Input
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            min={0}
            max={4}
            value={node.thresholdY}
            onChange={this.onChangeThresholdY}
          />
        </InputGroup>
        <InputGroup name="Threshold Z (depth)">
          <Vector2Input
            smallStep={0.01}
            mediumStep={0.1}
            largeStep={0.25}
            min={0}
            max={4}
            value={node.thresholdZ}
            onChange={this.onChangeThresholdZ}
          />
        </InputGroup>
      </NodeEditor>
    );
  }
}
