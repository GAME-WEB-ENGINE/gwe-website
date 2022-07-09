let { GWE } = require('gwe');

let DIRECTION = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD'
};

let DIRECTION_TO_VEC2 = {
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  FORWARD: [0, -1],
  BACKWARD: [0, 1]
};

class Controller extends GWE.Gfx2Drawable {
  constructor() {
    super();
    this.jas = new GWE.Gfx2JAS();
    this.moving = false;
    this.direction = DIRECTION.FORWARD;
    this.speed = 2;
    this.width = 0;
    this.height = 0;
    this.colliderLeftOffset = [0, 0];
    this.colliderRightOffset = [0, 0];
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    await this.jas.loadFromFile(json['JASFile']);
    this.jas.setTexture(await GWE.gfx2TextureManager.loadTexture(json['TextureFile']));
    this.jas.setOffset(json['OffsetX'], json['OffsetY']);
    this.width = json['Width'];
    this.height = json['Height'];
    this.colliderLeftOffset[0] = json['ColliderLeftOffsetX'];
    this.colliderLeftOffset[1] = json['ColliderLeftOffsetY'];
    this.colliderRightOffset[0] = json['ColliderRightOffsetX'];
    this.colliderRightOffset[1] = json['ColliderRightOffsetY'];
  }

  update(ts) {
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
      let prevPositionY = this.position[1];
      this.position[0] += DIRECTION_TO_VEC2[this.direction][0] * this.speed;
      this.position[1] += DIRECTION_TO_VEC2[this.direction][1] * this.speed;
      GWE.eventManager.emit(this, 'E_MOVED', { prevPositionX, prevPositionY });
    }

    this.jas.setPosition(this.position[0], this.position[1]);
    this.jas.play(this.moving ? 'RUN_' + this.direction : 'IDLE_' + this.direction, true, true);
    this.jas.update(ts);
  }

  draw() {
    this.jas.draw();
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getColliderLeftOffsetX() {
    return this.colliderLeftOffset[0];
  }

  getColliderLeftOffsetY() {
    return this.colliderLeftOffset[1];
  }

  getColliderRightOffsetX() {
    return this.colliderRightOffset[0];
  }

  getColliderRightOffsetY() {
    return this.colliderRightOffset[1];
  }
}

module.exports.Controller = Controller;