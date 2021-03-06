function normalDistribution(rng) {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = rng(); // Converting [0,1) to (0,1)
  }

  while (v === 0) {
    v = rng();
  }

  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1

  if (num > 1 || num < 0) {
    return normalDistribution(); // resample between 0 and 1
  }

  return num;
}

function compareVectors(v1, v2) {
  return v1.x === v2.x && v1.y === v2.y;
}

function createSvg(width, height, margin = 0) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  const totalMargin = margin * 2;

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `${ -margin } ${ -margin } ${ width + totalMargin } ${ height + totalMargin }`);

  svg.setAttribute('width', width + totalMargin);
  svg.setAttribute('height', height + totalMargin);

  return svg;
};

module.exports = {
  normalDistribution,
  compareVectors,
  createSvg,
};