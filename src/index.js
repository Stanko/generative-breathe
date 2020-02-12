const Metaballs = require("./metaballs");
const { createSvg } = require("./utils/general");

const width = 1000;
const height = 1200;
const xStep = 200;
const yStep = 300;
const xMax = width / xStep - 1;
const yMax = height / yStep - 1;


const svg = createSvg(width, height);

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


document.body.appendChild(svg);

createLayer();


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