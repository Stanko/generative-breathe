var metaball = function(x, y, circles) {
  var sum = 0;
  for (var i = 0; i < circles.length; i++) {
    var c = circles[i];
    var dx = x - c.x;
    var dy = y - c.y;

    var d2 = dx * dx + dy * dy;
    sum += c.r2 / d2;
  }
  return sum;
};

module.exports = metaball;
