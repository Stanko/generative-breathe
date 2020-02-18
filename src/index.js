import 'p5';
import streamlines from '@anvaka/streamlines';
import Metaballs from './metaballs';
import { createSvg, normalDistribution } from './utils/general';
import * as martinez from 'martinez-polygon-clipping';
import { fatLine } from 'generative-utils/svg/fat-line';

const width = 1000;
const height = 1500;

const svg = createSvg(width, height);

svg.innerHTML = `
<pattern 
  id="vertical-lines" 
  width="5" 
  height="5" 
  patternUnits="userSpaceOnUse"
>
  <rect x="0" y="0" height="100%" width="100%" fill="white" />
  <line x1="0" y1="0" x2="0" y2="100%" stroke="#f06d01" stroke-width="2" />
</pattern>
<pattern 
  id="horizontal-lines" 
  width="20" 
  height="10" 
  patternUnits="userSpaceOnUse"
>
  <rect x="0" y="0" height="100%" width="100%" fill="white" />
  <line x1="0" y1="0" x2="100%" y2="0" stroke="#8dbfb6" stroke-width="4" />
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

function getShapesPolygon() {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: []
    }
  };
}

drawPolyFromArray(
  [
    [0, 0],
    [0, height],
    [width, height],
    [width, 0]
  ],
  '#e2dbd3'
);

window.setup = function() {
  streamlines({
    vectorField: p => {
      const n = noise(p.x / 100, p.y / 100);
      let sign; // = p.x > width / 3 ? -0.8 : 0.8;

      let diff = width * 0.33 - p.x;
      diff = (diff / (width * 0.33)) * 0.7;

      if (diff > 0) {
        sign = 1 - diff;
      } else {
        sign = -1 - diff * 0.66;
      }
      // 300

      const a = n * sign * Math.PI;

      const x = Math.cos(a) * 10;
      const y = Math.sin(a) * 10;

      return {
        x,
        y
      };
    },
    // Defines bounding box of the vector field
    boundingBox: { left: 0, top: 0, width: width, height: height },

    // Defines the first point where integration should start. If this is
    // not specified a random point inside boundingBox is selected
    seed: { x: width / 2, y: height },

    // Separation distance between new streamlines.
    dSep: 50,

    // Distance between streamlines when integration should stop.
    dTest: 30,

    // Integration time step (passed to RK4 method.)
    timeStep: 10,

    onStreamlineAdded(points) {
      // Points is just a sequence of points with `x, y` coordinates through which
      // the streamline goes.

      let stroke = '#333';

      if (
        Math.abs(points[0].x - lineWidth / 2) > lineWidth * 0.1 &&
        Math.abs(points[0].y - height) < 10
      ) {
        stroke = 'blue';
        return;
      }

      if (
        Math.abs(points[points.length - 1].x - lineWidth / 2) > lineWidth * 0.1 &&
        Math.abs(points[points.length - 1].y - height) < 10
      ) {
        stroke = 'blue';
        return;
      }

      // d="M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}"
      const lineWidth = Math.floor(Math.random() * 5) + 3;
      const fn = (x, totalLength) => {
        return Math.sin(x * Math.PI) * lineWidth + 3;
      };
      svg.innerHTML += `<path 
        stroke="${stroke}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="${fatLine(points, fn)}"
      />`;
    }
  }).run();

  const m = new Metaballs({
    svg,
    cellSize: 2,
    threshold: 1,
    numCircles: 90,
    center: {
      x: width / 2,
      y: height / 2
    },
    w: width,
    h: height * 0.5,
    rMax: 13,
    rMin: 2,
    imageWidth: width,
    imageHeight: height
  });

  const polygon1 = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [width * 0.66, 0],
          [width * 0.33, height],
          [0, height]
        ]
      ]
    }
  };

  const polygon2 = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [width, 0],
          [width * 0.66, 0],
          [width * 0.33, height],
          [width, height]
        ]
      ]
    }
  };

  this.setTimeout(() => {
    // let d = '';

    m.shapes.forEach((line, index) => {
      let l = line;
      if (index % 2 === 0) {
        l.reverse();
      }

      const shapesPolygon = getShapesPolygon();
      shapesPolygon.geometry.coordinates.push(line.map(p => [p.x, p.y]));

      const intersection = martinez.intersection(
        polygon1.geometry.coordinates,
        shapesPolygon.geometry.coordinates
      );
      if (intersection) {
        intersection.forEach(polygon => {
          drawPolyFromArray(polygon[0], '#ee6b00', '#151414');
        });
      }

      const intersection2 = martinez.intersection(
        polygon2.geometry.coordinates,
        shapesPolygon.geometry.coordinates
      );
      if (intersection2) {
        intersection2.forEach(polygon => {
          drawPolyFromArray(polygon[0], '#8dbfb6', '#151414');
        });
      }

      // d += `M ${ line.map(p => `${ p.x } ${ p.y }`).join(' L ') } Z`;
    });

    // fill="#ecf0f1"
    // svg.innerHTML += `<path
    //   stroke="blue"
    //   stroke-width="2"
    //   stroke-linecap="round"
    //   stroke-linejoin="round"
    //   fill="none"
    //   d="${ d }"
    // />`;

    document.body.prepend(svg);
  }, 2000);
};
