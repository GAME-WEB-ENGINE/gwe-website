let { GWE } = require('gwe');
let { COLOR, PIECE_TYPE } = require('./enums');
let { Queen } = require('./piece');
let { Board } = require('./board');
let { PowerupFactory } = require('./powerup');

class Game {
  constructor() {
    this.board = new Board();
    this.currentPlayer = COLOR.BLACK;
  }

  getBoard() {
    return this.board;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  startup() {
    this.operationNewTurn();
  }

  async operationNewTurn() {
    let y = this.currentPlayer == COLOR.BLACK ? this.board.getRows() - 1 : 0;
    for (let x = 0; x < this.board.getCols(); x++) {
      let tile = this.board.getTile([x, y]);
      let piece = tile.getPiece();
      if (piece && piece.getColor() == this.currentPlayer && piece.getType() == PIECE_TYPE.PAWN) {
        tile.setPiece(new Queen(piece.getColor()));
      }
    }

    this.currentPlayer = this.currentPlayer == COLOR.BLACK ? COLOR.WHITE : COLOR.BLACK;
    await this.operationRequestTileAction();
  }

  async operationRequestTileAction() {
    let response = {};
    response.x = 0;
    response.y = 0;
    response.action = '';

    await GWE.eventManager.emit(this, 'E_REQUEST_TILE_ACTION', {
      response: response
    });

    return response;
  }

  async operationRequestTileLocation(required = false, predicateTile = () => true) {
    let response = {};
    response.x = 0;
    response.y = 0;
    response.canceled = false;

    await GWE.eventManager.emit(this, 'E_REQUEST_TILE_LOCATION', {
      required: required,
      predicateTile: predicateTile,
      response: response
    });

    return response;
  }

  operationKill(coord) {
    let tile = this.board.getTile(coord);
    tile.setPiece(null);
  }

  async operationPowerup(coord) {
    let piece = this.board.getPiece(coord);
    let powerup = PowerupFactory.create(piece.getPowerupId(), this);
    await powerup.onActive();
    piece.setPowerupId('');
  }

  async operationMove(coordFrom, coordTo) {
    let tileFrom = this.board.getTile(coordFrom);
    let tileTo = this.board.getTile(coordTo);
    let piece = tileFrom.getPiece();
    let pieceMoves = piece.getMoves();
    tileFrom.setPiece(null);
    tileTo.setPiece(piece);

    let move = pieceMoves.find(m => m.hasVector(GWE.Utils.VEC2_SUBSTRACT(coordTo, coordFrom)));

    for (let vector of move.getPath()) {
      let coord = GWE.Utils.VEC2_ADD(coordFrom, vector);
      if (GWE.Utils.VEC2_ISEQUAL(coord, coordTo)) {
        break;
      }

      let encounterTile = this.board.getTile(coord);
      let encounterPiece = encounterTile.getPiece();

      if (encounterPiece && encounterPiece.getColor() != piece.getColor()) {
        encounterTile.setPiece(null);
      }
    }

    let chainablePoints = this.board.findPossiblePoints(coordTo, true);
    if (move.isChainable() && chainablePoints.length > 0) {
      let response = await this.operationRequestTileLocation(true, (x, y) => {
        return chainablePoints.find(p => p.x == x && p.y == y);
      });

      await this.operationMove(coordTo, [response.x, response.y]);
      return;
    }
  }
}

module.exports.Game = Game;