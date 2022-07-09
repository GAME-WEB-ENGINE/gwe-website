let { gfx2TextureManager } = require('./gfx2_texture_manager');

class Gfx2Map {
  constructor() {
    this.rows = 0;
    this.columns = 0;
    this.tileHeight = 0;
    this.tileWidth = 0;
    this.tileLayers = [];
    this.tileset = new Gfx2Tileset();
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    this.rows = json['Rows'];
    this.columns = json['Columns'];
    this.tileHeight = json['TileHeight'];
    this.tileWidth = json['TileWidth'];

    this.tileLayers = [];
    for (let obj of json['Layers']) {
      let tileLayer = new Gfx2TileLayer();
      await tileLayer.loadFromData(obj);
      this.tileLayers.push(tileLayer);
    }

    this.tileset = new Gfx2Tileset();

    if (json['Tileset']) {
      await this.tileset.loadFromData(json['Tileset']);
    }
  }

  getHeight() {
    return this.rows * this.tileHeight;
  }

  getWidth() {
    return this.columns * this.tileWidth;
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.columns;
  }

  getTileHeight() {
    return this.tileHeight;
  }

  getTileWidth() {
    return this.tileWidth;
  }

  getTileLayer(index) {
    return this.tileLayers[index];
  }

  findTileLayer(name) {
    return this.tileLayers.find(tileLayer => tileLayer.getName() == name);
  }

  getTileset() {
    return this.tileset;
  }
}

class Gfx2TileLayer {
  constructor() {
    this.name = '';
    this.rows = 0;
    this.columns = 0;
    this.visible = true;
    this.frameDuration = 0;
    this.grid = [];
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.rows = data['Rows'];
    this.columns = data['Columns'];
    this.visible = data['Visible'];
    this.frameDuration = data['FrameDuration'];
    this.grid = data['Grid'];
  }

  getTile(x, y) {
    return this.grid[x + (y * this.columns)];
  }

  getName() {
    return this.name;
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.columns;
  }

  isVisible() {
    return this.visible;
  }

  getFrameDuration() {
    return this.frameDuration;
  }
}

class Gfx2Tileset {
  constructor() {
    this.columns = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.texture = gfx2TextureManager.getDefaultTexture();
    this.animations = {};
  }

  async loadFromData(data) {
    this.columns = parseInt(data['Columns']);
    this.tileWidth = parseInt(data['TileWidth']);
    this.tileHeight = parseInt(data['TileHeight']);
    this.texture = await gfx2TextureManager.loadTexture(data['TextureFile']);

    this.animations = {};
    for (let tileId in data['Animations']) {
      this.animations[tileId] = data['Animations'][tileId] ?? [];
    }
  }

  getTilePositionX(tileId) {
    return ((tileId - 1) % this.columns) * this.tileWidth;
  }

  getTilePositionY(tileId) {
    return Math.floor((tileId - 1) / this.columns) * this.tileHeight;
  }

  getTileHeight() {
    return this.tileHeight;
  }

  getTileWidth() {
    return this.tileWidth;
  }

  getColumns() {
    return this.columns;
  }

  getTexture() {
    return this.texture;
  }

  getAnimation(tileId) {
    return this.animations[tileId];
  }
}

module.exports.Gfx2Map = Gfx2Map;