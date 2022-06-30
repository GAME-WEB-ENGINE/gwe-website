let { GWE } = require('gwe');
let { UITile } = require('./ui_tile');

class UIBoard extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBoard'
    });

    this.board = null;
    this.uiTiles = [];
  }

  update(ts) {
    for (let uiTile of this.uiTiles) {
      uiTile.update(ts);
    }
  }

  delete() {
    for (let uiTile of this.uiTiles) {
      GWE.eventManager.unsubscribe(uiTile, 'E_CLICKED', this);
      GWE.eventManager.unsubscribe(uiTile, 'E_ACTION', this);
      uiTile.delete();
    }

    super.delete();
  }

  setBoard(board) {
    for (let uiTile of this.uiTiles) {
      GWE.eventManager.unsubscribe(uiTile, 'E_CLICKED', this);
      GWE.eventManager.unsubscribe(uiTile, 'E_ACTION', this);
      uiTile.delete();
    }

    this.uiTiles = [];

    if (board) {
      for (let y = 0; y < board.getRows(); y++) {
        for (let x = 0; x < board.getCols(); x++) {
          let uiTile = new UITile();
          GWE.eventManager.subscribe(uiTile, 'E_CLICKED', this, (data) => this.handleTileClicked(x, y));
          GWE.eventManager.subscribe(uiTile, 'E_ACTION', this, (data) => this.handleTileAction(x, y, data.action));
          uiTile.setTile(board.getTile([x, y]));
          this.node.appendChild(uiTile.node);
          this.uiTiles.push(uiTile);
        }
      }

      this.board = board;
    }
    else {
      this.board = null;
    }
  }

  getUITiles() {
    return this.uiTiles;
  }

  getUITile(coord) {
    return this.uiTiles[coord[0] + coord[1] * this.board.getCols()];
  }

  clearActions() {
    for (let uiTile of this.uiTiles) {
      uiTile.setSelectable(false);
      uiTile.clearActions();
    }
  }

  clearSelectable() {
    for (let uiTile of this.uiTiles) {
      uiTile.setSelectable(false);
    }
  }

  handleTileClicked(x, y) {
    GWE.eventManager.emit(this, 'E_TILE_CLICKED', { coord: [x, y] });
  }

  handleTileAction(x, y, action) {
    GWE.eventManager.emit(this, 'E_TILE_ACTION', { coord: [x, y], action: action });
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.eventManager.emit(this, 'E_ECHAP_PRESSED');
    }
  }
}

module.exports.UIBoard = UIBoard;