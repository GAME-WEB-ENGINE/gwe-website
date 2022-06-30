let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');

class Spawn extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.name = '';
    this.direction = DIRECTION.FORWARD;
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.direction = data['Direction'];
  }

  draw(viewIndex) {
    GWE.gfx3Manager.drawDebugSphere(this.getModelMatrix(), 0.2, 2, [1, 0, 1]);
  }

  getName() {
    return this.name;
  }

  getDirection() {
    return this.direction;
  }
}

module.exports.Spawn = Spawn;