let { GWE } = require('gwe');
let { COLOR } = require('./core/enums');
let { Game } = require('./core/game');
let { CommandFactory } = require('./core/game_commands');
let { UIBoard } = require('./ui/ui_board');

class MainScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.game = new Game();
    this.board = this.game.getBoard();
    this.uiTitle = document.createElement('div');
    this.uiBoard = new UIBoard();
  }

  async onEnter() {
    GWE.uiManager.addNode(this.uiTitle, 'position:absolute; top: 10%; left: 50%; transform: translateX(-50%)');

    this.uiBoard.setBoard(this.board);
    GWE.uiManager.addWidget(this.uiBoard, 'position: absolute;inset: 0px;top: 50%;left: 50%;width: 400px;height: 400px;transform: translate(-50%, -50%)');
    GWE.uiManager.focus(this.uiBoard);

    GWE.eventManager.subscribe(this.game, 'E_REQUEST_TILE_ACTION', this, this.handleGameRequestTileAction);
    GWE.eventManager.subscribe(this.game, 'E_REQUEST_TILE_LOCATION', this, this.handleGameRequestTileLocation);

    this.game.startup();
  }

  update() {
    this.uiTitle.textContent = `AU TOUR DES ${this.game.getCurrentPlayer() == COLOR.BLACK ? 'NOIRS' : 'BLANCS'} DE JOUER`;
  }

  handleGameRequestTileAction(data) {
    return new Promise(resolve => {
      GWE.eventManager.subscribe(this.uiBoard, 'E_TILE_CLICKED', this, (data) => {
        this.uiBoard.clearActions();
        let uiTile = this.uiBoard.getUITile(data.coord);
        let moveCmd = CommandFactory.create('MOVE', this.game, data.coord);
        if (moveCmd.isConditionCheck()) uiTile.addAction('MOVE');
        let powerupCmd = CommandFactory.create('POWERUP', this.game, data.coord);
        if (powerupCmd.isConditionCheck()) uiTile.addAction('POWERUP');
      });

      GWE.eventManager.subscribe(this.uiBoard, 'E_TILE_ACTION', this, async (data) => {
        GWE.eventManager.unsubscribe(this.uiBoard, 'E_TILE_CLICKED', this);
        GWE.eventManager.unsubscribe(this.uiBoard, 'E_TILE_ACTION', this);
        let uiTile = this.uiBoard.getUITile(data.coord);
        uiTile.clearActions();
        let cmd = CommandFactory.create(data.action, this.game, data.coord);
        cmd.exec().then(() => resolve());
      });
    });
  }

  handleGameRequestTileLocation({ required, predicateTile, response }) {
    return new Promise(resolve => {
      for (let y = 0; y < this.board.getRows(); y++) {
        for (let x = 0; x < this.board.getCols(); x++) {
          if (predicateTile(x, y)) {
            let uiTile = this.uiBoard.getUITile([x, y]);
            uiTile.setSelectable(true);
          }
        }
      }

      if (!required) {
        GWE.eventManager.subscribe(this.uiBoard, 'E_ECHAP_PRESSED', this, () => {
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ECHAP_PRESSED', this);
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_TILE_CLICKED', this);
          this.uiBoard.clearSelectable();
          response.canceled = true;
          resolve();
        });
      }

      GWE.eventManager.subscribe(this.uiBoard, 'E_TILE_CLICKED', this, (data) => {
        let uiTile = this.uiBoard.getUITile(data.coord);
        if (uiTile.isSelectable()) {
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ECHAP_PRESSED', this);
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_TILE_CLICKED', this);
          this.uiBoard.clearSelectable();
          response.canceled = false;
          response.x = data.coord[0];
          response.y = data.coord[1];
          resolve();
        }
      });
    });
  }
}

module.exports.MainScreen = MainScreen;