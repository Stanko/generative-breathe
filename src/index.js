import Metaballs from './metaballs';
import { createSvg, normalDistribution } from './utils/general';
import * as martinez from 'martinez-polygon-clipping';
import seedrandom from 'seedrandom';
import { isPolygonInPolygon } from '../../generative-utils/points';

const seed =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const rng = seedrandom(seed);

Math.random = rng;

console.log('RNG seed: ' + seed);

const width = 1000;
const height = 1500;

const svg = createSvg(width, height);

document.querySelector('#seed').innerHTML = seed;
document.body.prepend(svg);

svg.innerHTML = `
<pattern 
  id="vertical-lines" 
  width="10" 
  height="10" 
  patternUnits="userSpaceOnUse"
>
  <rect x="0" y="0" height="100%" width="100%" fill="#f3f4f6" />
  <line x1="3" y1="0" x2="3" y2="100%" stroke="#f06d01" stroke-width="2" />
</pattern>
<pattern 
  id="horizontal-lines" 
  width="10" 
  height="10" 
  patternUnits="userSpaceOnUse"
>
  <rect x="0" y="0" height="100%" width="100%" fill="#f3f4f6" />
  <line x1="0" y1="3" x2="100%" y2="3" stroke="#8dbfb6" stroke-width="2" />
</pattern>
`;

function drawPolyFromArray(
  polygon,
  fill = 'url(#horizontal-lines)',
  stroke = 'none'
) {
  svg.innerHTML += `<path 
    stroke="${stroke}" 
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="${fill}"
    d="M ${polygon.map(p => `${p[0]} ${p[1]}`).join(' L ')} Z"
  />`;
}

function drawBackground() {
  const step = 20;
  for (let i = 0; i < height; i += step) {
    let y1 = i + Math.floor(Math.random() * step) * 0.66;
    let y2 = i + Math.floor(Math.random() * step) * 0.66;
    const lineWidth = 5 + Math.floor((Math.random() * step) / 2);

    svg.innerHTML += `<path 
      fill="hsl(${180 + Math.random() * 40}, 40%, 60%)" 
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      d="M 0 ${y1} L ${width} ${y2} L ${width} ${y2 + lineWidth} L ${0} ${y1 +
      lineWidth} Z"
    />`;
  }
}

drawBackground();

function drawPolygon(polygon, fill, stroke, strokeWidth) {
  if (!polygon) {
    return;
  }

  let d = '';

  polygon.forEach((polygonPart, index) => {
    if (polygonPart.length === 1) {
      drawPolygon(polygonPart, fill, stroke, strokeWidth);
      return;
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

  svg.innerHTML += `<path 
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

  multiPolygon.forEach((polygon, index) => {
    drawPolygon(polygon, fill, stroke, strokeWidth);
  });
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
    numCircles: 90,
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

  const poly = flatToMultiPolygon(m.shapes);

  let d = '';

  m.shapes.forEach((line, index) => {
    d += `M ${line.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
  });

  // svg.innerHTML += `<path
  //   stroke="black"
  //   stroke-width="1"
  //   stroke-linecap="round"
  //   stroke-linejoin="round"
  //   fill="none"
  //   d="${ d }"
  // />`;

  return poly;
}

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

drawMultiPolygon(union, 'none', 'white', 40);
drawMultiPolygon(diff1, 'hsl(210, 40%, 50%)');
drawMultiPolygon(diff2, 'hsl(190, 40%, 50%)');
drawMultiPolygon(intersection, 'hsl(200, 40%, 50%)');
drawMultiPolygon(union, 'none', 'hsl(220, 40%, 50%)');
