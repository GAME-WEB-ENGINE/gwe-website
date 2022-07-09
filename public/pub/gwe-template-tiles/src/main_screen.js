let { GWE } = require('gwe');
let { Controller } = require('./controller');
let { SelectionRect } = require('./selection_rect');

const LAYER = {
  BACKGROUND: 0,
  MIDDLE: 1,
  FOREGROUND: 2
};

class MainScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.map = new GWE.Gfx2Map();
    this.collisionMap = new GWE.Gfx2Map(); // dans le cas ou vous souhaitez gérer les collisions plus finement vous devrez avoir une map avec des tuiles plus petites.
    this.layerBackground = new GWE.Gfx2MapLayer(this.map, LAYER.BACKGROUND);
    this.layerMiddle = new GWE.Gfx2MapLayer(this.map, LAYER.MIDDLE);
    this.layerForeground = new GWE.Gfx2MapLayer(this.map, LAYER.FOREGROUND);
    this.controller = new Controller();
    this.selectionRect = new SelectionRect();
  }

  async onEnter() {
    await this.map.loadFromFile('./assets/tilemaps/cave/map.json');
    await this.collisionMap.loadFromFile('./assets/tilemaps/cave/collision.json');
    await this.controller.loadFromFile('./assets/controllers/bernard/data.json');
    this.controller.setPosition(160, 260);
    this.selectionRect.setVisible(false);

    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    GWE.eventManager.subscribe(this.controller, 'E_MOVED', this, this.handleControllerMoved);
  }

  update(ts) {
    let cameraMinX = GWE.gfx2Manager.getWidth() * 0.5;
    let cameraMaxX = this.map.getWidth() - GWE.gfx2Manager.getWidth() * 0.5;
    let cameraMinY = GWE.gfx2Manager.getHeight() * 0.5;
    let cameraMaxY = this.map.getHeight() - GWE.gfx2Manager.getHeight() * 0.5;

    GWE.gfx2Manager.setCameraPosition(
      GWE.Utils.CLAMP(this.controller.getPositionX(), cameraMinX, cameraMaxX),
      GWE.Utils.CLAMP(this.controller.getPositionY(), cameraMinY, cameraMaxY)
    );

    this.layerBackground.update(ts);
    this.layerMiddle.update(ts);
    this.controller.update(ts);
    this.layerForeground.update(ts);
    this.selectionRect.update(ts);
  }

  draw() {
    this.layerBackground.draw();
    this.layerMiddle.draw();
    this.controller.draw();
    this.layerForeground.draw();
    this.selectionRect.draw();
  }

  handleControllerMoved({ prevPositionX, prevPositionY }) {
    let position = this.controller.getPosition();
    let halfWidth = this.controller.getWidth() * 0.5;
    let halfHeight = this.controller.getHeight() * 0.5;

    if (position[0] - halfWidth < 0) {
      return this.controller.setPosition(prevPositionX, position[1]);
    }
    if (position[0] + halfWidth > this.map.getWidth()) {
      return this.controller.setPosition(prevPositionX, position[1]);
    }
    if (position[1] - halfHeight < 0) {
      return this.controller.setPosition(position[0], prevPositionY);
    }
    if (position[1] + halfHeight > this.map.getHeight()) {
      return this.controller.setPosition(position[0], prevPositionY);
    }

    let collisionLayer = this.collisionMap.getTileLayer(0);
    if (collisionLayer) {
      let loc00X = Math.floor((position[0] + this.controller.getColliderLeftOffsetX()) / this.collisionMap.getTileWidth());
      let loc00Y = Math.floor((position[1] + this.controller.getColliderLeftOffsetY()) / this.collisionMap.getTileHeight());
      let loc01X = Math.floor((position[0] + this.controller.getColliderRightOffsetX()) / this.collisionMap.getTileWidth());
      let loc01Y = Math.floor((position[1] + this.controller.getColliderRightOffsetY()) / this.collisionMap.getTileHeight());
      if (collisionLayer.getTile(loc00X, loc00Y) == 2 || collisionLayer.getTile(loc01X, loc01Y) == 2) {
        this.controller.setPosition(prevPositionX, prevPositionY);
      }
    }
  }

  handleMouseMove(e) {
    let position = GWE.gfx2Manager.findWorldFromClientPosition(e.clientX, e.clientY);
    let x = Math.floor(position[0] / this.map.getTileWidth()) * this.map.getTileWidth();
    let y = Math.floor(position[1] / this.map.getTileHeight()) * this.map.getTileHeight();
    this.selectionRect.setPosition(x, y);
    this.selectionRect.setVisible(true);
  }
}

module.exports.MainScreen = MainScreen;