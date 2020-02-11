/**
 * Linear interpolation function
 */
var lerp = function(x0, x1, y0, y1, x) {
  if (x0 === x1) {
    return null;
  }

  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
};

module.exports = lerp;
