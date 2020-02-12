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

function compareVectors(v1, v2) {
  return v1.x === v2.x && v1.y === v2.y;
}

function createSvg(width, height) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${ width } ${ height }`);

  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  return svg;
};

module.exports = {
  normalDistribution,
  compareVectors,
  createSvg,
};