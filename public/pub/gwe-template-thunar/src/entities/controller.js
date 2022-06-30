let { GWE } = require('gwe');

class Controller extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.jam = new GWE.Gfx3JAM();
    this.moving = false;
    this.radius = 0;
    this.speed = 4;
  }

  async loadFromData(data) {
    await this.jam.loadFromFile(data['JAMFile']);
    this.jam.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.radius = data['Radius'];
  }

  update(ts) {
    this.jam.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jam.setRotation(this.rotation[0], this.rotation[1], this.rotation[2]);
    this.jam.play(this.moving ? 'RUN' : 'IDLE', true, true);
    this.jam.update(ts);
  }

  draw(viewIndex) {
    this.jam.draw(viewIndex);
  }

  getHandPosition() {
    let x = Math.cos(this.rotation[1]) * this.radius + 0.5;
    let z = Math.sin(this.rotation[1]) * this.radius + 0.5;
    return GWE.Utils.VEC3_ADD(this.position, [x, 0, z]);
  }

  isMoving() {
    return this.moving;
  }

  setMoving(moving) {
    this.moving = moving;
  }

  getRadius() {
    return this.radius;
  }

  getSpeed() {
    return this.speed;
  }
}

module.exports.Controller = Controller;
