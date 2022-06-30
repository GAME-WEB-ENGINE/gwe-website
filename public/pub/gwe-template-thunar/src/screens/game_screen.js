let { GWE } = require('gwe');
let { Room } = require('../entities/room');

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.room = new Room();
    this.handleKeyDownOnceCb = (e) => this.handleKeyDownOnce(e);
  }

  async onEnter() {
    await this.room.loadFromFile('./assets/rooms/sample00/data.room', 'Spawn0000');
    document.addEventListener('keydown', this.handleKeyDownOnceCb);
  }

  async onExit() {
    document.removeEventListener('keydown', this.handleKeyDownOnceCb);
  }

  update(ts) {
    this.room.update(ts);
  }

  draw(viewIndex) {
    this.room.draw(viewIndex);
  }

  handleKeyDownOnce(e) {
    if (e.repeat) {
      return;
    }

    this.room.handleKeyDownOnce(e);
  }
}

module.exports.GameScreen = GameScreen;