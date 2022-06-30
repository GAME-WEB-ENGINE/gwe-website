let { GWE } = require('gwe');
const { Player } = require('./core/player');

class Game extends GWE.Application {
  constructor(resolutionWidth, resolutionHeight, sizeMode) {
    super(resolutionWidth, resolutionHeight, sizeMode);
    this.player = null;
  }

  async loadFromFile(path) {
    this.player = new Player();
    await this.player.loadFromFile(path);
  }

  getPlayer() {
    return this.player;
  }
}

module.exports.gameManager = new Game(600, 600, GWE.SizeModeEnum.FIXED);