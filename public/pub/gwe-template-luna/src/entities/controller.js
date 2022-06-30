let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');

class Controller extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.jas = new GWE.Gfx3JAS();
    this.moving = false;
    this.direction = DIRECTION.FORWARD;
    this.radius = 0;
    this.speed = 3;

    this.jas.setRotation(1.57, 0, 0);
    this.jas.setPixelsPerUnit(32);
  }

  async loadFromData(data) {
    await this.jas.loadFromFile(data['JASFile']);
    this.jas.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jas.setOffset(data['OffsetX'], data['OffsetY']);
    this.radius = data['Radius'];
  }

  update(ts) {
    this.jas.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jas.play(this.moving ? 'RUN_' + this.direction : 'IDLE_' + this.direction, true, true);
    this.jas.update(ts);
  }

  draw(viewIndex) {
    this.jas.draw(viewIndex);
  }

  getMoveDir() {
    if (this.direction == DIRECTION.FORWARD) {
      return GWE.Utils.VEC3_FORWARD;
    }
    else if (this.direction == DIRECTION.BACKWARD) {
      return GWE.Utils.VEC3_BACKWARD;
    }
    else if (this.direction == DIRECTION.LEFT) {
      return GWE.Utils.VEC3_LEFT;
    }
    else if (this.direction == DIRECTION.RIGHT) {
      return GWE.Utils.VEC3_RIGHT;
    }
    else {
      return GWE.Utils.VEC3_ZERO;
    }
  }

  getVelocity() {
    return GWE.Utils.VEC3_SCALE(this.getMoveDir(), this.speed);
  }

  getHandPosition() {
    return GWE.Utils.VEC3_ADD(this.position, GWE.Utils.VEC3_SCALE(this.getMoveDir(), this.radius + 0.5));
  }

  isMoving() {
    return this.moving;
  }

  setMoving(moving) {
    this.moving = moving;
  }

  getDirection() {
    return this.direction;
  }

  setDirection(direction) {
    this.direction = direction;
  }

  getRadius() {
    return this.radius;
  }

  getSpeed() {
    return this.speed;
  }
}

module.exports.Controller = Controller;