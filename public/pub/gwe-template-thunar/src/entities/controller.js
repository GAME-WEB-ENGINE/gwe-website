let { GWE } = require('gwe');

class Controller extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.controllable = true;
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
    if (this.controllable) {
      let moveDir = GWE.Utils.VEC3_ZERO;
      if (GWE.inputManager.isKeyDown('ArrowLeft')) {
        moveDir = GWE.Utils.VEC3_LEFT;
        this.moving = true;
      }
      else if (GWE.inputManager.isKeyDown('ArrowRight')) {
        moveDir = GWE.Utils.VEC3_RIGHT;
        this.moving = true;
      }
      else if (GWE.inputManager.isKeyDown('ArrowUp')) {
        moveDir = GWE.Utils.VEC3_FORWARD;
        this.moving = true;
      }
      else if (GWE.inputManager.isKeyDown('ArrowDown')) {
        moveDir = GWE.Utils.VEC3_BACKWARD;
        this.moving = true;
      }
      else {
        this.moving = false;
      }
  
      if (this.moving) {
        let prevPositionX = this.position[0];
        let prevPositionZ = this.position[2];
        this.position[0] += moveDir[0] * this.speed * (ts / 1000)
        this.position[2] += moveDir[2] * this.speed * (ts / 1000);
        this.rotation[1] = GWE.Utils.VEC2_ANGLE([moveDir[0], moveDir[2]]);
        GWE.eventManager.emit(this, 'E_MOVED', { prevPositionX, prevPositionZ });
      }
    }

    this.jam.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jam.setRotation(this.rotation[0], this.rotation[1], this.rotation[2]);
    this.jam.play(this.moving ? 'RUN' : 'IDLE', true, true);
    this.jam.update(ts);
  }

  draw(viewIndex) {
    this.jam.draw(viewIndex);
  }

  handleKeyDownOnce(e) {
    if (!this.controllable) {
      return;
    }

    if (e.key == 'Enter') {
      let handPositionX = this.position[0] + Math.cos(this.rotation[1]) * this.radius + 0.5;
      let handPositionY = this.position[1];
      let handPositionZ = this.position[2] + Math.sin(this.rotation[1]) * this.radius + 0.5;
      GWE.eventManager.emit(this, 'E_ACTION_PUSHED', { handPositionX, handPositionY, handPositionZ });
    }
  }

  setControllable(controllable) {
    this.controllable = controllable;
  }

  getRadius() {
    return this.radius;
  }
}

module.exports.Controller = Controller;