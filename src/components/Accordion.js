import React, { Component } from "react";
import AnimateHeight from "react-animate-height";
import { convertCamelCase } from "./Control";

export default class Accordion extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    const { isOpen } = this.state;

    this.setState({
      isOpen: !isOpen
    });
  };

  render() {
    const { label, children } = this.props;
    const { isOpen } = this.state;

    return (
      <>
        <button
          className={`Accordion-toggle ${
            isOpen ? "Accordion-toggle--open" : ""
          }`}
          onClick={this.toggle}
        >
          <div className="Accordion-toggleContent">
            {isOpen ? "Hide" : "Show"} {convertCamelCase(label)} controls
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <polyline
                fill="none"
                strokeLinecap="round"
                stroke="#999"
                strokeWidth="2"
                points="20.59 7.66 11.9 16.34 3.41 7.86"
              />
            </svg>
          </div>
        </button>
        <AnimateHeight
          height={isOpen ? "auto" : 0}
          contentClassName="Accordion-content"
        >
          {children}
        </AnimateHeight>
      </>
    );
  }
}
