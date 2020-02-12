const p5 = require("p5");
const streamlines = require("@anvaka/streamlines");
const Metaballs = require("./metaballs");
const { createSvg } = require("./utils/general");

const width = 800;
const height = 1200;
const xStep = 200;
const yStep = 300;
const xMax = width / xStep - 1;
const yMax = height / yStep - 1;


const svg = createSvg(width, height);

window.setup = function() {
  noLoop();
  // noiseSeed(99);

  // const vectors = generateField(width / 50, height / 50, 50);

  // vectors.forEach(row => {
  //   row.forEach(v => {
  //     svg.innerHTML += `<path 
  //       stroke="blue"
  //       fill="none"
  //       d="M ${ v.startX } ${ v.startY } L ${ v.endX } ${ v.endY } L ${ v.endX + 6 } ${ v.endY + 10 }"
  //     />`;
  //   });
  // });

  streamlines({
    vectorField: p => {
      const n = noise(p.x / 400, p.y / 100);
      let sign; // = p.x > width / 3 ? -0.8 : 0.8;
      
      let diff = width * 0.33 - p.x;
      diff = diff / (width * 0.33) * 0.7;

      if (diff > 0) {
        sign = 1 - diff;
      } else {
        sign = - 1 - diff * 0.66;
      }
      // 300
      

      const a = n * sign * Math.PI;
      
      const x = Math.cos(a) * 10;
      const y = Math.sin(a) * 10;

      return {
        x,
        y,
      };
    },
    // Defines bounding box of the vector field
    boundingBox: { left: 0, top: 0, width, height },

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

      let stroke = '#ddd';

      if (
        Math.abs(points[0].x - (width / 2)) > width * 0.18 && 
        points[0].y > height * 0.99
      ) {
        stroke = 'blue';
        return;
      } 

      if (
        Math.abs(points[points.length - 1].x - (width / 2)) > width * 0.18 && 
        points[points.length - 1].y > height * 0.99
      ) {
        stroke = 'blue';
        return;
      } 

      for (let i = 0; i < points.length; i += 10) {
        const p = points[i];
        svg.innerHTML += `<circle cx="${ p.x }" cy="${ p.y }" r="2" />`;
      }

      svg.innerHTML += `<path 
        stroke="${ stroke }"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M ${ points.map(p => `${ p.x } ${ p.y }`).join(' L ') }"
      />`;
    }
  }).run();

  // createLayer();

  document.body.prepend(svg);
}


function createLayer() {
  for (let x = 1; x <= xMax; x++) {
    for (let y = 1; y <= yMax; y++) {
      const m = new Metaballs({
        svg,
        cellSize: 2,
        threshold: 1, 
        numCircles: 22,
        center: {
          x: x * xStep,
          y: y * yStep,
        },
        w: 100 + 100 * Math.random(),
        h: 120 + 100 * Math.random(),
        rMax: 6,
        rMin: 1, 
        imageWidth: width,
        imageHeight: height,
      });
    
      draw(svg, m.shapes);
    }
  }

}

function draw(svg, shapes) {
  // TODO check for holes

  let d = '';

  // colors = ['blue', 'red', 'green', 'yellow'];
  shapes.forEach((line, index) => {
    l = line;
    if (index % 2 === 0) {
      l.reverse();
    }

    d += `M ${ line.map(p => `${ p.x } ${ p.y }`).join(' L ') } Z`;
  });

  // transform="rotate(-10 50 100) angle center.x center.y

  svg.innerHTML += `<path 
    stroke="#7f8c8d" 
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="#ecf0f1"
    fill="none"
    d="${ d }" 
  />`;
}

function generateField(rows, columns, step) {
  const vectors = [];

  for (let i = 0; i <= rows; i++) {
    vectors[i] = [];

    for (let j = 0; j <= columns; j++) {
      const x = i * step;
      const y = j * step;
      const n = noise(i / 400, j / 1-0);
      const a = n * -Math.PI / 2 - Math.PI / 4;
      
      const directionVector = { x: 0, y: 0 };
            
      const vectorX = Math.cos(a) * step + directionVector.x;
      const vectorY = Math.sin(a) * step + directionVector.y;
      
      const endX = x + vectorX;
      const endY = y + vectorY;
      
      vectors[i][j] = {
        startX: x,
        startY: y,
        endX,
        endY,
        angle: a,
        vectorX,
        vectorY,
      };
    }
  }

  return vectors;
}