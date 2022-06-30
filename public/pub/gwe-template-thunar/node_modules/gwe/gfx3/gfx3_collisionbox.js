let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');

class Gfx3CollisionBox extends Gfx3Drawable {
  constructor() {
    super();
    this.properties = {};
  }

  draw() {
    gfx3Manager.drawDebugBoundingBox(this.getModelMatrix(), this.boundingBox.min, this.boundingBox.max, [0, 0, 1]);
  }

  setBoundingBox(aabb) {
    this.boundingBox = aabb;
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  getWorldBoundingBox() {
    return this.boundingBox.transform(this.getModelMatrix());
  }

  setProperties(properties) {
    this.properties = properties;
  }

  setProperty(name, value) {
    this.properties[name] = value;
  }

  getProperty(name) {
    return this.properties[name];
  }
}

module.exports.Gfx3CollisionBox = Gfx3CollisionBox;