let { GWE } = require('gwe');
let { Spawn } = require('../entities/spawn');
let { Model } = require('../entities/model');
let { Trigger } = require('../entities/trigger');
let { Controller } = require('../entities/controller');
let { CameraFollow } = require('../entities/camera_follow');

class Room {
  constructor() {
    this.name = '';
    this.description = '';
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

    this.scriptMachine.registerCommand('LOAD_ROOM', GWE.Utils.BIND(this.$loadRoom, this));
    this.scriptMachine.registerCommand('CONTINUE', GWE.Utils.BIND(this.$continue, this));
    this.scriptMachine.registerCommand('STOP', GWE.Utils.BIND(this.$stop, this));
    this.scriptMachine.registerCommand('UI_CREATE_DIALOG', GWE.Utils.BIND(this.$uiCreateDialog, this));
    this.scriptMachine.registerCommand('MODEL_PLAY_MOVER', GWE.Utils.BIND(this.$modelPlayMover, this));
    this.scriptMachine.registerCommand('MODEL_PLAY_ANIMATION', GWE.Utils.BIND(this.$modelPlayAnimation, this));
  }

  async loadFromFile(path, spawnName) {
    let response = await fetch(path);
    let json = await response.json();

    this.name = json['Name'];
    this.description = json['Description'];

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

    let spawn = this.spawns.find(spawn => spawn.getName() == spawnName);
    this.controller.setPosition(spawn.getPositionX(), spawn.getPositionY(), spawn.getPositionZ());
    this.controller.setRotation(0, GWE.Utils.VEC2_ANGLE(spawn.getDirection()), 0);

    await this.scriptMachine.loadFromFile(json['ScriptFile']);
    this.scriptMachine.jump('ON_INIT');
    this.scriptMachine.setEnabled(true);

    GWE.eventManager.subscribe(this.controller, 'E_ACTION_PUSHED', this, this.handleControllerActionPushed);
    GWE.eventManager.subscribe(this.controller, 'E_MOVED', this, this.handleControllerActionMoved);
  }

  handleKeyDownOnce(e) {
    this.controller.handleKeyDownOnce(e);
  }

  update(ts) {
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

  handleControllerActionPushed({ handPositionX, handPositionY, handPositionZ }) {
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

    for (let model of this.models) {
      if (GWE.Utils.VEC3_DISTANCE(model.getPosition(), [handPositionX, handPositionY, handPositionZ]) <= model.getRadius()) {
        if (model.getOnActionBlockId()) {
          this.scriptMachine.jump(model.getOnActionBlockId());
          return;
        }
      }
    }
  }

  handleControllerActionMoved({ prevPositionX, prevPositionZ }) {
    let position = this.controller.getPosition();
    let radius = this.controller.getRadius();

    for (let other of this.models) {
      let delta = GWE.Utils.VEC3_SUBSTRACT(position, other.getPosition());
      let distance = GWE.Utils.VEC3_LENGTH(delta);
      let distanceMin = radius + other.getRadius();

      if (distance < distanceMin) {
        let c = Math.PI * 2 - (Math.PI * 2 - Math.atan2(delta[2], delta[0]));
        position[0] += Math.cos(c) * (distanceMin - distance);
        position[2] += Math.sin(c) * (distanceMin - distance);
        break;
      }
    }

    let p0Elevation = this.walkmesh.getElevationAt(position[0], position[2]);
    let p1Elevation = this.walkmesh.getElevationAt(position[0] - radius, position[2] - radius);
    let p2Elevation = this.walkmesh.getElevationAt(position[0] - radius, position[2] + radius);
    let p3Elevation = this.walkmesh.getElevationAt(position[0] + radius, position[2] - radius);
    let p4Elevation = this.walkmesh.getElevationAt(position[0] + radius, position[2] + radius);
    if (p0Elevation == Infinity || p1Elevation == Infinity || p2Elevation == Infinity || p3Elevation == Infinity || p4Elevation == Infinity) {
      this.controller.setPosition(prevPositionX, position[1], prevPositionZ);
      return;
    }

    this.controller.setPosition(position[0], p0Elevation, position[2]);

    for (let trigger of this.triggers) {
      let distance = GWE.Utils.VEC3_DISTANCE(trigger.getPosition(), position);
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

  async $loadRoom(path, spawnName) {
    this.controller.setControllable(false);
    await this.loadFromFile(path, spawnName);
    this.controller.setControllable(true);
  }

  $continue() {
    this.controller.setControllable(true);
  }

  $stop() {
    this.controller.setControllable(false);
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

  $modelPlayMover(modelIndex, moverIndex) {
    let model = this.models[modelIndex];
    let mover = this.movers[moverIndex];
    mover.setDrawable(model);
    mover.play();
  }

  $modelPlayAnimation(modelIndex, animationName, isLooped) {
    let model = this.models[modelIndex];
    model.play(animationName, isLooped);
  }
}

module.exports.Room = Room;