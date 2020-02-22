import React, { PureComponent } from 'react';
import { isPolygonInPolygon } from 'generative-utils/points';
import * as martinez from 'martinez-polygon-clipping';
import seedrandom from 'seedrandom';
import Metaballs from '../metaballs';


function flattenPolygon(polygon) {
  if (!polygon) {
    return;
  }

  const flat = [];

  polygon.forEach((polygonPart) => {
    if (polygonPart.length === 1) {
      flat.push(...flattenPolygon(polygonPart));
    } else {
      flat.push(polygonPart);
    }
  });

  return flat;
}

function fixHoles(multiPolygon) {
  if (!multiPolygon) {
    return;
  }

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

export default class Shapes extends PureComponent {
  createShape(options) {
    const m = new Metaballs(options);
  
    return flatToMultiPolygon(m.shapes);
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
    const shapeOneRng = seedrandom(shapeOneSeed);
    const shapeTwoRng = seedrandom(shapeTwoSeed);

    const shape1 = this.createShape({
      rng: shapeOneRng,
      cellSize: lowPoly ? 10 : cellSizeShapeOne,
      threshold: thresholdShapeOne,
      circlesCount: circlesCountShapeOne,
      center: {
        x: imageWidth * centerXShapeOne,
        y: imageHeight * centerYShapeOne,
      },
      w: imageWidth * wShapeOne,
      h: imageHeight * hShapeOne,
      rMax: rMaxShapeOne,
      rMin: rMinShapeOne,
      imageWidth, 
      imageHeight,
    });
    const shape2 = this.createShape({
      rng: shapeTwoRng,
      cellSize: lowPoly ? 10 : cellSizeShapeTwo,
      threshold: thresholdShapeTwo,
      circlesCount: circlesCountShapeTwo,
      center: {
        x: imageWidth * centerXShapeTwo,
        y: imageHeight * centerYShapeTwo,
      },
      w: imageWidth * wShapeTwo,
      h: imageHeight * hShapeTwo,
      rMax: rMaxShapeTwo,
      rMin: rMinShapeTwo,
      imageWidth, 
      imageHeight,
    });
    
    const diff1 = fixHoles(martinez.diff(shape1, shape2));
    const diff2 = fixHoles(martinez.diff(shape2, shape1));
    const union = fixHoles(martinez.union(shape1, shape2));
    const intersection = fixHoles(martinez.intersection(shape1, shape2));

    return (
      <g>
        { this.drawMultiPolygon(union, 'none', 'white', 40) }
        { this.drawMultiPolygon(diff1, 'hsl(210, 40%, 50%)') }
        { this.drawMultiPolygon(diff2, 'hsl(190, 40%, 50%)') }
        { this.drawMultiPolygon(intersection, 'hsl(200, 40%, 50%)', 'hsl(200, 40%, 50%)', 1) }
        { this.drawMultiPolygon(union, 'none', 'hsl(220, 40%, 50%)') }
      </g>
    );
  }
}
