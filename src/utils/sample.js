/**
 * Sample an f(x, y) in a 2D grid.
 */
var sample = function(options) {
  var maxX = options.maxX;
  var stepX = options.stepX;

  var maxY = options.maxY;
  var stepY = options.stepX;

  var fn = options.fn;

  var numRows = Math.ceil(maxY / stepY);
  var numCols = Math.ceil(maxX / stepX);

  var samples = [];

  for (var row = 0; row <= numRows; row++) {
    var y = row * stepY;
    samples.push([]);
    for (var col = 0; col <= numCols; col++) {
      var x = col * stepX;
      samples[row].push(fn(x, y));
    }
  };

  return samples;
};

module.exports = sample;
