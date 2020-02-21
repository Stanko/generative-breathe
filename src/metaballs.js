const cellTypeToPolyCorners = require("./utils/cell-type-to-poly-corners");
const classifyCells = require("./utils/classify-cells");
const metaball = require("./utils/metaball");
const sample = require("./utils/sample");
const threshold = require("./utils/threshold");
const lerp = require("./utils/lerp");
const { normalDistribution, compareVectors } = require("./utils/general");


class Metaballs {
  constructor(options) {
    this.options = {
      threshold: 1.0,
      ...options,
    };

    if (options.circles) {
      this.circles = options.circles;
    } else {
      this.circles = [];
      for (let i = 0; i < options.circlesCount; i++) {
        this.circles.push(this.generateCircle(this.options));
      }
    }

    this.recalculate();
    this.generateShapes();
  }


  generateCircle(options) {
    const circle = {
      x: (Math.random() * options.w * 0.8) - (options.w / 2 * 0.8) + options.center.x,
      y: (Math.random() * options.h * 1) + (normalDistribution() * options.h * 1 * 1) - (options.h / 2 * 2) + options.center.y,
      r: Math.random() * (options.rMax - options.rMin) + options.rMax
    };

    circle.r2 = circle.r * circle.r;

    return circle;
  };

  recalculate() {
    this.samples = sample({
      minX: 0,
      maxX: this.options.imageWidth,
      stepX: this.options.cellSize,
      minY: 0,
      maxY: this.options.imageHeight,
      stepY: this.options.cellSize,
      fn: function(x, y) {
        return metaball(x, y, this.circles);
      }.bind(this)
    });

    this.thresholdedSamples = threshold(this.samples, this.options.threshold);
    this.cellTypes = classifyCells(this.thresholdedSamples);
  };


  /**
   * Given coordinate pairs in (row, col) format, add a line to the list
   */
  addLine(a, b) {
    const x0 = a[1] * this.options.cellSize;
    const y0 = a[0] * this.options.cellSize;
    const x1 = b[1] * this.options.cellSize;
    const y1 = b[0] * this.options.cellSize;

    const line = [{ x: x0, y: y0 }, { x: x1, y: y1 }];

    this.shapes.push(line);
  };


  generateShapes() {
    this.shapes = [];

    for (let i = 0; i < this.cellTypes.length; i++) {
      for (let j = 0; j < this.cellTypes[i].length; j++) {
        const cellType = this.cellTypes[i][j];
        const polyCompassCorners = cellTypeToPolyCorners[cellType];

        // The samples at the 4 corners of the current cell
        const NW = this.samples[i][j];
        const NE = this.samples[i][j+1];
        const SW = this.samples[i+1][j];
        const SE = this.samples[i+1][j+1];

        // The offset from top or left that the line intersection should be.
        const N = (cellType & 4) === (cellType & 8) ? 0.5 : lerp(NW, NE, 0, 1, this.options.threshold);
        const E = (cellType & 2) === (cellType & 4) ? 0.5 : lerp(NE, SE, 0, 1, this.options.threshold);
        const S = (cellType & 1) === (cellType & 2) ? 0.5 : lerp(SW, SE, 0, 1, this.options.threshold);
        const W = (cellType & 1) === (cellType & 8) ? 0.5 : lerp(NW, SW, 0, 1, this.options.threshold);

        const compassCoords = {
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
  };


  makeShapesFromLines() {
    for (let i = 0; i < this.shapes.length; i++) {
      const line1 = this.shapes[i];

      for (let j = 0; j < this.shapes.length; j++) {
        if (i === j) {
          continue;
        }
        const line2 = this.shapes[j];

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
          this.shapes.splice(j, 1);

          this.makeShapesFromLines();
          break;
        }
      };
    }
  }
}

module.exports = Metaballs;
