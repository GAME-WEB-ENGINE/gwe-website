let { GWE } = require('gwe');
let { COLOR } = require('../core/enums');
let { UIPiece } = require('./ui_piece');

class UITile extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UITile',
      template: `
      <div class="UITile-piece js-piece"></div>
      <div class="UITile-actions js-actions"></div>`
    });

    this.tile = null;
    this.uiPiece = new UIPiece();
    this.node.querySelector('.js-piece').replaceWith(this.uiPiece.node);

    this.node.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleClicked()
    });
  }

  update(ts) {
    if (this.tile) {
      this.uiPiece.setPiece(this.tile.getPiece());
    }

    this.uiPiece.update(ts);
  }

  delete() {
    this.uiPiece.delete();
    super.delete();
  }

  setTile(tile) {
    if (tile) {
      this.node.classList.add(tile.getColor() == COLOR.WHITE ? 'UITile--white' : 'UITile--black');
      this.tile = tile;
    }
    else {
      this.tile = null;
    }
  }

  isSelectable() {
    return this.node.classList.contains('u-selectable');
  }

  setSelectable(selectable) {
    this.node.classList.toggle('u-selectable', selectable);
  }

  addAction(name) {
    let action = document.createElement('div');
    action.className = 'UITile-actions-item';
    action.textContent = name;
    this.node.querySelector('.js-actions').appendChild(action);

    action.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleActionClicked(name)
    });
  }

  clearActions() {
    let actionsNode = this.node.querySelector('.js-actions');
    while (actionsNode.firstChild) {
      actionsNode.removeChild(actionsNode.firstChild);
    }
  }

  handleClicked() {
    GWE.eventManager.emit(this, 'E_CLICKED');
  }

  handleActionClicked(action) {
    GWE.eventManager.emit(this, 'E_ACTION', { action: action });
  }
}

module.exports.UITile = UITile;