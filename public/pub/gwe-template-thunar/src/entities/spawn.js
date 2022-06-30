let { GWE } = require('gwe');

class Spawn extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.name = '';
    this.direction = [0, 0];
    this.radius = 0.2;
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.direction[0] = data['DirectionX'];
    this.direction[1] = data['DirectionZ'];
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

  getRadius() {
    return this.radius;
  }
}

module.exports.Spawn = Spawn;