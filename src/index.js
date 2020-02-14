const p5 = require("p5");
const streamlines = require("@anvaka/streamlines");
const Metaballs = require("./metaballs");
const { createSvg, normalDistribution } = require("./utils/general");

const margin = 100;
const width = 1600;
const height = 1000;
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

  const layer1 = [];
  const layer2 = [];

  streamlines({
    vectorField: p => {
      const n = noise(p.x / 100, p.y / 100);
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
    boundingBox: { left: margin, top: margin, width: width - 2 * margin, height: height - 2 * margin },

    // Defines the first point where integration should start. If this is
    // not specified a random point inside boundingBox is selected
    seed: { x: (width - 2 * margin) / 2, y: height - 2 * margin },

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
        Math.abs(points[0].x - (width / 2)) > width * 0.1 && 
        Math.abs(points[0].y - (height - margin)) < 10
      ) {
        stroke = 'blue';
        return;
      } 

      if (
        Math.abs(points[points.length - 1].x - (width / 2)) > width * 0.1 && 
        Math.abs(points[points.length - 1].y - (height - margin)) < 10
      ) {
        stroke = 'blue';
        return;
      } 

      for (let i = 0; i < points.length; i += 10) {
        const point = points[i];
        const nextPoint = points[i + 5];

        if (nextPoint) {
          const dy = nextPoint.y - point.y;
          const dx = nextPoint.x - point.x;
          point.angle = Math.atan2(dy, dx); // range (-PI, PI]
          
          // svg.innerHTML += `<circle cx="${ point.x }" cy="${ point.y }" r="2" />`;
          layer1.push(point);

          // svg.innerHTML += `<path 
          //   stroke="#3498db" 
          //   stroke-width="3"
          //   stroke-linecap="round"
          //   stroke-linejoin="round"
          //   fill="none"
          //   d="
          //     M ${ point.x } ${ point.y }
          //     L ${ nextPoint.x } ${ nextPoint.y }
          //   "
          // />`;
        }
      }

      // svg.innerHTML += `<path 
      //   stroke="${ stroke }"
      //   stroke-width="1"
      //   stroke-linecap="round"
      //   stroke-linejoin="round"
      //   fill="none"
      //   d="M ${ points.map(p => `${ p.x } ${ p.y }`).join(' L ') }"
      // />`;
    }
  }).run();

  streamlines({
    vectorField: p => {
      const n = noise(p.x / 100, p.y / 100);
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
    boundingBox: { left: margin, top: margin, width: width - 2 * margin, height: height - 2 * margin },

    // Defines the first point where integration should start. If this is
    // not specified a random point inside boundingBox is selected
    seed: { x: (width - 2 * margin) / 2, y: height - 2 * margin },

    // Separation distance between new streamlines.
    dSep: 20,

    // Distance between streamlines when integration should stop.
    dTest: 8,

    // Integration time step (passed to RK4 method.)
    timeStep: 10,

    onStreamlineAdded(points) {
      // Points is just a sequence of points with `x, y` coordinates through which
      // the streamline goes.

      let stroke = '#ddd';

      if (
        Math.abs(points[0].x - (width / 2)) > width * 0.1 && 
        Math.abs(points[0].y - (height - margin)) < 10
      ) {
        stroke = 'blue';
        return;
      } 

      if (
        Math.abs(points[points.length - 1].x - (width / 2)) > width * 0.1 && 
        Math.abs(points[points.length - 1].y - (height - margin)) < 10
      ) {
        stroke = 'blue';
        return;
      }

      // for (let i = 0; i < points.length; i += 3) {
      //   const point = points[i];
      //   const nextPoint = points[i + 5];

      //   if (nextPoint) {
      //     const dy = nextPoint.y - point.y;
      //     const dx = nextPoint.x - point.x;
      //     point.angle = Math.atan2(dy, dx); // range (-PI, PI]
          
      //     // svg.innerHTML += `<circle cx="${ point.x }" cy="${ point.y }" r="2" />`;
      //     layer2.push(point);
      //   }
      // }

      svg.innerHTML += `<path 
        stroke="${ stroke }"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
        d="M ${ points.map(p => `${ p.x } ${ p.y }`).join(' L ') }"
      />`;
    }
  }).run();


  // setTimeout(() => {
  //   createLayer(layer2, {
  //     cellSize: 1,
  //     numCircles: 3,
  //     w: 10 + 10 * Math.random(),
  //     h: 15 + 10 * Math.random(),
  //     color: "#afbcbd",
  //     rMax: 0.6,
  //     rMin: 0.1, 
  //   });
  //   console.log('layer 2');
  // }, 2000);

  setTimeout(() => {
    createLayer(layer1);
    console.log('layer 1');
  }, 3000);

  document.body.prepend(svg);
}


function createLayer(layer, options = {}) {
  options = {
    cellSize: 2,
    numCircles: 22,
    w: 20 + 60 * normalDistribution(),
    h: 20 + 120 * normalDistribution(),
    color: "#7f8c8d",
    rMax: 2,
    rMin: 0.2, 
    ...options,
  };
  
  layer.forEach(point => {
    let m = {};
    m = new Metaballs({
      svg,
      cellSize: options.cellSize,
      threshold: 1, 
      numCircles: options.numCircles,
      center: point,
      w: options.w,
      h: options.h,
      rMax: options.rMax,
      rMin: options.rMin,
      imageWidth: width,
      imageHeight: height,
    });
  
    draw(svg, m.shapes, point, options.color);
  });
}

function draw(svg, shapes, point = null, color = "#7f8c8d") {
  let rotation = '';

  if (point.angle) {
    rotation = `rotate(${ (point.angle + Math.PI / 2) * 180 / Math.PI }, ${ point.x }, ${ point.y })`;
  }

  if (!shapes) {
    // Draws a rectangle instead of the shape
    svg.innerHTML += `<path 
    stroke="${ color }" 
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      d="
        M ${ point.x - 2 } ${ point.y - 4 }
        L ${ point.x + 2 } ${ point.y - 4 }
        L ${ point.x + 2 } ${ point.y + 4 }
        L ${ point.x - 2 } ${ point.y + 4 }
        Z
      "
      transform="${ rotation }"
    />`;
    return;
  }
  
  let d = '';

  // colors = ['blue', 'red', 'green', 'yellow'];
  shapes.forEach((line, index) => {
    l = line;
    if (index % 2 === 0) {
      l.reverse();
    }

    d += `M ${ line.map(p => `${ p.x } ${ p.y }`).join(' L ') } Z`;
  });

  // fill="#ecf0f1"
  svg.innerHTML += `<path 
    stroke="${ color }" 
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
    d="${ d }"
    transform="${ rotation }"
  />`;
}

function generateField(rows, columns, step) {
  const vectors = [];

  for (let i = 0; i <= rows; i++) {
    vectors[i] = [];

    for (let j = 0; j <= columns; j++) {
      const x = i * step;
      const y = j * step;
      const n = noise(i / 400, j / 100);
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