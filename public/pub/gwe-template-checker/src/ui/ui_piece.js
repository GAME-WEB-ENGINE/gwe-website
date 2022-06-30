let { GWE } = require('gwe');

class UIPiece extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIPiece',
      template: `
      <div class="UIPiece-bg js-bg"></div>`
    });

    this.piece = null;
  }

  update() {
    if (this.piece) {
      this.node.querySelector('.js-bg').style.backgroundImage = 'url(' + this.piece.getBackgroundImage() + ')';
    }
    else {
      this.node.querySelector('.js-bg').style.backgroundImage = '';
    }
  }

  setPiece(piece) {
    this.piece = piece ? piece : null;
  }
}

module.exports.UIPiece = UIPiece;

