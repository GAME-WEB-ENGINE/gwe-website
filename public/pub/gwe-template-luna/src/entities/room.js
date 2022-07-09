let { GWE } = require('gwe');
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

    GWE.eventManager.subscribe(this.controller, 'E_ACTION_PUSHED', this, this.handleControllerActionPushed);
    GWE.eventManager.subscribe(this.controller, 'E_MOVED', this, this.handleControllerActionMoved);
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

  handleKeyDownOnce(e) {
    this.controller.handleKeyDownOnce(e);
  }

  handleControllerActionPushed({ handPositionX, handPositionZ }) {
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
      if (GWE.Utils.VEC3_DISTANCE(model.getPosition(), [handPositionX, position[1], handPositionZ]) <= model.getRadius()) {
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
      if (GWE.Utils.VEC3_DISTANCE(other.getPosition(), position) <= radius + other.getRadius()) {
        this.controller.setPosition(prevPositionX, position[1], prevPositionZ);
        return;
      }
    }

    let p0Elevation = this.walkmesh.getElevationAt(position[0], position[2]);
    let p1Elevation = this.walkmesh.getElevationAt(position[0] - radius, position[2]);
    let p2Elevation = this.walkmesh.getElevationAt(position[0] + radius, position[2]);
    if (p0Elevation == Infinity || p1Elevation == Infinity || p2Elevation == Infinity) {
      this.controller.setPosition(prevPositionX, position[1], prevPositionZ);
      return;
    }

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
}

module.exports.Room = Room;