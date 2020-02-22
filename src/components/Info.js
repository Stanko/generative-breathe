import React, { Component } from "react";


export default class Info extends Component {
  render() {
    return (
      <>
        <h1 className="Controls-title">
          <a href="/" className="Controls-titleLink">
            Breathe
          </a>
        </h1>
        <div className="Controls-description">
          <p>
            Generative art piece.
          </p>
          <a href="https://muffinman.io/">My blog</a>
          <a href="https://github.com/Stanko/generative-breathe">GitHub</a>
        </div>
      </>
    );
  }
}
