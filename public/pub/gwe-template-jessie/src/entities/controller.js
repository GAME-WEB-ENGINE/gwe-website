let { GWE } = require('gwe');
let { DIRECTION, DIRECTION_TO_VEC3 } = require('../enums');

class Controller extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.controllable = true;
    this.jas = new GWE.Gfx3JAS();
    this.moving = false;
    this.direction = DIRECTION.FORWARD;
    this.radius = 0;
    this.speed = 3;

    this.jas.setRotation(0.52, 0.78, 0);
    this.jas.setPixelsPerUnit(48);
  }

  async loadFromData(data) {
    await this.jas.loadFromFile(data['JASFile']);
    this.jas.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jas.setOffset(data['OffsetX'], data['OffsetY']);
    this.radius = data['Radius'];
  }

  update(ts) {
    if (this.controllable) {
      if (GWE.inputManager.isKeyDown('ArrowLeft')) {
        this.moving = true;
        this.direction = DIRECTION.LEFT;
      }
      else if (GWE.inputManager.isKeyDown('ArrowRight')) {
        this.moving = true;
        this.direction = DIRECTION.RIGHT;
      }
      else if (GWE.inputManager.isKeyDown('ArrowUp')) {
        this.moving = true;
        this.direction = DIRECTION.FORWARD;
      }
      else if (GWE.inputManager.isKeyDown('ArrowDown')) {
        this.moving = true;
        this.direction = DIRECTION.BACKWARD;
      }
      else {
        this.moving = false;
      }

      if (this.moving) {
        let prevPositionX = this.position[0];
        let prevPositionZ = this.position[2];
        this.position[0] += DIRECTION_TO_VEC3[this.direction][0] * this.speed * (ts / 1000);
        this.position[2] += DIRECTION_TO_VEC3[this.direction][2] * this.speed * (ts / 1000);
        GWE.eventManager.emit(this, 'E_MOVED', { prevPositionX, prevPositionZ });
      }
    }

    this.jas.setPosition(this.position[0], this.position[1] + this.jas.getOffsetY() / this.jas.getPixelsPerUnit(), this.position[2]);
    this.jas.play(this.moving ? 'RUN_' + this.direction : 'IDLE_' + this.direction, true, true);
    this.jas.update(ts);
  }

  draw(viewIndex) {
    this.jas.draw(viewIndex);
  }

  handleKeyDownOnce(e) {
    if (!this.controllable) {
      return;
    }

    if (e.key == 'Enter') {
      let handPositionX = this.position[0] + DIRECTION_TO_VEC3[this.direction][0] * (this.radius + 0.5);
      let handPositionY = this.position[1];
      let handPositionZ = this.position[2] + DIRECTION_TO_VEC3[this.direction][2] * (this.radius + 0.5);
      GWE.eventManager.emit(this, 'E_ACTION_PUSHED', { handPositionX, handPositionY, handPositionZ });
    }
  }

  setControllable(controllable) {
    this.controllable = controllable;
  }

  setDirection(direction) {
    this.direction = direction;
  }

  getRadius() {
    return this.radius;
  }
}

module.exports.Controller = Controller;