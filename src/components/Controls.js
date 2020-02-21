import React, { Component, Fragment } from "react";

import Breathe from "./Breathe";
import Control from "./Control";

const HASH_PARAMS = [
  "lowPoly",
  "imageHeight",
  "imageWidth",
  "margin",
  "backgroundStep",
  "shapeOneSeed",
  "shapeTwoSeed",
];

const STRING_PARAMS = [
  "shapeOneSeed",
  "shapeTwoSeed",
];

const BOOLEANS_PARAMS = [
  "lowPoly"
];

function getRandomString() {
  return Math.random()
    .toString(36)
    .substr(2);
}

export default class Controls extends Component {
  constructor() {
    super();

    this.state = {
      lowPoly: true,
      imageHeight: 1500,
      imageWidth: 1000,
      margin: 100,
      backgroundStep: 20,
      shapeOneSeed: getRandomString(),
      shapeTwoSeed: getRandomString(),
      ...this.getStateFromHash()
    };

    window.addEventListener("hashchange", this.handleHashChange);
  }

  componentDidMount() {
    this.setHash();
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.handleHashChange);
  }

  getStateFromHash() {
    const params = window.location.hash.replace("#", "").split("/");
    params.shift();

    const state = {};

    if (params.length !== HASH_PARAMS.length) {
      return;
    }

    let invalid = false;

    HASH_PARAMS.forEach((key, index) => {
      if (typeof params[index] !== "undefined") {
        if (BOOLEANS_PARAMS.includes(key)) {
          state[key] = params[index] === "true";
        } else if (STRING_PARAMS.includes(key)) {
          state[key] = params[index];
        } else  {
          state[key] = parseFloat(params[index]);
        }
      } else {
        invalid = true;
      }
    });

    if (invalid) {
      console.log('getStateFromHash failed')
      return;
    }

    return state;
  }

  handleHashChange = () => {
    this.setState(this.getStateFromHash);
  };

  setHash = (partialState = {}) => {
    const hashState = {
      ...this.state,
      ...partialState
    };

    window.location.hash = HASH_PARAMS.reduce(
      (hash, key) => (hash += `/${hashState[key]}`),
      ""
    );
  };

  generateNewShapeOneSeed = () => {
    this.setHash({
      shapeOneSeed: getRandomString()
    });
  };

  generateNewShapeOneTwo = () => {
    this.setHash({
      shapeTwoSeed: getRandomString()
    });
  };

  reset = () => {
    window.location.hash = "";
    window.location.reload();
  };

  render() {
    const {
      lowPoly,
      imageHeight,
      imageWidth,
      margin,
      backgroundStep,
      shapeOneSeed,
      shapeTwoSeed,
    } = this.state;

    return (
      <div className="App">
        <div className="Controls">
          <h1 className="Controls-title">
            <a href="/" className="Controls-titleLink">
              Breathe
            </a>
          </h1>
          <div className="Controls-description">
            <p>
              Generative art piece by Stanko.
            </p>
            <a href="https://muffinman.io/">My blog</a>
            <a href="https://github.com/Stanko/generative-breathe">GitHub</a>
          </div>
          <Control
            name="lowPoly"
            value={lowPoly}
            type="checkbox"
            setState={this.setHash}
          />
          <Control
            name="imageWidth"
            value={imageWidth}
            type="range"
            min={500}
            max={2000}
            step={50}
            setState={this.setHash}
          />
          <Control
            name="imageHeight"
            value={imageHeight}
            type="range"
            min={500}
            max={2000}
            step={50}
            setState={this.setHash}
          />
          <Control
            name="margin"
            value={margin}
            type="range"
            min={0}
            max={200}
            step={10}
            setState={this.setHash}
          />
          <Control
            name="backgroundStep"
            value={backgroundStep}
            type="range"
            min={10}
            max={100}
            step={5}
            setState={this.setHash}
          />
          <Control
            name="shapeOneSeed"
            value={shapeOneSeed}
            type="text"
            setState={this.setHash}
          />
          <Control
            name="shapeTwoSeed"
            value={shapeTwoSeed}
            type="text"
            setState={this.setHash}
          />
          
          <div className="Controls-buttons">
            <button onClick={this.generateNewShapeOneSeed}>
              Regenerate Shape One
            </button>
            <button onClick={this.generateNewShapeOneTwo}>
              Regenerate Shape Two
            </button>
            <button className="Controls-reset" onClick={this.reset}>
              Reset
            </button>
          </div>
        </div>

        <Breathe
          {...this.state}
          setGlobalState={this.setHash}
        />
      </div>
    );
  }
}
