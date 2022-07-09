let { BoundingBox } = require('../bounding/bounding_box');
let { Utils } = require('../helpers');

/**
 * Classe représentant un objet dessinable.
 */
class Gfx3Drawable {
  constructor() {
    this.position = [0.0, 0.0, 0.0];
    this.rotation = [0.0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];
    this.vertices = [];
    this.normals = [];
    this.textureCoords = [];
    this.vertexCount = 0;
    this.boundingBox = new BoundingBox();
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    // virtual method called during update phase !
  }

  /**
   * Fonction de dessin.
   * @param {number} viewIndex - Index de la vue en cours.
   */
  draw(viewIndex) {
    // virtual method called during draw phase !
  }

  getPosition() {
    return this.position;
  }

  getPositionX() {
    return this.position[0];
  }

  getPositionY() {
    return this.position[1];
  }

  getPositionZ() {
    return this.position[2];
  }

  setPosition(x, y, z) {
    this.position = [x, y, z];
  }

  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
  }

  getRotation() {
    return this.rotation;
  }

  getRotationX() {
    return this.rotation[0];
  }

  getRotationY() {
    return this.rotation[1];
  }

  getRotationZ() {
    return this.rotation[2];
  }
  
  setRotation(x, y, z) {
    this.rotation = [x, y, z];
  }

  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
  }

  getScale() {
    return this.scale;
  }

  getScaleX() {
    return this.scale[0];
  }

  getScaleY() {
    return this.scale[1];
  }

  getScaleZ() {
    return this.scale[2];
  }

  setScale(x, y, z) {
    this.scale = [x, y, z];
  }

  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
  }

  getVertexCount() {
    return this.vertexCount;
  }

  /**
   * Retourne le tableau de points.
   * @return {array} Le tableau de points.
   */
  getVertices() {
    return this.vertices;
  }

  /**
   * Retourne le tableau de normales.
   * @return {array} Le tableau de normales.
   */
  getNormals() {
    return this.normals;
  }

  /**
   * Retourne le tableau de texture coords.
   * @return {array} Le tableau de texture coords.
   */
  getTextureCoords() {
    return this.textureCoords;
  }

  /**
   * Retourne la matrice de modèle.
   * @return {array} Matrice de modèle.
   */
  getModelMatrix() {
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(this.position[0], this.position[1], this.position[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Y(this.rotation[1]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_X(this.rotation[0])); // y -> x -> z
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Z(this.rotation[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(this.scale[0], this.scale[1], this.scale[2]));
    return matrix;
  }

  /**
   * Ajoute un point.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
  */
  defineVertice(x, y, z) {
    this.vertexCount++;
    this.vertices.push(x, y, z);
  }

  /**
   * Ajoute une normale.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
  */
  defineNormal(x, y, z) {
    this.normals.push(x, y, z);
  }

  /**
   * Ajoute une uv.
   * @param {number} u - La coordonnée u.
   * @param {number} v - La coordonnée v.
  */
  defineTextureCoord(u, v) {
    this.textureCoords.push(u, v);
  }

  /**
   * Vide le tableau des points.
   */
  clearVertices() {
    this.vertices = [];
    this.vertexCount = 0;
  }

  /**
   * Vide le tableau des normales.
   */
  clearNormals() {
    this.normals = [];
  }

  /**
   * Vide le tableau des uvs.
   */
  clearTextureCoords() {
    this.textureCoords = [];
  }

  /**
   * Retourne la boite englobante.
   * @return {BoudingBox} La boite englobante.
   */
  getBoundingBox() {
    return this.boundingBox;
  }

  /**
   * Retourne la boite englobante avec les transformations du modèle.
   * @return {BoundingBox} La boite englobante.
   */
  getWorldBoundingBox() {
    return this.boundingBox.transform(this.getModelMatrix());
  }
}

module.exports.Gfx3Drawable = Gfx3Drawable;