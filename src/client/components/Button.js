import React, { Component } from "react";
import PropTypes from "prop-types";
import "./Button.scss";

export default class Button extends Component {
  render() {
    return (
      <button className="Button" onClick={this.props.onClick}>
        {this.props.children}
      </button>
    );
  }
}

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node
};
