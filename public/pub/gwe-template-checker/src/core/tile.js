class Tile {
  constructor(color, piece = null, element = null) {
    this.color = color;
    this.piece = piece;
    this.element = element;
  }

  getColor() {
    return this.color;
  }

  setColor(color) {
    this.color = color;
  }

  getPiece() {
    return this.piece;
  }

  setPiece(piece) {
    this.piece = piece;
  }

  getElement() {
    return this.element;
  }

  setElement(element) {
    this.element = element;
  }
}

module.exports.Tile = Tile;