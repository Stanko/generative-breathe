import React, { Component } from 'react';
import seedrandom from 'seedrandom';
import Shapes from './Shapes';

export default class Breathe extends Component {
  drawBackground() {
    const {
      imageWidth,
      imageHeight,
      backgroundStep,
      backgroundSeed,
    } = this.props;

    const background = [];
    const rng = seedrandom(backgroundSeed);

    for (let i = 0; i < imageHeight; i += backgroundStep) {
      let y1 = i + Math.floor(rng() * backgroundStep) * 0.66;
      let y2 = i + Math.floor(rng() * backgroundStep) * 0.66;
      const lineWidth = 5 + Math.floor((rng() * backgroundStep) / 2);

      background.push(
        <path
          key={ i }
          fill={ `hsl(${180 + rng() * 40}, 40%, 60%)` }
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d={ `M 0 ${y1} L ${imageWidth} ${y2} L ${imageWidth} ${y2 + lineWidth} L ${0} ${y1 + lineWidth} Z` }
        />
      );
    }

    return background;
  }

  render() {
    const { 
      imageWidth, 
      imageHeight, 
      shapeOneSeed,
      shapeTwoSeed,
      margin, 
      lowPoly,

      cellSizeShapeOne,
      thresholdShapeOne,
      circlesCountShapeOne,
      centerXShapeOne,
      centerYShapeOne,
      wShapeOne,
      hShapeOne,
      rMaxShapeOne,
      rMinShapeOne,

      cellSizeShapeTwo,
      thresholdShapeTwo,
      circlesCountShapeTwo,
      centerXShapeTwo,
      centerYShapeTwo,
      wShapeTwo,
      hShapeTwo,
      rMaxShapeTwo,
      rMinShapeTwo,
    } = this.props;

    return (
      <div className="Image">
        <svg
          className="Image-svg"
          viewBox={`${-margin} ${-margin} ${imageWidth + margin * 2} ${imageHeight + margin * 2}`}
          ref={el => (this.svgElement = el)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            {this.drawBackground()}
          </g>
          <Shapes
            imageWidth={ imageWidth } 
            imageHeight={ imageHeight } 
            shapeOneSeed={ shapeOneSeed }
            shapeTwoSeed={ shapeTwoSeed }
            lowPoly={ lowPoly }
            cellSizeShapeOne={ cellSizeShapeOne }
            thresholdShapeOne={ thresholdShapeOne }
            circlesCountShapeOne={ circlesCountShapeOne }
            centerXShapeOne={ centerXShapeOne }
            centerYShapeOne={ centerYShapeOne }
            wShapeOne={ wShapeOne }
            hShapeOne={ hShapeOne }
            rMaxShapeOne={ rMaxShapeOne }
            rMinShapeOne={ rMinShapeOne }
            cellSizeShapeTwo={ cellSizeShapeTwo }
            thresholdShapeTwo={ thresholdShapeTwo }
            circlesCountShapeTwo={ circlesCountShapeTwo }
            centerXShapeTwo={ centerXShapeTwo }
            centerYShapeTwo={ centerYShapeTwo }
            wShapeTwo={ wShapeTwo }
            hShapeTwo={ hShapeTwo }
            rMaxShapeTwo={ rMaxShapeTwo }
            rMinShapeTwo={ rMinShapeTwo }
          />
        </svg>
      </div>
    );
  }
}
