let { GWE } = require('gwe');

class Model extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.jam = new GWE.Gfx3JAM();
    this.radius = 0;
    this.onActionBlockId = '';
  }

  async loadFromData(data) {
    await this.jam.loadFromFile(data['JAMFile']);
    this.jam.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jam.play('IDLE', true);
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.rotation[0] = data['RotationX'];
    this.rotation[1] = data['RotationY'];
    this.rotation[2] = data['RotationZ'];
    this.radius = data['Radius'];
    this.onActionBlockId = data['OnActionBlockId'];
  }

  update(ts) {
    this.jam.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jam.setRotation(this.rotation[0], this.rotation[1], this.rotation[2]);
    this.jam.update(ts);
  }

  draw(viewIndex) {
    this.jam.draw(viewIndex);
  }

  getRadius() {
    return this.radius;
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }
}

module.exports.Model = Model;