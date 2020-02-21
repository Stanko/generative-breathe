import React, { Component } from 'react';
import { isPolygonInPolygon } from 'generative-utils/points';
import { saveAs } from 'file-saver';
import * as martinez from 'martinez-polygon-clipping';
import seedrandom from 'seedrandom';
import Metaballs from '../metaballs';


function flattenPolygon(polygon) {
  const flat = [];

  polygon.forEach((polygonPart) => {
    if (polygonPart.length === 1) {
      flat.push(...flattenPolygon(polygonPart, fill, stroke));
    } else {
      flat.push(polygonPart);
    }
  });

  return flat;
}

function fixHoles(multiPolygon) {
  const flat = [];

  multiPolygon.forEach((polygon) => {
    flat.push(...flattenPolygon(polygon));
  });

  const f = flat.map(shape => {
    return shape.map(p => {
      return {
        x: p[0],
        y: p[1]
      };
    });
  });

  return flatToMultiPolygon(f);
}

function flatToMultiPolygon(flatShapes) {
  const holes = [];
  const shapes = flatShapes.map(s => [s]);

  for (let i = 0; i < flatShapes.length; i++) {
    const innerPolygon = flatShapes[i];

    let isIn = false;

    for (let j = 0; j < flatShapes.length; j++) {
      if (i === j) {
        continue;
      }
      const outerPolygon = flatShapes[j];

      isIn = isPolygonInPolygon(innerPolygon, outerPolygon);

      if (isIn) {
        holes.push(i);

        if (!shapes[j].holes) {
          shapes[j].holes = [];
        }
        shapes[j].holes.push(flatShapes[i]);
        break;
      }
    }
  }

  holes.reverse().forEach(holeIndex => {
    shapes.splice(holeIndex, 1);
  });

  const poly = shapes.map(shape => {
    const l = shape.map(line => {
      return line.map(p => {
        return [p.x, p.y];
      });
    });

    if (shape.holes) {
      const holes = shape.holes.map(hole => {
        return hole.map(p => {
          return [p.x, p.y];
        });
      });

      return [...l, ...holes];
    }

    return l;
  });

  return poly;
}

export default class Breathe extends Component {
  createShape(userOptions = {}) {
    const {
      imageWidth,
      imageHeight,
      lowPoly,
    } = this.props;

    const options = {
      rng: Math.random,
      cellSize: lowPoly ? 10 : 2,
      threshold: 1,
      circlesCount: 90,
      center: {
        x: imageWidth * 0.4,
        y: imageHeight / 2
      },
      w: imageWidth * 0.66,
      h: imageHeight * 0.5,
      rMax: 13,
      rMin: 2,
      imageWidth,
      imageHeight,
      ...userOptions
    };

    const m = new Metaballs(options);
  
    return flatToMultiPolygon(m.shapes);
  }

  downloadSVG = () => {
    const svg = this.svgElement.outerHTML;
    const name =
      'breathe-' +
      window.location.hash.replace('#/', '').replace(/\//g, '-') +
      '.svg';

    saveAs(`data:application/octet-stream;base64,${btoa(svg)}`, name);
  };

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

  drawPolygon = (polygon, fill, stroke, strokeWidth) => {
    if (!polygon) {
      return;
    }

    let polygons = [];
  
    let d = '';
  
    polygon.forEach((polygonPart, index) => {
      if (polygonPart.length === 1) {
        polygons = [
          ...polygons,
          ...this.drawPolygon(polygonPart, fill, stroke, strokeWidth)
        ];
      }
  
      if (index === 0) {
        d += 'M ' + polygonPart.map(p => `${p[0]} ${p[1]}`).join(' L ') + '';
      } else {
        d +=
          'M ' +
          polygonPart
            .reverse()
            .map(p => `${p[0]} ${p[1]}`)
            .join(' L ') +
          '';
      }
    });
  
    polygons.push(
      <path 
        key={polygon}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
        d={d}
      />
    );

    return polygons;
  }
  
  drawMultiPolygon(
    multiPolygon,
    fill = 'rgba(0, 0, 100, 0.3)',
    stroke = 'none',
    strokeWidth = 10
  ) {
    if (!multiPolygon) {
      return;
    }
  
    let paths = [];
  
    multiPolygon.forEach((polygon, index) => {
      paths = [
        ...paths,
        ...this.drawPolygon(polygon, fill, stroke, strokeWidth)
      ];
    });
  
    return paths;
  }
  

  render() {
    const { 
      imageWidth, 
      imageHeight, 
      shapeOneSeed,
      shapeTwoSeed,
      margin, 
    } = this.props;
    const shapeOneRng = seedrandom(shapeOneSeed);
    const shapeTwoRng = seedrandom(shapeTwoSeed);

    const shape1 = this.createShape({
      rng: shapeOneRng,
    });
    const shape2 = this.createShape({
      rng: shapeTwoRng,
      center: {
        x: imageWidth * 0.6,
        y: imageHeight / 2
      }
    });
    
    const diff1 = fixHoles(martinez.diff(shape1, shape2));
    const diff2 = fixHoles(martinez.diff(shape2, shape1));
    const union = fixHoles(martinez.union(shape1, shape2));
    const intersection = fixHoles(martinez.intersection(shape1, shape2));
    
    return (
      <div className="Image">
        <svg
          viewBox={`${-margin} ${-margin} ${imageWidth + margin * 2} ${imageHeight + margin * 2}`}
          ref={el => (this.svgElement = el)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            {this.drawBackground()}
          </g>
          <g>
            { this.drawMultiPolygon(union, 'none', 'white', 40) }
            { this.drawMultiPolygon(diff1, 'hsl(210, 40%, 50%)') }
            { this.drawMultiPolygon(diff2, 'hsl(190, 40%, 50%)') }
            { this.drawMultiPolygon(intersection, 'hsl(200, 40%, 50%)', 'hsl(200, 40%, 50%)', 1) }
            { this.drawMultiPolygon(union, 'none', 'hsl(220, 40%, 50%)') }
          </g>
        </svg>

        <div className="Image-downloadSection">
          <button className="Image-generateDownload" onClick={this.downloadSVG}>
            Download SVG
          </button>
        </div>
      </div>
    );
  }
}
