let { GWE } = require('gwe');
let { DIRECTION } = require('../core/enums');
let { Spawn } = require('./spawn');
let { Model } = require('./model');
let { Trigger } = require('./trigger');
let { Controller } = require('./controller');
let { CameraFollow } = require('./camera_follow');

class Room {
  constructor() {
    this.map = new GWE.Gfx3JSM();
    this.walkmesh = new GWE.Gfx3JWM();
    this.controller = new Controller();
    this.camera = new CameraFollow();
    this.scriptMachine = new GWE.ScriptMachine();
    this.spawns = [];
    this.models = [];
    this.movers = [];
    this.triggers = [];
    this.running = true;

    this.scriptMachine.registerCommand('CONTINUE', GWE.Utils.BIND(this.$continue, this));
    this.scriptMachine.registerCommand('STOP', GWE.Utils.BIND(this.$stop, this));
    this.scriptMachine.registerCommand('UI_CREATE_DIALOG', GWE.Utils.BIND(this.$uiCreateDialog, this));
  }

  async loadFromFile(path, spawnName) {
    let response = await fetch(path);
    let json = await response.json();

    this.map = new GWE.Gfx3JSM();
    await this.map.loadFromFile(json['MapFile']);
    this.map.setTexture(await GWE.gfx3TextureManager.loadTexture(json['MapTextureFile']));

    this.walkmesh = new GWE.Gfx3JWM();
    await this.walkmesh.loadFromFile(json['WalkmeshFile']);

    this.controller = new Controller();
    await this.controller.loadFromData(json['Controller']);

    this.camera = new CameraFollow();
    await this.camera.loadFromData(json['Camera']);
    this.camera.setTargetDrawable(this.controller);

    this.spawns = [];
    for (let obj of json['Spawns']) {
      let spawn = new Spawn();
      await spawn.loadFromData(obj);
      this.spawns.push(spawn);
    }

    this.models = [];
    for (let obj of json['Models']) {
      let model = new Model();
      await model.loadFromData(obj);
      this.models.push(model);
    }

    this.movers = [];
    for (let obj of json['Movers']) {
      let mover = new GWE.Gfx3Mover();
      await mover.loadFromData(obj);
      this.movers.push(mover);
    }

    this.triggers = [];
    for (let obj of json['Triggers']) {
      let trigger = new Trigger();
      await trigger.loadFromData(obj);
      this.triggers.push(trigger);
    }

    let spawn = this.spawns.find(s => s.getName() == spawnName);
    this.controller.setDirection(spawn.getDirection());
    this.controller.setPosition(spawn.getPositionX(), spawn.getPositionY(), spawn.getPositionZ());

    await this.scriptMachine.loadFromFile(json['ScriptFile']);
    this.scriptMachine.jump('ON_INIT');
    this.scriptMachine.setEnabled(true);
  }

  handleKeyDownOnce(e) {
    if (!this.running) {
      return;
    }

    if (e.key == 'Enter') {
      this.operationControllerAction();
    }
  }

  update(ts) {
    if (this.running) {
      if (GWE.inputManager.isKeyDown('ArrowLeft')) {
        this.controller.setMoving(true);
        this.controller.setDirection(DIRECTION.LEFT);
      }
      else if (GWE.inputManager.isKeyDown('ArrowRight')) {
        this.controller.setMoving(true);
        this.controller.setDirection(DIRECTION.RIGHT);
      }
      else if (GWE.inputManager.isKeyDown('ArrowUp')) {
        this.controller.setMoving(true);
        this.controller.setDirection(DIRECTION.FORWARD);
      }
      else if (GWE.inputManager.isKeyDown('ArrowDown')) {
        this.controller.setMoving(true);
        this.controller.setDirection(DIRECTION.BACKWARD);
      }
      else {
        this.controller.setMoving(false);
      }

      if (this.controller.isMoving()) {
        let velocity = this.controller.getVelocity();
        this.operationControllerMove(velocity[0] * (ts / 1000), velocity[2] * (ts / 1000));
      }
    }

    this.map.update(ts);
    this.walkmesh.update(ts);
    this.controller.update(ts);
    this.camera.update(ts);
    this.scriptMachine.update(ts);

    for (let spawn of this.spawns) {
      spawn.update(ts);
    }

    for (let model of this.models) {
      model.update(ts);
    }

    for (let mover of this.movers) {
      mover.update(ts);
    }

    for (let trigger of this.triggers) {
      trigger.update(ts);
    }
  }

  draw(viewIndex) {
    this.map.draw(viewIndex);
    this.walkmesh.draw(viewIndex);
    this.controller.draw(viewIndex);

    for (let spawn of this.spawns) {
      spawn.draw(viewIndex);
    }

    for (let model of this.models) {
      model.draw(viewIndex);
    }

    for (let mover of this.movers) {
      mover.draw(viewIndex);
    }

    for (let trigger of this.triggers) {
      trigger.draw(viewIndex);
    }
  }

  operationControllerAction() {
    let position = this.controller.getPosition();
    let radius = this.controller.getRadius();
    for (let trigger of this.triggers) {
      if (GWE.Utils.VEC3_DISTANCE(trigger.getPosition(), position) <= radius + trigger.getRadius()) {
        if (trigger.getOnActionBlockId()) {
          this.scriptMachine.jump(trigger.getOnActionBlockId());
          return;
        }
      }
    }

    let handPosition = this.controller.getHandPosition();
    for (let model of this.models) {
      if (GWE.Utils.VEC3_DISTANCE(model.getPosition(), handPosition) <= model.getRadius()) {
        if (model.getOnActionBlockId()) {
          this.scriptMachine.jump(model.getOnActionBlockId());
          return;
        }
      }
    }
  }

  operationControllerMove(mx, mz) {
    let radius = this.controller.getRadius();
    let nextPosition = GWE.Utils.VEC3_ADD(this.controller.getPosition(), [mx, 0, mz]);

    for (let other of this.models) {
      if (GWE.Utils.VEC3_DISTANCE(other.getPosition(), nextPosition) <= radius + other.getRadius()) {
        return;
      }
    }

    let p0Elevation = this.walkmesh.getElevationAt(nextPosition[0], nextPosition[2]);
    let p1Elevation = this.walkmesh.getElevationAt(nextPosition[0] - radius, nextPosition[2]);
    let p2Elevation = this.walkmesh.getElevationAt(nextPosition[0] + radius, nextPosition[2]);
    if (p0Elevation == Infinity || p1Elevation == Infinity || p2Elevation == Infinity) {
      return;
    }

    this.controller.setPosition(nextPosition[0], p0Elevation, nextPosition[2]);

    for (let trigger of this.triggers) {
      let distance = GWE.Utils.VEC3_DISTANCE(trigger.getPosition(), nextPosition);
      let distanceMin = radius + trigger.getRadius();

      if (trigger.getOnEnterBlockId() && !trigger.isHovered() && distance < distanceMin) {
        this.scriptMachine.jump(trigger.getOnEnterBlockId());
        trigger.setHovered(true);
      }
      else if (trigger.getOnLeaveBlockId() && trigger.isHovered() && distance > distanceMin) {
        this.scriptMachine.jump(trigger.getOnLeaveBlockId());
        trigger.setHovered(false);
      }
    }
  }

  $continue() {
    this.running = true;
  }

  $stop() {
    this.running = false;
  }

  async $uiCreateDialog(author, text) {
    this.scriptMachine.setEnabled(false);
    let uiDialog = new GWE.UIDialog();
    uiDialog.setAuthor(author);
    uiDialog.setText(text);
    GWE.uiManager.addWidget(uiDialog);
    GWE.uiManager.focus(uiDialog);
    await GWE.eventManager.wait(uiDialog, 'E_CLOSE');
    GWE.uiManager.removeWidget(uiDialog);
    this.scriptMachine.setEnabled(true);
  }
}

module.exports.Room = Room;