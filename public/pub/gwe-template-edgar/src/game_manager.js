let { GWE } = require('gwe');
let { Player } = require('./core/player');

class GameManager extends GWE.Application {
  constructor(resolutionWidth, resolutionHeight, sizeMode) {
    super(resolutionWidth, resolutionHeight, sizeMode);
    this.player = new Player();
  }

  async loadFromFile(path) {
    await this.player.loadFromFile(path);
  }

  getPlayer() {
    return this.player;
  }
}

module.exports.gameManager = new GameManager(600, 600, GWE.SizeModeEnum.FIXED);