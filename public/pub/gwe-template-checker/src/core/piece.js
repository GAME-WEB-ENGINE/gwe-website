let { COLOR, PIECE_TYPE, ELEMENT } = require('./enums');
let { Move } = require('./move');

let PATH_FORWARD_1XRIGHT = [[+1, +1]];
let PATH_FORWARD_1XLEFT = [[-1, +1]];
let PATH_BACKWARD_1XRIGHT = [[+1, -1]];
let PATH_BACKWARD_1XLEFT = [[-1, -1]];
let PATH_FORWARD_2XRIGHT = [[+1, +1], [+2, +2]];
let PATH_FORWARD_2XLEFT = [[-1, +1], [-2, +2]];
let PATH_BACKWARD_2XRIGHT = [[+1, -1], [+2, -2]];
let PATH_BACKWARD_2XLEFT = [[-1, -1], [-2, -2]];
let PATH_DIAG_FORWARD_RIGHT = [[+1, +1], [+2, +2], [+3, +3], [+4, +4], [+5, +5], [+6, +6], [+7, +7], [+8, +8], [+9, +9]];
let PATH_DIAG_FORWARD_LEFT = [[-1, +1], [-2, +2], [-3, +3], [-4, +4], [-5, +5], [-6, +6], [-7, +7], [-8, +8], [-9, +9]];
let PATH_DIAG_BACKWARD_RIGHT = [[+1, -1], [+2, -2], [+3, -3], [+4, -4], [+5, -5], [+6, -6], [+7, -7], [+8, -8], [+9, -9]];
let PATH_DIAG_BACKWARD_LEFT = [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7], [-8, -8], [-9, -9]];

class Piece {
  constructor(options = {}) {
    this.backgroundImage = options.backgroundImage ?? '';
    this.color = options.color ?? COLOR.BLACK;
    this.type = options.type ?? PIECE_TYPE.PAWN;
    this.element = options.element ?? ELEMENT.WATER;
    this.powerupId = options.powerupId ?? '';
    this.moves = options.moves ?? [];
  }

  getBackgroundImage() {
    return this.backgroundImage;
  }

  getColor() {
    return this.color;
  }

  setColor(color) {
    this.color = color;
  }

  getType() {
    return this.type;
  }

  setType(type) {
    this.type = type;
  }

  getElement() {
    return this.element;
  }

  setElement(element) {
    this.element = element;
  }

  getPowerupId() {
    return this.powerupId;
  }

  setPowerupId(powerupId) {
    this.powerupId = powerupId;
  }

  getMoves() {
    return this.moves;
  }
}

class Pawn extends Piece {
  constructor(color) {
    super({
      backgroundImage: color == COLOR.BLACK ? './assets/textures/black_pawn.png' : './assets/textures/white_pawn.png',
      color: color,
      type: PIECE_TYPE.PAWN,
      element: ELEMENT.DARK,
      powerupId: 'KILL',
      moves: [
        new Move({ path: color == COLOR.BLACK ? PATH_FORWARD_1XRIGHT : PATH_BACKWARD_1XRIGHT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: color == COLOR.BLACK ? PATH_FORWARD_1XLEFT : PATH_BACKWARD_1XLEFT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: PATH_FORWARD_2XRIGHT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_FORWARD_2XLEFT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_BACKWARD_2XRIGHT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_BACKWARD_2XLEFT, numCapture: 1, mustCapture: true, chainable: true })
      ]
    });
  }
}

class Queen extends Piece {
  constructor(color) {
    super({
      backgroundImage: color == COLOR.BLACK ? './assets/textures/black_queen.png' : './assets/textures/white_queen.png',
      color: color,
      type: PIECE_TYPE.QUEEN,
      element: ELEMENT.DARK,
      powerupId: 'DOUBLE_MOVE',
      moves: [
        new Move({ path: PATH_DIAG_FORWARD_RIGHT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: PATH_DIAG_FORWARD_LEFT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: PATH_DIAG_BACKWARD_RIGHT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: PATH_DIAG_BACKWARD_LEFT, numCapture: 0, mustCapture: false, chainable: false }),
        new Move({ path: PATH_DIAG_FORWARD_RIGHT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_DIAG_FORWARD_LEFT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_DIAG_BACKWARD_RIGHT, numCapture: 1, mustCapture: true, chainable: true }),
        new Move({ path: PATH_DIAG_BACKWARD_LEFT, numCapture: 1, mustCapture: true, chainable: true }),
      ]
    })
  }
}

module.exports.Pawn = Pawn;
module.exports.Queen = Queen;