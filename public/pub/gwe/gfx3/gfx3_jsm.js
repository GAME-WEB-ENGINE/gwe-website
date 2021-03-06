let { BoundingBox } = require('../bounding/bounding_box');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');
let { gfx3TextureManager } = require('./gfx3_texture_manager');

class JSM {
  constructor() {
    this.vertices = [];
    this.normals = [];
    this.textureCoords = [];
  }
}

/**
 * Classe représentant un modèle static.
 * @extends Gfx3Drawable
 */
class Gfx3JSM extends Gfx3Drawable {
  /**
   * Créer un modèle static.
   */
  constructor() {
    super();
    this.jsm = new JSM();
    this.texture = gfx3TextureManager.getTexture('');
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    this.clearVertices();
    this.clearNormals();
    this.clearTextureCoords();

    for (let i = 0; i < this.jsm.vertices.length; i += 3) {
      let vx = this.jsm.vertices[i + 0];
      let vy = this.jsm.vertices[i + 1];
      let vz = this.jsm.vertices[i + 2];
      this.defineVertice(vx, vy, vz);

      let nx = this.jsm.normals[i + 0];
      let ny = this.jsm.normals[i + 1];
      let nz = this.jsm.normals[i + 2];
      this.defineNormal(nx, ny, nz);      
    }

    for (let i = 0; i < this.jsm.textureCoords.length; i += 2) {
      let tx = this.jsm.textureCoords[i + 0];
      let ty = this.jsm.textureCoords[i + 1];
      this.defineTextureCoord(tx, ty);
    }
  }

  /**
   * Fonction de dessin.
   * @param {number} viewIndex - Index de la vue en cours.
   */
  draw(viewIndex) {
    let worldBoundingBox = this.boundingBox.transform(this.getModelMatrix());
    gfx3Manager.drawDebugBoundingBox(worldBoundingBox.min, worldBoundingBox.max, [1.0, 1.0, 0.0]);
    gfx3Manager.drawMesh(this.getModelMatrix(), this.vertexCount, this.vertices, this.normals, this.textureCoords, this.texture);
  }

  /**
   * Retourne la texture source.
   * @return {Texture} La texture source.
   */
  getTexture() {
    return this.texture;
  }

  /**
   * Définit la texture source.
   * @param {Texture} texture - La texture source.
   */
  setTexture(texture) {
    this.texture = texture;
  }

  /**
   * Charge un fichier "jsm".
   */
  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'JSM') {
      throw new Error('GfxJSM::loadFromFile(): File not valid !');
    }

    this.jsm = new JSM();
    this.jsm.vertices = json['Vertices'];
    this.jsm.normals = json['Normals'];
    this.jsm.textureCoords = json['TextureCoords'];
    this.boundingBox = BoundingBox.createFromVertices(this.jsm.vertices);
  }
}

module.exports.Gfx3JSM = Gfx3JSM;