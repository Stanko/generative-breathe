var Simulation = require("./simulation.js");

var width = 600;
var height = 500;

var newCanvas = function() {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // document.body.appendChild(canvas);
  return canvas;
};

var newSvg = function() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${ width } ${ height }`);

  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  document.body.appendChild(svg);
  return svg;
};

var simulation = new Simulation({
  canvas: newCanvas(),
  svg: newSvg(),
  cellSize: 2,
  threshold: 1, 
  numCircles: 22,
  center: {
    x: width * 0.25,
    y: height / 2,
  },
  w: 140,
  h: 180,
  rMax: 6,
  rMin: 1, 
  draw: function() {
    this.drawBg();
    this.drawSmoothContours();
  }
});

var simulation2 = new Simulation({
  canvas: simulation._canvas,
  svg: simulation._svg,
  cellSize: 2,
  threshold: 1, 
  numCircles: 22,
  center: {
    x: width * 0.5,
    y: height / 2,
  },
  w: 140,
  h: 180,
  rMax: 6,
  rMin: 1, 
  draw: function() {
    // this.drawBg();
    this.drawSmoothContours();
  }
});

var simulation3 = new Simulation({
  canvas: simulation._canvas,
  svg: simulation._svg,
  cellSize: 2,
  threshold: 1, 
  numCircles: 22,
  center: {
    x: width * 0.75,
    y: height / 2,
  },
  w: 140,
  h: 180,
  rMax: 6,
  rMin: 1,
  draw: function() {
    // this.drawBg();
    this.drawSmoothContours();
  }
});

simulation.draw();
simulation2.draw();
simulation3.draw();

