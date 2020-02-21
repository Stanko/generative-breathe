import * as martinez from 'martinez-polygon-clipping';
import seedrandom from 'seedrandom';
import * as dat from 'dat.gui';

import Metaballs from './metaballs';
import { createSvg } from './utils/general';
import { isPolygonInPolygon } from '../../generative-utils/points';


function drawBackground() {
  const step = 20;
  
  let g = '<g>';

  for (let i = 0; i < height; i += step) {
    let y1 = i + Math.floor(Math.random() * step) * 0.66;
    let y2 = i + Math.floor(Math.random() * step) * 0.66;
    const lineWidth = 5 + Math.floor((Math.random() * step) / 2);

    g += `<path 
      fill="hsl(${180 + Math.random() * 40}, 40%, 60%)" 
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      d="M 0 ${y1} L ${width} ${y2} L ${width} ${y2 + lineWidth} L ${0} ${y1 +
      lineWidth} Z"
    />`;
  }

  g += '</g>';

  svg.innerHTML += g;
}

function drawPolygon(polygon, fill, stroke, strokeWidth) {
  if (!polygon) {
    return;
  }

  let d = '';

  polygon.forEach((polygonPart, index) => {
    if (polygonPart.length === 1) {
      g += drawPolygon(polygonPart, fill, stroke, strokeWidth);
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

  return `<path 
    stroke="${stroke}" 
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="${fill}"
    d="${d}"
  />`;
}

function drawMultiPolygon(
  multiPolygon,
  fill = 'rgba(0, 0, 100, 0.3)',
  stroke = 'none',
  strokeWidth = 10
) {
  if (!multiPolygon) {
    return;
  }

  let path = '';

  multiPolygon.forEach((polygon, index) => {
    path += drawPolygon(polygon, fill, stroke, strokeWidth);
  });

  return path;
}

function flattenPolygon(polygon) {
  const flat = [];

  polygon.forEach((polygonPart, index) => {
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

  multiPolygon.forEach((polygon, index) => {
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

function createShape(userOptions = {}) {
  const options = {
    svg,
    cellSize: 2,
    threshold: 1,
    circlesCount: 90,
    center: {
      x: width * 0.4,
      y: height / 2
    },
    w: width * 0.66,
    h: height * 0.5,
    rMax: 13,
    rMin: 2,
    imageWidth: width,
    imageHeight: height,
    ...userOptions
  };

  const m = new Metaballs(options);

  return flatToMultiPolygon(m.shapes);
}

function createSeed() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


const Options = function() {
};

const ShapeOptions = function() {
  this.seed = createSeed();
  this.cellSize = 2;
  this.threshold = 1;
  this.circlesCount = 90;
  this.centerX = 0.4;
  this.centerY = 0.4;
  this.w = 0.66;
  this.h = 0.5;
  this.rMax = 13;
  this.rMin = 2;
};

const options = new Options();

function createShapeGui(gui, label) {
  const shapeOptions = new ShapeOptions();
  const folder = gui.addFolder(label);

  options[label] = shapeOptions;

  const controllers = [];

  controllers.push(folder.add(shapeOptions, 'seed'));
  controllers.push(folder.add(shapeOptions, 'cellSize', 1, 5));
  controllers.push(folder.add(shapeOptions, 'threshold', 0.1, 3, 0.1));
  controllers.push(folder.add(shapeOptions, 'circlesCount', 50, 150));
  controllers.push(folder.add(shapeOptions, 'centerX', 0, 1, 0.05));
  controllers.push(folder.add(shapeOptions, 'centerY', 0, 1, 0.05));
  controllers.push(folder.add(shapeOptions, 'w', 0, 1, 0.05));
  controllers.push(folder.add(shapeOptions, 'h', 0, 1, 0.05));
  controllers.push(folder.add(shapeOptions, 'rMin', 1, 20));
  controllers.push(folder.add(shapeOptions, 'rMax', 1, 20));

  controllers.forEach(controller => {
    controller.onFinishChange((a, b, c) => {
      // TODO draw shapes
    });
  });
}

// Main

const gui = new dat.GUI();

createShapeGui(gui, 'shapeOne');
createShapeGui(gui, 'shapeTwo');


const seed = createSeed();
const rng = seedrandom(seed);

Math.random = rng;

console.log('RNG seed: ' + seed);

const width = 1000;
const height = 1500;

const svg = createSvg(width, height, 100);

document.querySelector('#seed').innerHTML = seed;
document.body.prepend(svg);

drawBackground();

const shape1 = createShape();
const shape2 = createShape({
  center: {
    x: width * 0.6,
    y: height / 2
  }
});

const diff1 = fixHoles(martinez.diff(shape1, shape2));

const diff2 = fixHoles(martinez.diff(shape2, shape1));

const union = fixHoles(martinez.union(shape1, shape2));

const intersection = fixHoles(martinez.intersection(shape1, shape2));

let shapes = '<g>';
shapes += drawMultiPolygon(union, 'none', 'white', 40);
shapes += drawMultiPolygon(diff1, 'hsl(210, 40%, 50%)');
shapes += drawMultiPolygon(diff2, 'hsl(190, 40%, 50%)');
shapes += drawMultiPolygon(intersection, 'hsl(200, 40%, 50%)', 'hsl(200, 40%, 50%)', 1);
shapes += drawMultiPolygon(union, 'none', 'hsl(220, 40%, 50%)');
shapes += '</g>';

svg.innerHTML += shapes;
