import React, { Component } from "react";
import { saveAs } from 'file-saver';

import Info from "./Info";
import Breathe from "./Breathe";
import Control from "./Control";
import Accordion from "./Accordion";

const HASH_PARAMS = [
  "lowPoly",
  "imageHeight",
  "imageWidth",
  "margin",
  "backgroundStep",
  
  "cellSizeShapeOne",
  "thresholdShapeOne",
  "circlesCountShapeOne",
  "centerXShapeOne",
  "centerYShapeOne",
  "wShapeOne",
  "hShapeOne",
  "rMaxShapeOne",
  "rMinShapeOne",

  "cellSizeShapeTwo",
  "thresholdShapeTwo",
  "circlesCountShapeTwo",
  "centerXShapeTwo",
  "centerYShapeTwo",
  "wShapeTwo",
  "hShapeTwo",
  "rMaxShapeTwo",
  "rMinShapeTwo",

  "backgroundSeed",
  "shapeOneSeed",
  "shapeTwoSeed",
];

const STRING_PARAMS = [
  "shapeOneSeed",
  "shapeTwoSeed",
  "backgroundSeed",
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
      margin: 150,
      backgroundStep: 20,
      backgroundSeed: getRandomString(),
      shapeOneSeed: getRandomString(),
      shapeTwoSeed: getRandomString(),

      cellSizeShapeOne: 2,
      thresholdShapeOne: 1,
      circlesCountShapeOne: 90,
      centerXShapeOne: 0.4,
      centerYShapeOne: 0.5,
      wShapeOne: 0.66,
      hShapeOne: 0.5,
      rMaxShapeOne: 13,
      rMinShapeOne: 2,

      cellSizeShapeTwo: 2,
      thresholdShapeTwo: 1,
      circlesCountShapeTwo: 90,
      centerXShapeTwo: 0.6,
      centerYShapeTwo: 0.5,
      wShapeTwo: 0.66,
      hShapeTwo: 0.5,
      rMaxShapeTwo: 13,
      rMinShapeTwo: 2,

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

  downloadSVG = () => {
    const svg = document.querySelector('.Image-svg').outerHTML;
    const name =
      'breathe-' +
      window.location.hash.replace('#/', '').replace(/\//g, '-') +
      '.svg';
  
    saveAs(`data:application/octet-stream;base64,${btoa(svg)}`, name);
  };

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

  generateNewShapeOneTwoSeed = () => {
    this.setHash({
      shapeTwoSeed: getRandomString()
    });
  };

  generateNewBackgroundSeed = () => {
    this.setHash({
      backgroundSeed: getRandomString()
    });
  };

  reset = () => {
    window.location.hash = "";
    window.location.reload();
  };

  renderShapeControls(shapeLabel) {
    const cellSizeName = `cellSize${ shapeLabel }`
    const thresholdName = `threshold${ shapeLabel }`
    const circlesCountName = `circlesCount${ shapeLabel }`
    const centerXName = `centerX${ shapeLabel }`
    const centerYName = `centerY${ shapeLabel }`
    const wName = `w${ shapeLabel }`
    const hName = `h${ shapeLabel }`
    const rMaxName = `rMax${ shapeLabel }`
    const rMinName = `rMin${ shapeLabel }`

    const cellSize = this.state[cellSizeName]
    const threshold = this.state[thresholdName]
    const circlesCount = this.state[circlesCountName]
    const centerX = this.state[centerXName]
    const centerY = this.state[centerYName]
    const w = this.state[wName]
    const h = this.state[hName]
    const rMax = this.state[rMaxName]
    const rMin = this.state[rMinName]

    return (
      <Accordion label={shapeLabel}>
        <Control
          label="Cell Size"
          note={`Lower values produce smoother shapes, but performance will drop too. "Low poly" overrides this one.`}
          name={cellSizeName}
          value={cellSize}
          type="range"
          min={1}
          max={100}
          step={1}
          setState={this.setHash}
        />
        <Control
          label="Threshold"
          name={thresholdName}
          value={threshold}
          type="range"
          min={0.1}
          max={10}
          step={0.1}
          setState={this.setHash}
        />
        <Control
          label="Circles Count"
          name={circlesCountName}
          value={circlesCount}
          type="range"
          min={10}
          max={200}
          step={5}
          setState={this.setHash}
        />
        <Control
          label="Center X"
          name={centerXName}
          value={centerX}
          type="range"
          min={0.05}
          max={0.95}
          step={0.05}
          setState={this.setHash}
        />
        <Control
          label="Center Y"
          name={centerYName}
          value={centerY}
          type="range"
          min={0.05}
          max={0.95}
          step={0.05}
          setState={this.setHash}
        />
        <Control
          label="Width"
          name={wName}
          value={w}
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          setState={this.setHash}
        />
        <Control
          label="Height"
          name={hName}
          value={h}
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          setState={this.setHash}
        />
        <Control
          label="R Max"
          name={rMaxName}
          value={rMax}
          type="range"
          min={0.5}
          max={50}
          step={1}
          setState={this.setHash}
        />
        <Control
          label="R Min"
          name={rMinName}
          value={rMin}
          type="range"
          min={0.5}
          max={50}
          step={1}
          setState={this.setHash}
        />
      </Accordion>
    )
  }

  render() {
    const {
      lowPoly,
      imageHeight,
      imageWidth,
      margin,
      backgroundStep,
      backgroundSeed,
      shapeOneSeed,
      shapeTwoSeed,
    } = this.state;

    return (
      <div className="App">
        <div className="Controls">
          <Info />

          <Control
            name="lowPoly"
            label="Low poly"
            note={`Fixes "Cell Size" to 10 to increase performance`}
            value={lowPoly}
            type="checkbox"
            setState={this.setHash}
          />
          
          <Accordion label="Main">
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
              max={300}
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
          </Accordion>

          { this.renderShapeControls('ShapeOne') }
          
          { this.renderShapeControls('ShapeTwo') }

          <Accordion label="Rng seeds">
            <Control
              name="backgroundSeed"
              value={backgroundSeed}
              type="text"
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
            
            <button type="button" className="Button" onClick={this.generateNewBackgroundSeed}>
              Regenerate Background
            </button>
            <button type="button" className="Button" onClick={this.generateNewShapeOneSeed}>
              Regenerate Shape One
            </button>
            <button type="button" className="Button" onClick={this.generateNewShapeOneTwoSeed}>
              Regenerate Shape Two
            </button>
          </Accordion>

          <div className="Controls-buttons">
            <button type="button" className="Button" onClick={this.reset}>
              Reset
            </button>
            <button type="button" className="Button" onClick={this.downloadSVG}>
              Download SVG
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
