/**
 * Simulation to display metaballs based on bouncing circles.
 */
var cellTypeToPolyCorners = require("./cell-type-to-poly-corners.js");
var classifyCells = require("./classify-cells.js");
var metaball = require("./metaball.js");
var sample = require("./sample.js");
var threshold = require("./threshold.js");
var lerp = require("./lerp.js");


function compareVectors(v1, v2) {
  return v1.x === v2.x && v1.y === v2.y;
}

function normalDistribution() {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = Math.random(); // Converting [0,1) to (0,1)
  }

  while (v === 0) {
    v = Math.random();
  }

  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1

  if (num > 1 || num < 0) {
    return normalDistribution(); // resample between 0 and 1
  }

  return num;
}

var Simulation = function(options) {
  this.draw = options.draw;

  this._svg = options.svg;
  this._canvas = options.canvas;
  this._cellSize = options.cellSize;
  this._threshold = options.threshold || 1.0;
  this._ctx = this._canvas.getContext('2d');

  if (options.circles) {
    this._circles = options.circles;
  } else {
    this._circles = [];
    for (var i = 0; i < options.numCircles; i++) {
      this._circles.push(this.generateCircle(options));
    }
  }

  this.recalculate();
};

/**
 * Returns a shallow clone, with properties passed overriding the properties of
 * the instance being cloned.
 */
Simulation.prototype.clone = function(options) {
  var clone = new Simulation({
    draw: options.draw || this.draw,
    canvas: options.canvas || this._canvas,
    cellSize: options.cellSize || this._cellSize,
    threshold: options.threshold || this._threshold,
    circles: this._circles
  });
  return clone;
};

Simulation.prototype.generateCircle = function(options) {
  
  var circle = {
    x: (Math.random() * options.w * 0.5) + (normalDistribution() * options.w * 0.5) - (options.w / 2) + options.center.x,
    // y: (Math.random() * options.h * 0.85) + (normalDistribution() * options.h * 0.15) - (options.h / 2) + options.center.y,
    y: (Math.random() * options.h * 1) + (normalDistribution() * options.h * 1 * 1) - (options.h / 2 * 2) + options.center.y,
    r: Math.random() * (options.rMax - options.rMin) + options.rMax
  };

  circle.r2 = circle.r * circle.r;

  return circle;
};

Simulation.prototype.recalculate = function() {
  this._samples = sample({
    minX: 0,
    maxX: this._canvas.width,
    stepX: this._cellSize,
    minY: 0,
    maxY: this._canvas.height,
    stepY: this._cellSize,
    fn: function(x, y) {
      return metaball(x, y, this._circles);
    }.bind(this)
  });

  this._thresholdedSamples = threshold(this._samples, this._threshold);
  this._cellTypes = classifyCells(this._thresholdedSamples);
};

/**
 * Draw the background, painting over everything on the canvas.
 */
Simulation.prototype.drawBg = function() {
  this._ctx.fillStyle = "white";
  this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
};


/**
 * Given coordinate pairs in (row, col) format, add a line to the list
 */
Simulation.prototype.addLine = function(a, b) {
  var x0 = a[1] * this._cellSize;
  var y0 = a[0] * this._cellSize;
  var x1 = b[1] * this._cellSize;
  var y1 = b[0] * this._cellSize;

  const line = [{ x: x0, y: y0 }, { x: x1, y: y1 }];

  this.lines.push(line);
};


Simulation.prototype.drawSmoothContours = function() {
  this.lines = [];

  this._ctx.strokeStyle = "white";
  for (var i = 0; i < this._cellTypes.length; i++) {
    for (var j = 0; j < this._cellTypes[i].length; j++) {
      var cellType = this._cellTypes[i][j];
      var polyCompassCorners = cellTypeToPolyCorners[cellType];

      // The samples at the 4 corners of the current cell
      var NW = this._samples[i][j];
      var NE = this._samples[i][j+1];
      var SW = this._samples[i+1][j];
      var SE = this._samples[i+1][j+1];

      // The offset from top or left that the line intersection should be.
      var N = (cellType & 4) === (cellType & 8) ? 0.5 : lerp(NW, NE, 0, 1, this._threshold);
      var E = (cellType & 2) === (cellType & 4) ? 0.5 : lerp(NE, SE, 0, 1, this._threshold);
      var S = (cellType & 1) === (cellType & 2) ? 0.5 : lerp(SW, SE, 0, 1, this._threshold);
      var W = (cellType & 1) === (cellType & 8) ? 0.5 : lerp(NW, SW, 0, 1, this._threshold);

      var compassCoords = {
        "N" : [i    , j + N],
        "W" : [i + W, j    ],
        "E" : [i + E, j + 1],
        "S" : [i + 1, j + S],
      };

      if (polyCompassCorners.length === 2) {
        this.addLine(
          compassCoords[polyCompassCorners[0]],
          compassCoords[polyCompassCorners[1]]
        );
      } else if (polyCompassCorners.length === 4) {
        this.addLine(
          compassCoords[polyCompassCorners[0]],
          compassCoords[polyCompassCorners[1]]
        );
        this.addLine(
          compassCoords[polyCompassCorners[2]],
          compassCoords[polyCompassCorners[3]]
        );
      }
    }
  }

  this.makeShapesFromLines();
  // TODO check for holes

  let d = '';

  // colors = ['blue', 'red', 'green', 'yellow'];
  this.lines.forEach((line, index) => {
    this._ctx.lineWidth = 5;
    this._ctx.strokeStyle = '#7f8c8d';
    this._ctx.fillStyle = '#ecf0f1';

    l = line;
    if (index % 2 === 0) {
      l.reverse();
    }

    d += `M ${ line.map(p => `${ p.x } ${ p.y }`).join(' L ') } Z`;

    this._ctx.beginPath();
    // this._ctx.moveTo(line[0].x, line[0].y);
    line.forEach((p, pIndex) => {
      const next = line[(pIndex + 1) % line.length];
      
      this._ctx.lineTo(p.x, p.y);
      this._ctx.lineTo(next.x, next.y);
    });

    this._ctx.closePath();

    this._ctx.fill();
    this._ctx.stroke();
  });

  this._svg.innerHTML += `<path 
    stroke="#7f8c8d" 
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="#ecf0f1"
    d="${ d }" 
  />`;
};


Simulation.prototype.makeShapesFromLines = function() {
  for (let i = 0; i < this.lines.length; i++) {
    const line1 = this.lines[i];

    for (let j = 0; j < this.lines.length; j++) {
      if (i === j) {
        continue;
      }
      const line2 = this.lines[j];

      const p11 = line1[0];
      const p12 = line1[line1.length - 1];

      const p21 = line2[0];
      const p22 = line2[line2.length - 1];

      let found = false;

      if (compareVectors(p11, p21)) {
        line1.unshift(p22);
        found = true;
      } else if (compareVectors(p11, p22)) {
        line1.unshift(p21);
        found = true;
      } else if (compareVectors(p12, p21)) {
        line1.push(p22);
        found = true;
      } else if (compareVectors(p12, p22)) {
        line1.push(p21);
        found = true;
      } 

      if (found) {
        this.lines.splice(j, 1);

        this.makeShapesFromLines();
        break;
      }
    };
  }
}

module.exports = Simulation;
