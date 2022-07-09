let { GWE } = require('gwe');

let DIRECTION = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD'
};

let DIRECTION_TO_VEC3 = {
  LEFT: GWE.Utils.VEC3_LEFT,
  RIGHT: GWE.Utils.VEC3_RIGHT,
  FORWARD: GWE.Utils.VEC3_FORWARD,
  BACKWARD: GWE.Utils.VEC3_BACKWARD
};

module.exports.DIRECTION = DIRECTION;
module.exports.DIRECTION_TO_VEC3 = DIRECTION_TO_VEC3;