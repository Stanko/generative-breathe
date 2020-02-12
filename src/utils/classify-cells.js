/**
 * Given a nxm grid of booleans, produce an (n-1)x(m-1) grid of square classifications
 * following the marching squares algorithm here:
 * http://en.wikipedia.org/wiki/Marching_squares
 * The input grid used as the values of the corners.
 *
 * The output grid is a 2D array of values 0-15
 */
var classifyCells = function(corners) {
  var ret = [];

  for (var i = 0; i < corners.length - 1; i++) {
    ret.push([]);
    for (var j = 0; j < corners[i].length - 1; j++) {
      var NW = corners[i][j];
      var NE = corners[i][j+1];
      var SW = corners[i+1][j];
      var SE = corners[i+1][j+1];

      ret[i].push(
        (SW << 0) +
        (SE << 1) +
        (NE << 2) +
        (NW << 3)
      );
    }
  }

  return ret;
};

module.exports = classifyCells;
