let { GWE } = require('gwe');

class Model extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.jas = new GWE.Gfx3JAS();
    this.radius = 0;
    this.onActionBlockId = '';

    this.jas.setRotation(0.52, 0.78, 0);
    this.jas.setPixelsPerUnit(48);
  }

  async loadFromData(data) {
    await this.jas.loadFromFile(data['JASFile']);
    this.jas.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jas.setOffset(data['OffsetX'], data['OffsetY']);
    this.jas.play(data['Animation'], true);
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.radius = data['Radius'];
    this.onActionBlockId = data['OnActionBlockId'];
  }

  update(ts) {
    this.jas.setPosition(this.position[0], this.position[1] + this.jas.getOffsetY() / this.jas.getPixelsPerUnit(), this.position[2]);
    this.jas.update(ts);
  }

  draw(viewIndex) {
    this.jas.draw(viewIndex);
  }

  getRadius() {
    return this.radius;
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }
}

module.exports.Model = Model;