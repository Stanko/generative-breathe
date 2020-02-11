/**
 * Convert a grid of continuous values to a
 * grid of booleans.
 */
var threshold = function(grid, value) {
  var ret = [];

  for (var i = 0; i < grid.length; i++) {
    ret.push([]);
    for (var j = 0; j < grid[i].length; j++) {
      ret[i].push(grid[i][j] > value);
    }
  }

  return ret;
};

module.exports = threshold;
