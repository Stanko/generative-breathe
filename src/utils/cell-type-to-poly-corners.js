/**
 * Maps from 0-15 cell classification to compass points indicating a sequence of
 * corners to visit to form a polygon based on the pmapping described on
 * http://en.wikipedia.org/wiki/Marching_squares
 */
module.exports = {
  // ..
  // ..
  0: [],

  // ..
  // #.
  1: ["W", "S"],

  // ..
  // .#
  2: ["E", "S"],

  // ..
  // ##
  3: ["W", "E"],

  // .#
  // ..
  4: ["N", "E"],

  // .#
  // #.
  5: ["N", "W", "S", "E"],

  // .#
  // .#
  6: ["N", "S"],

  // .#
  // ##
  7: ["N", "W"],

  // #.
  // ..
  8: ["N", "W"],

  // #.
  // #.
  9: ["N", "S"],

  // #.
  // .#
  10: ["N", "E", "S", "W"],

  // #.
  // ##
  11: ["N", "E"],

  // ##
  // ..
  12: ["E", "W"],

  // ##
  // #.
  13: ["E", "S"],

  // ##
  // .#
  14: ["S", "W"],

  // ##
  // ##
  15: []
};
