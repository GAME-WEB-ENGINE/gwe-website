let { Utils } = require('../helpers');
let { Gfx3Viewport } = require('./gfx3_viewport');

/**
 * Type de projection.
 */
let ProjectionModeEnum = {
  PERSPECTIVE: 'PERSPECTIVE',
  ORTHOGRAPHIC: 'ORTHOGRAPHIC'
};

/**
 * Classe représentant une vue/caméra.
 */
class Gfx3View {
  /**
   * Créer une vue.
   */
  constructor() {
    this.position = [0.0, 0.0, 0.0];
    this.rotation = [0.0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];
    this.clipOffset = [0.0, 0.0];
    this.cameraMatrix = Utils.MAT4_IDENTITY();
    this.viewport = new Gfx3Viewport();
    this.backgroundColor = [0.0, 0.0, 0.0, 1.0];
    this.projectionMode = ProjectionModeEnum.PERSPECTIVE;
    this.perspectiveFovy = Math.PI / 4;
    this.perspectiveNear = 2;
    this.perspectiveFar = 2000;
    this.orthographicSize = 1;
    this.orthographicDepth = 700;
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
    this.updateCameraMatrix();
  }

  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
    this.updateCameraMatrix();
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
    this.updateCameraMatrix();
  }

  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
    this.updateCameraMatrix();
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
    this.updateCameraMatrix();
  }

  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
    this.updateCameraMatrix();
  }

  getClipOffset() {
    return this.clipOffset;
  }

  getClipOffsetX() {
    return this.clipOffset[0];
  }

  getClipOffsetY() {
    return this.clipOffset[1];
  }

  setClipOffset(x, y) {
    this.clipOffset = [x, y];
  }

  getClipMatrix() {
    return Utils.MAT4_INVERT(Utils.MAT4_TRANSLATE(this.clipOffset[0], this.clipOffset[1], 0));
  }

  getCameraMatrix() {
    return this.cameraMatrix;
  }

  setCameraMatrix(cameraMatrix) {
    this.cameraMatrix = cameraMatrix;
  }

  getCameraViewMatrix() {
    return Utils.MAT4_INVERT(this.cameraMatrix);
  }

  getViewport() {
    return this.viewport;
  }

  setViewport(viewport) {
    this.viewport = viewport;
  }

  getBackgroundColor() {
    return this.backgroundColor;
  }

  setBackgroundColor(r, g, b, a) {
    this.backgroundColor[0] = r;
    this.backgroundColor[1] = g;
    this.backgroundColor[2] = b;
    this.backgroundColor[3] = a;
  }

  /**
   * Retourne le mode de projection (2D/3D).
   * @return {ProjectionModeEnum} Le mode de projection.
   */
  getProjectionMode() {
    return this.projectionMode;
  }

  /**
   * Définit le mode de projection (2D/3D).
   * @param {ProjectionModeEnum} projectionMode - Le mode de projection.
   */
  setProjectionMode(projectionMode) {
    this.projectionMode = projectionMode;
  }

  /**
   * Retourne l'angle de vision en radian.
   * @return {number} L'angle de vision en radian.
   */
  getPerspectiveFovy() {
    return this.perspectiveFovy;
  }

  /**
   * Définit l'angle de vision en radian.
   * @param {number} perspectiveFovy - L'angle de vision en radian.
   */
  setPerspectiveFovy(perspectiveFovy) {
    this.perspectiveFovy = perspectiveFovy;
  }

  /**
   * Retourne la distance minimale de vision.
   * @return {number} La distance minimale de vision.
   */
  getPerspectiveNear() {
    return this.perspectiveNear;
  }

  /**
   * Définit la distance minimale de vision.
   * @param {number} perspectiveNear - La distance minimale de vision.
   */
  setPerspectiveNear(perspectiveNear) {
    this.perspectiveNear = perspectiveNear;
  }

  /**
   * Retourne la distance maximale de vision.
   * @return {number} La distance maximale de vision.
   */
  getPerspectiveFar() {
    return this.perspectiveFar;
  }

  /**
   * Définit la distance maximale de vision.
   * @param {number} perspectiveFar - La distance maximale de vision.
   */
  setPerspectiveFar(perspectiveFar) {
    this.perspectiveFar = perspectiveFar;
  }

  /**
   * Retourne la taille du cube de vision dans le mode orthographic.
   * @return {number} La taille du cube de vision.
   */
   getOrthographicSize() {
    return this.orthographicSize;
  }

  /**
   * Définit la taille du cube de vision dans le mode orthographic.
   * @param {number} orthographicSize - La taille du cube de vision.
   */
  setOrthographicSize(orthographicSize) {
    this.orthographicSize = orthographicSize;
  }

  /**
   * Retourne la distance maximale de vision dans le mode orthographic.
   * @return {number} La distance maximale de vision.
   */
  getOrthographicDepth() {
    return this.orthographicDepth;
  }

  /**
   * Définit la distance maximale de vision dans le mode orthographic.
   * @param {number} orthographicDepth - La distance maximale de vision.
   */
  setOrthographicDepth(orthographicDepth) {
    this.orthographicDepth = orthographicDepth;
  }

  /**
   * Mets à jour la matrice de caméra à partir de la position, rotation et mise à l'echelle.
   */
  updateCameraMatrix() {
    this.cameraMatrix = Utils.MAT4_IDENTITY();
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_TRANSLATE(this.position[0], this.position[1], this.position[2]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_Y(this.rotation[1]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_X(this.rotation[0])); // y -> x -> z
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_Z(this.rotation[2]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_SCALE(this.scale[0], this.scale[1], this.scale[2]));
  }
}

module.exports.ProjectionModeEnum = ProjectionModeEnum;
module.exports.Gfx3View = Gfx3View;