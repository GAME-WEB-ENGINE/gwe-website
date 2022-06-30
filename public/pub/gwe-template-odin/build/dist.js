(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
let { screenManager } = require('./screen/screen_manager');
let { gfx3Manager } = require('./gfx3/gfx3_manager');
let { uiManager } = require('./ui/ui_manager');

/**
 * Modes d'affichage.
 * FIT: S'adapte à la fenêtre avec déformation.
 * ADJUST: S'adapte à la fenêtre sans déformation.
 * FIXED: Taille fixe (celle de la résolution de l'application).
 */
let SizeModeEnum = {
  FIT: 0,
  ADJUST: 1,
  FIXED: 2,
  FULL: 3
};

/**
 * Classe représentant l'application.
 */
class Application {
  /**
   * Créer une application gwe.
   */
  constructor(resolutionWidth, resolutionHeight, sizeMode = SizeModeEnum.FIT) {
    this.container = null;
    this.timeStep = 0;
    this.timeStamp = 0;
    this.resolutionWidth = resolutionWidth;
    this.resolutionHeight = resolutionHeight;
    this.sizeMode = sizeMode;

    this.container = document.getElementById('APP');
    if (!this.container) {
      throw new Error('Application::Application: APP element not found !');
    }

    this.container.style.width = this.resolutionWidth + 'px';
    this.container.style.height = this.resolutionHeight + 'px';

    if (this.sizeMode == SizeModeEnum.FIT) {
      this.container.style.transform = 'scale(' + window.innerWidth / resolutionWidth + ',' + window.innerHeight / resolutionHeight + ')';
    }
    else if (this.sizeMode == SizeModeEnum.ADJUST) {
      this.container.style.transform = 'scale(' + Math.min(window.innerWidth / resolutionWidth, window.innerHeight / resolutionHeight) + ')';
    }
    else if (this.sizeMode == SizeModeEnum.FIXED) {
      this.container.style.transform = 'none';
      this.container.style.margin = '0 auto';
    }
    else if (this.sizeMode == SizeModeEnum.FULL) {
      this.container.style.width = '100vw';
      this.container.style.height = '100vh';
    }
  }

  /**
   * Retourne le temps écoulé depuis la dernière mise à jour.
   * @return {number} Temps écoulé en ms.
   */
  getTimeStep() {
    return this.timeStep;
  }

  /**
   * Retourne le temps écoulé depuis la dernière mise à jour.
   * @return {number} Temps écoulé en s.
   */
  getTimeStepAsSeconds() {
    return this.timeStep * 0.001;
  }

  /**
   * Retourne le temps écoulé depuis la dernière mise à jour au format unix-timestamp.
   * Cette valeur est mise à jour à chaque itération.
   * @return {number} Temps écoulé en ms.
   */
  getTimeStamp() {
    return this.timeStamp;
  }

  /**
   * Fonction exécuté à chaque rafrachissement du navigateur afin de mettre à jour la logique et l'affichage.
   * @param {number} timeStamp - Temps écoulé en ms.
   */
  run(timeStamp) {
    this.timeStep = Math.min(timeStamp - this.timeStamp, 100);
    this.timeStamp = timeStamp;

    gfx3Manager.update(this.timeStep);
    uiManager.update(this.timeStep);
    screenManager.update(this.timeStep);

    for (let i = 0; i < gfx3Manager.getNumViews(); i++) {
      gfx3Manager.clear(i);
      screenManager.draw(i);
    }

    requestAnimationFrame(timeStamp => this.run(timeStamp));
  }
}

module.exports.SizeModeEnum = SizeModeEnum;
module.exports.Application = Application;
},{"./gfx3/gfx3_manager":15,"./screen/screen_manager":26,"./ui/ui_manager":38}],3:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');

/**
 * Classe représentant une collection d'éléments.
 */
class ArrayCollection {
  /**
   * Créer une collection.
   * @param {array} items - Le tableau lié à la collection.
   */
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Récupère le talbleau lié.
   * @return {array} La tableau lié.
   */
  getItems() {
    return this.items;
  }

  /**
   * Ajoute un élément à la fin du tableau.
   * @param {*} item - L'élément à ajouter.
   * @param {boolean} emit - Si vrai, l'évènement "E_ITEM_ADDED" est emit.
   * @return {number} La nouvelle taille du tableau.
   */
  push(item, emit = false) {
    let length = this.items.push(item);
    if (emit) {
      eventManager.emit(this, 'E_ITEM_ADDED', { item: item, index: this.items.indexOf(item) });
    }

    return length;
  }

  /**
   * Retire un élément à la fin du tableau.
   * @param {boolean} emit - Si vrai, l'évènement "E_ITEM_REMOVED" est emit.
   * @return {*} L'élèment supprimé.
   */
  pop(emit = false) {
    let item = this.items.pop();
    if (emit) {
      eventManager.emit(this, 'E_ITEM_REMOVED', { item: item, index: this.items.length });
    }

    return item;
  }

  /**
   * Supprime un élément.
   * @param {*} item - L'élément à supprimer.
   * @param {boolean} emit - Si vrai, l'évènement "E_ITEM_REMOVED" est emit.
   * @return {number} L'index de l'élèment supprimé.
   */
  remove(item, emit = false) {
    let index = this.items.indexOf(item);
    this.items.splice(index, 1);
    if (emit) {
      eventManager.emit(this, 'E_ITEM_REMOVED', { item: item, index: index });
    }

    return index;
  }

  /**
   * Supprime l'élèment à l'index donné.
   * @param {number} index - Index de l'élèment.
   * @param {boolean} emit - Si vrai, l'évènement "E_ITEM_REMOVED" est emit.
   * @return {*} L'élèment supprimé.
   */
  removeAt(index, emit = false) {
    let item = this.items.splice(index, 1);
    if (emit) {
      eventManager.emit(this, 'E_ITEM_REMOVED', { item: item, index: index });
    }

    return item;
  }

  /**
   * Vérifie si l'élèment est dans le tableau.
   * @param {*} item - L'élèment à vérifier.
   * @return {boolean} Retourne vrai si l'élèment est dans la tableau.
   */
  has(item) {
    return this.items.indexOf(item) != -1;
  }

  /**
   * Vide le tableau.
   * @param {boolean} emit - Si vrai, l'évènement "E_ITEM_REMOVED" est emit.
   */
  clear(emit = false) {
    while (this.items.length) {
      this.items.pop(emit);
    }
  }
}

module.exports.ArrayCollection = ArrayCollection;
},{"../event/event_manager":6}],4:[function(require,module,exports){
let { Utils } = require('../helpers');

/**
 * Classe représentant une boite englobante en trois-dimensions.
 */
class BoundingBox {
  /**
   * Créer une boite englobante.
   * @param {array} min - Point minimum (3 entrées).
   * @param {array} max - Point maximum (3 entrées).
   */
  constructor(min = [0, 0, 0], max = [0, 0, 0]) {
    this.min = min;
    this.max = max;
  }

  /**
   * Créer une boite englobante à partir d'un ensemble de points.
   * @param {array} vertices - Ensemble de points.
   * @return {BoundingBox} La boite englobante.
   */
  static createFromVertices(vertices) {
    let min = vertices.slice(0, 3);
    let max = vertices.slice(0, 3);
    for (let i = 0; i < vertices.length; i += 3) {
      for (let j = 0; j < 3; j++) {
        let v = vertices[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }

    return new BoundingBox(min, max);
  }

  /**
   * Retourne les coordonnées du centre.
   * @return {array} Coordonné du centre (3 entrées).
   */
  getCenter() {
    let w = this.max[0] - this.min[0];
    let h = this.max[1] - this.min[1];
    let d = this.max[2] - this.min[2];
    let x = this.min[0] + (w * 0.5);
    let y = this.min[1] + (h * 0.5);
    let z = this.min[2] + (d * 0.5);
    return [x, y, z];
  }

  /**
   * Retourne la taille.
   * @return {object} Avec "w" pour la largeur, "h" la hauteur et "d" la profondeur.
   */
  getSize() {
    let w = this.max[0] - this.min[0];
    let h = this.max[1] - this.min[1];
    let d = this.max[2] - this.min[2];
    return { w, h, d };
  }

  /**
   * Retourne le rayon.
   * @return {number} La valeur du rayon.
   */
  getRadius() {
    return Utils.VEC3_DISTANCE(this.min, this.max) * 0.5;
  }

  /**
   * Retourne le périmètre.
   * @return {number} La valeur du périmètre.
   */
  getPerimeter() {
    let w = this.max[0] - this.min[0];
    let d = this.max[2] - this.min[2];
    return w + w + d + d;
  }

  /**
   * Retourne le volume.
   * @return {number} La valeur du volume.
   */
  getVolume() {
    return (this.max[0] - this.min[0]) * (this.max[1] - this.min[1]) * (this.max[2] - this.min[2]);
  }

  /**
   * Retourne une nouvelle boite englobante transformé.
   * @param {array} matrix - Matrice de transformation (16 entrées).
   * @return {BoundingBox} La nouvelle boite englobante.
   */
  transform(matrix) {
    let points = [];
    points.push([this.min[0], this.min[1], this.min[2]]);
    points.push([this.max[0], this.min[1], this.min[2]]);
    points.push([this.max[0], this.max[1], this.min[2]]);
    points.push([this.min[0], this.max[1], this.min[2]]);
    points.push([this.min[0], this.max[1], this.max[2]]);
    points.push([this.max[0], this.max[1], this.max[2]]);
    points.push([this.max[0], this.min[1], this.max[2]]);
    points.push([this.min[0], this.min[1], this.max[2]]);

    let transformedPoints = points.map((p) => {
      return Utils.MAT4_MULTIPLY_BY_VEC4(matrix, [p[0], p[1], p[2], 1]);
    });

    let min = [transformedPoints[0][0], transformedPoints[0][1], transformedPoints[0][2]];
    let max = [transformedPoints[0][0], transformedPoints[0][1], transformedPoints[0][2]];

    for (let i = 0; i < transformedPoints.length; i++) {
      for (let j = 0; j < 3; j++) {
        let v = transformedPoints[i][j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }

    return new BoundingBox(min, max);
  }

  /**
   * Vérifie si un point est dans la boite englobante.
   * @param {number} x - Coordonnée x du point.
   * @param {number} y - Coordonnée y du point.
   * @param {number} z - Coordonnée z du point.
   * @return {boolean} Vrai si le point est dans la boite englobante.
   */
  isPointInside(x, y, z) {
    return (
      (x >= this.min[0] && x <= this.max[0]) &&
      (y >= this.min[1] && y <= this.max[1]) &&
      (z >= this.min[2] && z <= this.max[2])
    );
  }

  /**
   * Vérifie si la boite englobante rentre en intersection avec une autre boite englobante.
   * @param {BoundingBox} aabb - Autre boite englobante.
   * @return {boolean} Vrai si il y a intersection.
   */
  intersectBoundingBox(aabb) {
    return (
      (this.min[0] <= aabb.max[0] && this.max[0] >= aabb.min[0]) &&
      (this.min[1] <= aabb.max[1] && this.max[1] >= aabb.min[1]) &&
      (this.min[2] <= aabb.max[2] && this.max[2] >= aabb.min[2])
    );
  }
}

module.exports.BoundingBox = BoundingBox;
},{"../helpers":22}],5:[function(require,module,exports){
let { Utils } = require('../helpers');

/**
 * Classe représentant un rectangle englobante en deux-dimensions.
 */
class BoundingRect {
  /**
   * Créer un rectangle englobante.
   * @param {array} min - Point minimum (2 entrées).
   * @param {array} max - Point maximum (2 entrées).
   */
  constructor(min = [0, 0], max = [0, 0]) {
    this.min = min;
    this.max = max;
  }

  /**
   * Créer un rectangle englobante à partir d'un ensemble de points.
   * @param {array} vertices - Ensemble de points.
   * @return {BoundingRect} Le rectangle englobant.
   */
  static createFromVertices(vertices) {
    let min = vertices.slice(0, 2);
    let max = vertices.slice(0, 2);

    for (let i = 0; i < vertices.length; i += 3) {
      for (let j = 0; j < 2; j++) {
        let v = vertices[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }

    return new BoundingRect(min, max);
  }

  /**
   * Retourne les coordonnées du centre.
   * @return {array} Coordonné du centre (3 entrées).
   */
  getCenter() {
    let w = this.max[0] - this.min[0];
    let h = this.max[1] - this.min[1];
    let x = this.min[0] + (w * 0.5);
    let y = this.min[1] + (h * 0.5);
    return [x, y];
  }

  /**
   * Retourne la taille.
   * @return {object} Avec "w" pour la largeur, "h" la hauteur.
   */
  getSize() {
    let w = this.max[0] - this.min[0];
    let h = this.max[1] - this.min[1];
    return { w, h };
  }

  /**
   * Retourne le rayon.
   * @return {number} La valeur du rayon.
   */
   getRadius() {
    return Utils.VEC2_DISTANCE(this.min, this.max) * 0.5;
  }

  /**
   * Retourne le périmètre.
   * @return {number} La valeur du périmètre.
   */
  getPerimeter() {
    let w = this.max[0] - this.min[0];
    let h = this.max[1] - this.min[1];
    return w + w + h + h;
  }

  /**
   * Retourne le volume.
   * @return {number} La valeur du volume.
   */
  getVolume() {
    return (this.max[0] - this.min[0]) * (this.max[1] - this.min[1]);
  }

  /**
   * Retourne une nouvelle rectangle englobante transformé.
   * @param {array} matrix - Matrice de transformation (16 entrées).
   * @return {BoundingRect} La nouvelle rectangle englobante.
   */
  transform(matrix) {
    let points = [];
    points.push([this.min[0], this.min[1]]);
    points.push([this.max[0], this.min[1]]);
    points.push([this.max[0], this.max[1]]);
    points.push([this.min[0], this.max[1]]);

    let transformedPoints = points.map((p) => {
      return Utils.MAT4_MULTIPLY_BY_VEC4(matrix, [p[0], p[1], 0, 1]);
    });

    let min = [transformedPoints[0][0], transformedPoints[0][1]];
    let max = [transformedPoints[0][0], transformedPoints[0][1]];

    for (let i = 0; i < transformedPoints.length; i++) {
      for (let j = 0; j < 2; j++) {
        let v = transformedPoints[i][j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }

    return new BoundingRect(min, max);
  }

  /**
   * Vérifie si un point est dans le rectangle englobant.
   * @param {number} x - Coordonnée x du point.
   * @param {number} y - Coordonnée y du point.
   * @return {boolean} Vrai si le point est dans le rectangle englobant.
   */
  isPointInside(x, y) {
    return (
      (x >= this.min[0] && x <= this.max[0]) &&
      (y >= this.min[1] && y <= this.max[1])
    );
  }

  /**
   * Vérifie si le rectangle englobant rentre en intersection avec une autre rectangle englobante.
   * @param {BoundingRect} aabr - Autre rectangle englobante.
   * @return {boolean} Vrai si il y a intersection.
   */
  intersectBoundingRect(aabr) {
    return (
      (this.min[0] <= aabr.max[0] && this.max[0] >= aabr.min[0]) &&
      (this.min[1] <= aabr.max[1] && this.max[1] >= aabr.min[1])
    );
  }
}

module.exports.BoundingRect = BoundingRect;
},{"../helpers":22}],6:[function(require,module,exports){
let { EventSubscriber } = require('./event_subscriber');

/**
 * Singleton représentant une gestionnaire d'évènements.
 */
class EventManager {
  /**
   * Créer un gestionnaire d'évènements.
   */
  constructor() {
    this.subscribers = [];
  }

  /**
   * Attend l'arrivé d'un évènement.
   * @param {object} emitter - L'objet émetteur.
   * @param {string} type - Le type d'évènement.
   * @return {Promise} Promesse.
   */
  wait(emitter, type) {
    return new Promise(resolve => {
      this.subscribeOnce(emitter, type, this, (data) => {
        resolve(data);
      });
    });
  }

  /**
   * Inscription à un évènement.
   * @param {object} emitter - L'objet émetteur.
   * @param {string} type - Le type d'évènement.
   * @param {object} listener - L'objet écouteur.
   * @param {function} cb - La fonction à appeler
   */
  subscribe(emitter, type, listener, cb) {
    if (!emitter) {
      throw new Error('EventManager::subscribe(): emitter is undefined !');
    }
    if (!type) {
      throw new Error('EventManager::subscribe(): type is undefined !');
    }
    if (!cb || typeof cb != 'function') {
      throw new Error('EventManager::subscribe(): cb is not a function !');
    }

    this.subscribers.push(new EventSubscriber(emitter, type, listener, false, cb));
  }

  /**
   * Inscription à un évènement.
   * Attention cependant, l'inscription est supprimer après le premier appel.
   * @param {object} emitter - L'objet émetteur.
   * @param {string} type - Le type d'évènement.
   * @param {object} listener - L'objet écouteur.
   * @param {function} cb - La fonction à appeler
   */
  subscribeOnce(emitter, type, listener, cb) {
    if (!emitter) {
      throw new Error('EventManager::subscribe(): emitter is undefined !');
    }
    if (!type) {
      throw new Error('EventManager::subscribe(): type is undefined !');
    }
    if (!cb || typeof cb != 'function') {
      throw new Error('EventManager::subscribe(): cb is not a function !');
    }

    this.subscribers.push(new EventSubscriber(emitter, type, listener, true, cb));
  }

  /**
   * Desinscription à un évènement.
   * @param {object} emitter - L'objet émetteur.
   * @param {string} type - Le type d'évènement.
   * @param {object} listener - L'objet écouteur.
   */
  unsubscribe(emitter, type, listener) {
    for (let subscriber of this.subscribers) {
      if (subscriber.emitter == emitter && subscriber.type == type && subscriber.listener == listener) {
        this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
        return;
      }
    }
  }

  /**
   * Desinscription de tous les évènements.
   */
  unsubscribeAll() {
    this.subscribers = [];
  }

  /**
   * Emet un évènement.
   * @param {object} emitter - L'objet émetteur.
   * @param {string} type - Le type d'évènement.
   * @param {object} data - Données transitoires.
   * @return {Promise} Promesse resolue lorsque tous les écouteurs ont terminés.
   */
  async emit(emitter, type, data) {
    let promises = [];

    for (let subscriber of this.subscribers.slice()) {
      if (subscriber.emitter == emitter && subscriber.type == type) {
        let res = subscriber.cb.call(subscriber.listener, data);
        if (res instanceof Promise) {
          promises.push(res);
        }
  
        if (subscriber.once) {
          this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
        }
      }
    }

    return Promise.all(promises);
  }
}

module.exports.eventManager = new EventManager();
},{"./event_subscriber":7}],7:[function(require,module,exports){
/**
 * Classe représentant une inscription à un évènement.
 */
class EventSubscriber {
  constructor(emitter, type, listener, once, cb) {
    this.emitter = emitter;
    this.type = type;
    this.listener = listener;
    this.once = once;
    this.cb = cb;
  }
}

module.exports.EventSubscriber = EventSubscriber;
},{}],8:[function(require,module,exports){
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');

class Gfx3CollisionBox extends Gfx3Drawable {
  constructor() {
    super();
    this.properties = {};
  }

  draw() {
    gfx3Manager.drawDebugBoundingBox(this.getModelMatrix(), this.boundingBox.min, this.boundingBox.max, [0, 0, 1]);
  }

  setBoundingBox(aabb) {
    this.boundingBox = aabb;
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  getWorldBoundingBox() {
    return this.boundingBox.transform(this.getModelMatrix());
  }

  setProperties(properties) {
    this.properties = properties;
  }

  setProperty(name, value) {
    this.properties[name] = value;
  }

  getProperty(name) {
    return this.properties[name];
  }
}

module.exports.Gfx3CollisionBox = Gfx3CollisionBox;
},{"./gfx3_drawable":9,"./gfx3_manager":15}],9:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"../helpers":22}],10:[function(require,module,exports){
let { BoundingBox } = require('../bounding/bounding_box');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');
let { gfx3TextureManager } = require('./gfx3_texture_manager');
let { eventManager } = require('../event/event_manager');

class JAM {
  constructor() {
    this.frames = [];
    this.textureCoords = [];
    this.animations = [];
  }
}

class JAMFrame {
  constructor() {
    this.vertices = [];
    this.normals = [];
  }
}

class JAMAnimation {
  constructor() {
    this.name = '';
    this.startFrame = 0;
    this.endFrame = 0;
    this.frameDuration = 0;
  }
}

/**
 * Classe représentant un modèle animé.
 */
class Gfx3JAM extends Gfx3Drawable {
  /**
   * Créer un modèle animé.
   */
  constructor() {
    super();
    this.jam = new JAM();
    this.texture = gfx3TextureManager.getTexture('');
    this.currentAnimationName = '';
    this.isLooped = true;
    this.currentFrameIndex = 0;
    this.frameProgress = 0;
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    let currentAnimation = this.jam.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let interpolateFactor = this.frameProgress / currentAnimation.frameDuration;
    let nextFrameIndex = 0;

    if (this.currentFrameIndex == currentAnimation.endFrame) {
      eventManager.emit(this, 'E_FINISHED');
      nextFrameIndex = this.isLooped ? currentAnimation.startFrame : currentAnimation.endFrame;
    }
    else {
      nextFrameIndex = this.currentFrameIndex + 1;
    }

    let currentFrame = this.jam.frames[this.currentFrameIndex];
    let nextFrame = this.jam.frames[nextFrameIndex];

    this.clearVertices();
    this.clearNormals();
    this.clearTextureCoords();

    for (let i = 0; i < currentFrame.vertices.length; i += 3) {
      let vax = currentFrame.vertices[i + 0];
      let vay = currentFrame.vertices[i + 1];
      let vaz = currentFrame.vertices[i + 2];
      let nax = currentFrame.normals[i + 0];
      let nay = currentFrame.normals[i + 1];
      let naz = currentFrame.normals[i + 2];
      let vbx = nextFrame.vertices[i + 0];
      let vby = nextFrame.vertices[i + 1];
      let vbz = nextFrame.vertices[i + 2];
      let nbx = nextFrame.normals[i + 0];
      let nby = nextFrame.normals[i + 1];
      let nbz = nextFrame.normals[i + 2];

      let vx = vax + ((vbx - vax) * interpolateFactor);
      let vy = vay + ((vby - vay) * interpolateFactor);
      let vz = vaz + ((vbz - vaz) * interpolateFactor);
      this.defineVertice(vx, vy, vz);

      let nx = nax + ((nbx - nax) * interpolateFactor);
      let ny = nay + ((nby - nay) * interpolateFactor);
      let nz = naz + ((nbz - naz) * interpolateFactor);
      this.defineNormal(nx, ny, nz);
    }

    for (let i = 0; i < this.jam.textureCoords.length; i += 2) {
      let tx = this.jam.textureCoords[i + 0];
      let ty = this.jam.textureCoords[i + 1];
      this.defineTextureCoord(tx, ty);
    }

    if (interpolateFactor >= 1) {
      this.currentFrameIndex = nextFrameIndex;
      this.frameProgress = 0;
    }
    else {
      this.frameProgress += ts;
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
   * Charge un fichier "jam".
   */
  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'JAM') {
      throw new Error('GfxJAM::loadFromFile(): File not valid !');
    }

    this.jam = new JAM();

    for (let obj of json['Frames']) {
      let frame = new JAMFrame();
      frame.vertices = obj['Vertices'];
      frame.normals = obj['Normals'];
      this.jam.frames.push(frame);
    }

    this.jam.textureCoords = json['TextureCoords'];

    for (let obj of json['Animations']) {
      let animation = new JAMAnimation();
      animation.name = obj['Name'];
      animation.startFrame = parseInt(obj['StartFrame']);
      animation.endFrame = parseInt(obj['EndFrame']);
      animation.frameDuration = parseInt(obj['FrameDuration']);
      this.jam.animations.push(animation);
    }

    this.boundingBox = BoundingBox.createFromVertices(this.jam.frames[0].vertices);
    this.currentAnimationName = '';
    this.isLooped = true;
    this.currentFrameIndex = 0;
    this.frameProgress = 0;
  }

  /**
   * Lance une animation.
   * @param {string} animationName - Le nom de l'animation.
   * @param {boolean} isLooped - Si vrai, l'animation est en boucle.
   */
  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    let animation = this.jam.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('GfxJAM::play: animation not found !');
    }

    this.currentAnimationName = animationName;
    this.isLooped = isLooped;
    this.currentFrameIndex = animation.startFrame;
    this.frameProgress = 0;
  }
}

module.exports.Gfx3JAM = Gfx3JAM;
},{"../bounding/bounding_box":4,"../event/event_manager":6,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],11:[function(require,module,exports){
let { Utils } = require('../helpers');
let { BoundingBox } = require('../bounding/bounding_box');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');
let { gfx3TextureManager } = require('./gfx3_texture_manager');
let { eventManager } = require('../event/event_manager');

class JAS {
  constructor() {
    this.animations = [];
  }
}

class JASFrame {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class JASAnimation {
  constructor() {
    this.name = '';
    this.frames = [];
    this.frameDuration = 0;
  }
}

/**
 * Classe représentant un sprite animé.
 * @extends Gfx3Drawable
 */
class Gfx3JAS extends Gfx3Drawable {
  /**
   * Créer un sprite animé.
   */
  constructor() {
    super();
    this.jas = new JAS();
    this.offset = [0, 0];
    this.pixelsPerUnit = 100;
    this.texture = gfx3TextureManager.getTexture('');
    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.isLooped = false;
    this.frameProgress = 0;
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    let currentAnimation = this.jas.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let currentFrame = currentAnimation.frames[this.currentAnimationFrameIndex];

    this.clearVertices();
    this.clearNormals();
    this.clearTextureCoords();

    let minX = 0;
    let minY = 0;
    let maxX = currentFrame.width;
    let maxY = currentFrame.height;
    this.defineVertice(minX, maxY, 0);
    this.defineVertice(minX, minY, 0);
    this.defineVertice(maxX, minY, 0);
    this.defineVertice(maxX, minY, 0);
    this.defineVertice(maxX, maxY, 0);
    this.defineVertice(minX, maxY, 0);

    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);

    let ux = (currentFrame.x / this.texture.width);
    let uy = (currentFrame.y / this.texture.height);
    let vx = (currentFrame.x + currentFrame.width) / this.texture.width;
    let vy = (currentFrame.y + currentFrame.height) / this.texture.height;
    this.defineTextureCoord(ux, uy);
    this.defineTextureCoord(ux, vy);
    this.defineTextureCoord(vx, vy);
    this.defineTextureCoord(vx, vy);
    this.defineTextureCoord(vx, uy);
    this.defineTextureCoord(ux, uy);

    if (this.frameProgress >= currentAnimation.frameDuration) {
      if (this.currentAnimationFrameIndex == currentAnimation.frames.length - 1) {
        eventManager.emit(this, 'E_FINISHED');
        this.currentAnimationFrameIndex = this.isLooped ? 0 : currentAnimation.frames.length - 1;
        this.frameProgress = 0;
      }
      else {
        this.currentAnimationFrameIndex = this.currentAnimationFrameIndex + 1;
        this.frameProgress = 0;
      }
    }
    else {
      this.frameProgress += ts;
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
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(1 / this.pixelsPerUnit, 1 / this.pixelsPerUnit, 0));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(-this.offset[0], -this.offset[1], 0));
    return matrix;
  }

  /**
   * Retourne le décallage du sprite par rapport à l'origine.
   * @return {array} Décallage du sprite (2 entrées).
   */
  getOffset() {
    return this.offset;
  }

  /**
   * Définit le décallage du sprite par rapport à l'origine.
   * @param {number} offsetX - Décallage en x.
   * @param {number} offsetY - Décallage en y.
   */
  setOffset(offsetX, offsetY) {
    this.offset = [offsetX, offsetY];
  }

  /**
   * Retourne la valeur de conversion px vers unité du monde.
   * @return {array} La valeur de conversion.
   */
  getPixelsPerUnit() {
    return this.pixelsPerUnit;
  }

  /**
   * Définit la valeur de conversion px vers unité du monde.
   * @param {number} pixelsPerUnit - La valeur de conversion.
   */
  setPixelsPerUnit(pixelsPerUnit) {
    this.pixelsPerUnit = pixelsPerUnit;
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
   * Charge un fichier "jas".
   */
  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'JAS') {
      throw new Error('GfxJAS::loadFromFile(): File not valid !');
    }

    this.jas = new JAS();

    for (let obj of json['Animations']) {
      let animation = new JASAnimation();
      animation.name = obj['Name'];
      animation.frameDuration = parseInt(obj['FrameDuration']);

      for (let objFrame of obj['Frames']) {
        let frame = new JASFrame();
        frame.x = objFrame['X'];
        frame.y = objFrame['Y'];
        frame.width = objFrame['Width'];
        frame.height = objFrame['Height'];
        animation.frames.push(frame);
      }

      this.jas.animations.push(animation);
    }

    this.currentAnimationName = '';
    this.currentAnimationIndex = 0;
    this.frameProgress = 0;
  }

  /**
   * Lance une animation.
   * @param {string} animationName - Le nom de l'animation.
   * @param {boolean} isLooped - Si vrai, l'animation est en boucle.
   */
  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    let animation = this.jas.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('GfxJAS::play: animation not found.');
    }

    this.boundingBox = new BoundingBox([0, 0, 0], [animation.frames[0].width, animation.frames[0].height, 0]);
    this.currentAnimationName = animationName;
    this.currentAnimationFrameIndex = 0;
    this.isLooped = isLooped;
    this.frameProgress = 0;
  }
}

module.exports.Gfx3JAS = Gfx3JAS;
},{"../bounding/bounding_box":4,"../event/event_manager":6,"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],12:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],13:[function(require,module,exports){
let { Utils } = require('../helpers');
let { BoundingBox } = require('../bounding/bounding_box');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');
let { gfx3TextureManager } = require('./gfx3_texture_manager');

/**
 * Classe représentant un sprite static.
 * @extends Gfx3Drawable
 */
class Gfx3JSS extends Gfx3Drawable {
  /**
   * Créer un sprite static.
   */
  constructor() {
    super();
    this.textureRect = [0, 0, 0, 0];
    this.offset = [0, 0];
    this.pixelsPerUnit = 100;
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

    let minX = 0;
    let minY = 0;
    let maxX = this.textureRect[2];
    let maxY = this.textureRect[3];
    this.defineVertice(minX, maxY, 0);
    this.defineVertice(minX, minY, 0);
    this.defineVertice(maxX, minY, 0);
    this.defineVertice(maxX, minY, 0);
    this.defineVertice(maxX, maxY, 0);
    this.defineVertice(minX, maxY, 0);

    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);
    this.defineNormal(0, 0, 0);

    let ux = (this.textureRect[0] / this.texture.width);
    let uy = (this.textureRect[1] / this.texture.height);
    let vx = (this.textureRect[0] + this.textureRect[2]) / this.texture.width;
    let vy = (this.textureRect[1] + this.textureRect[3]) / this.texture.height;
    this.defineTextureCoord(ux, uy);
    this.defineTextureCoord(ux, vy);
    this.defineTextureCoord(vx, vy);
    this.defineTextureCoord(vx, vy);
    this.defineTextureCoord(vx, uy);
    this.defineTextureCoord(ux, uy);
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
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(1 / this.pixelsPerUnit, 1 / this.pixelsPerUnit, 0));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(-this.offset[0], -this.offset[1], 0));
    return matrix;
  }

  /**
   * Retourne le rectangle de texture.
   * @return {array} Rectangle de texture (4 entrées).
   */
  getTextureRect() {
    return this.textureRect;
  }

  /**
   * Définit le rectangle de texture.
   * @param {number} left - Coordonnée gauche.
   * @param {number} top - Coordonnée haut.
   * @param {number} width - Largeur.
   * @param {number} height - Hauteur.
   */
  setTextureRect(left, top, width, height) {
    this.textureRect = [left, top, width, height];
    this.boundingBox = new BoundingBox([0, 0, 0], [width, height, 0]);
  }

  /**
   * Retourne le décallage du sprite par rapport à l'origine.
   * @return {array} Décallage du sprite (2 entrées).
   */
  getOffset() {
    return this.offset;
  }

  /**
   * Définit le décallage du sprite par rapport à l'origine.
   * @param {number} offsetX - Décallage en x.
   * @param {number} offsetY - Décallage en y.
   */
  setOffset(offsetX, offsetY) {
    this.offset = [offsetX, offsetY];
  }

  /**
   * Retourne la valeur de conversion px vers unité du monde.
   * @return {array} La valeur de conversion.
   */
  getPixelsPerUnit() {
    return this.pixelsPerUnit;
  }

  /**
   * Définit la valeur de conversion px vers unité du monde.
   * @param {number} pixelsPerUnit - La valeur de conversion.
   */
  setPixelsPerUnit(pixelsPerUnit) {
    this.pixelsPerUnit = pixelsPerUnit;
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
}

module.exports.Gfx3JSS = Gfx3JSS;
},{"../bounding/bounding_box":4,"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],14:[function(require,module,exports){
let { Utils } = require('../helpers');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');

class JWM {
  constructor() {
    this.vertices = [];
    this.sectors = [];
  }
}

class JWMSector {
  constructor() {
    this.id = '';
    this.vertices = [];
  }

  getWeightsAt(x, z) {
    let f = [x, 0, z];
    let a = this.vertices[0];
    let b = this.vertices[1];
    let c = this.vertices[2];

    let vecteurAB = [b[0] - a[0], 0, b[2] - a[2]];
    let vecteurAC = [c[0] - a[0], 0, c[2] - a[2]];
    let vecteurFA = [a[0] - f[0], 0, a[2] - f[2]];
    let vecteurFB = [b[0] - f[0], 0, b[2] - f[2]];
    let vecteurFC = [c[0] - f[0], 0, c[2] - f[2]];
    let area = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(vecteurAB, vecteurAC));

    let wa = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(vecteurFB, vecteurFC)) / area;
    let wb = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(vecteurFA, vecteurFC)) / area;
    let wc = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(vecteurFA, vecteurFB)) / area;

    if ((Math.round((wa + wb + wc) * 1e2) / 1e2) > 1) {
      wa = -1; wb = -1; wc = -1;
    }

    return { wa, wb, wc };
  }

  getElevationAt(x, z) {
    let a = this.vertices[0];
    let b = this.vertices[1];
    let c = this.vertices[2];

    let weights = this.getWeightsAt(x, z);
    if (weights.wa == -1 || weights.wb == -1 || weights.wc == -1) return Infinity;

    // pour finir, nous déterminons la coordonnée 'y' grâce aux poids precedemment trouvés.
    // celà est possible car : wa*HA + wb*HB = 0 et wa+wb*GH + wc*GC = 0.
    let vert = a[1] + ((b[1] - a[1]) * (weights.wb / (weights.wa + weights.wb)));
    let elev = vert + ((c[1] - vert) * (weights.wc / (weights.wa + weights.wb + weights.wc)));

    return elev;
  }
}

/**
 * Classe représentant un mesh de navigation (alias walkmesh).
 * @extends Gfx3Drawable
 */
class Gfx3JWM extends Gfx3Drawable {
  /**
   * Créer un mesh de navigation.
   */
  constructor() {
    super();
    this.jwm = new JWM();
  }

  /**
   * Fonction de dessin.
   * @param {number} viewIndex - Index de la vue en cours.
   */
  draw(viewIndex) {
    gfx3Manager.drawDebugLines(this.getModelMatrix(), this.vertexCount, this.vertices, [1.0, 0.0, 0.5]);
  }

  /**
   * Charge un fichier "jwm".
   * @param {string} path - Le chemin du fichier.
   */
  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'JWM') {
      throw new Error('GfxJWM::loadFromFile(): File not valid !');
    }

    this.clearVertices();
    this.jwm = new JWM();

    for (let arr of json['Vertices']) {
      this.jwm.vertices.push([arr[0], arr[1], arr[2]]);
    }

    for (let obj of json['Sectors']) {
      let sector = new JWMSector();
      sector.id = obj['Id'];
      sector.vertices[0] = this.jwm.vertices[obj['VertexIndices'][0]];
      sector.vertices[1] = this.jwm.vertices[obj['VertexIndices'][1]];
      sector.vertices[2] = this.jwm.vertices[obj['VertexIndices'][2]];
      this.defineVertice(sector.vertices[0][0], sector.vertices[0][1], sector.vertices[0][2]);
      this.defineVertice(sector.vertices[1][0], sector.vertices[1][1], sector.vertices[1][2]);
      this.defineVertice(sector.vertices[0][0], sector.vertices[0][1], sector.vertices[0][2]);
      this.defineVertice(sector.vertices[2][0], sector.vertices[2][1], sector.vertices[2][2]);
      this.defineVertice(sector.vertices[1][0], sector.vertices[1][1], sector.vertices[1][2]);
      this.defineVertice(sector.vertices[2][0], sector.vertices[2][1], sector.vertices[2][2]);
      this.jwm.sectors.push(sector);
    }
  }

  /**
   * Retourne l'élévation en y pour la position x,z.
   * Note: Si cette élévation est égale à l'infinie alors le x,z est en dehors du mesh de navigation.
   * @return {number} L'élévation en y.
   */
  getElevationAt(x, z) {
    for (let sector of this.jwm.sectors) {
      let minX = Math.min(sector.vertices[0][0], sector.vertices[1][0], sector.vertices[2][0]);
      let minZ = Math.min(sector.vertices[0][2], sector.vertices[1][2], sector.vertices[2][2]);
      let maxX = Math.max(sector.vertices[0][0], sector.vertices[1][0], sector.vertices[2][0]);
      let maxZ = Math.max(sector.vertices[0][2], sector.vertices[1][2], sector.vertices[2][2]);
      if (x < minX || x > maxX || z < minZ || z > maxZ) {
        continue;
      }

      let elevation = sector.getElevationAt(x, z);
      if (elevation != Infinity) {
        return elevation;
      }
    }

    return Infinity;
  }
}

module.exports.Gfx3JWM = Gfx3JWM;
},{"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15}],15:[function(require,module,exports){
let { Utils } = require('../helpers');
let { DEFAULT_VERTEX_SHADER, DEFAULT_PIXEL_SHADER, DEBUG_VERTEX_SHADER, DEBUG_PIXEL_SHADER } = require('./gfx3_shaders');
let { ProjectionModeEnum, Gfx3View } = require('./gfx3_view');

/**
 * Singleton représentant un gestionnaire graphique.
 */
class Gfx3Manager {
  /**
   * Créer un gestionnaire graphique.
   */
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.views = [];
    this.defaultShader = null;
    this.defaultShaderUniforms = {};
    this.debugShader = null;
    this.debugShaderUniforms = {};
    this.showDebug = false;

    this.canvas = document.getElementById('CANVAS');
    if (!this.canvas) {
      throw new Error('Gfx3Manager::Gfx3Manager: CANVAS not found');
    }

    this.gl = this.canvas.getContext('webgl2');
    if (!this.gl) {
      throw new Error('Gfx3Manager::Gfx3Manager: Your browser not support WebGL2');
    }

    this.views[0] = new Gfx3View();

    this.defaultShader = CREATE_SHADER_PROGRAM(this.gl, DEFAULT_VERTEX_SHADER, DEFAULT_PIXEL_SHADER);
    this.defaultShaderUniforms.cMatrix = this.gl.getUniformLocation(this.defaultShader, 'uClipMatrix');
    this.defaultShaderUniforms.pMatrix = this.gl.getUniformLocation(this.defaultShader, 'uProjectionMatrix');
    this.defaultShaderUniforms.vMatrix = this.gl.getUniformLocation(this.defaultShader, 'uViewMatrix');
    this.defaultShaderUniforms.mMatrix = this.gl.getUniformLocation(this.defaultShader, 'uModelMatrix');
    this.defaultShaderUniforms.position = this.gl.getAttribLocation(this.defaultShader, 'vPosition');
    this.defaultShaderUniforms.normal = this.gl.getAttribLocation(this.defaultShader, 'vNormal');
    this.defaultShaderUniforms.textureCoord = this.gl.getAttribLocation(this.defaultShader, 'vTextureCoord');
    this.defaultShaderUniforms.texture = this.gl.getUniformLocation(this.defaultShader, 'uTexture');

    this.debugShader = CREATE_SHADER_PROGRAM(this.gl, DEBUG_VERTEX_SHADER, DEBUG_PIXEL_SHADER);
    this.debugShaderUniforms.cMatrix = this.gl.getUniformLocation(this.debugShader, 'uClipMatrix');
    this.debugShaderUniforms.pMatrix = this.gl.getUniformLocation(this.debugShader, 'uProjectionMatrix');
    this.debugShaderUniforms.vMatrix = this.gl.getUniformLocation(this.debugShader, 'uViewMatrix');
    this.debugShaderUniforms.mMatrix = this.gl.getUniformLocation(this.debugShader, 'uModelMatrix');
    this.debugShaderUniforms.color = this.gl.getUniformLocation(this.debugShader, 'uColor');
    this.debugShaderUniforms.position = this.gl.getAttribLocation(this.debugShader, 'vPosition');

    this.canvas.addEventListener('webglcontextlost', (event) => event.preventDefault(), false);
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    if (this.canvas.width != this.canvas.clientWidth || this.canvas.height != this.canvas.clientHeight) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
  }

  /**
   * Retourne la largeur du canvas.
   * @return {number} La largeur du canvas.
   */
  getWidth() {
    return this.canvas.clientWidth;
  }

  /**
   * Retourne la hauteur du canvas.
   * @return {number} La hauteur du canvas.
   */
  getHeight() {
    return this.canvas.clientHeight;
  }

  /**
   * Retourne le context webgl.
   * @return {WebGLRenderingContext} Le contexte webgl.
   */
  getContext() {
    return this.gl;
  }

  /**
   * Retourne une vue à l'index spécifié.
   * @return {Gfx3View} La vue.
   */
  getView(index) {
    return this.views[index];
  }

  /**
   * Retourne le nombre de vues.
   * @return {number} Le nombre de vues.
   */
  getNumViews() {
    return this.views.length;
  }

  /**
   * Ajoute une vue.
   */
  addView(view) {
    this.views.push(view);
  }

  /**
   * Remplace la vue à l'index spécifiée par une nouvelle.
   * @param {number} index - L'index de la vue spécifiée.
   * @param {Gfx3View} view - La nouvelle vue.
   */
  changeView(index, view) {
    this.views[index] = view;
  }

  /**
   * Supprime une vue.
   * @param {Gfx3View} view - La vue à supprimer.
   */
  removeView(view) {
    this.views.splice(this.views.indexOf(view), 1);
  }

  /**
   * Supprime toutes les vues.
   */
  releaseViews() {
    this.views = [];
  }

  /**
   * Récupère la valeur du drapeau d'affichage du debug.
   * @return {boolean} Le drapeau d'affichage du debug.
   */
  getShowDebug() {
    return this.showDebug;
  }

  /**
   * Définit la valeur du drapeau d'affichage du debug.
   * @param {boolean} showDebug - Le drapeau d'affichage du debug.
   */
  setShowDebug(showDebug) {
    this.showDebug = showDebug;
  }

  /**
   * Récupère la position écran d'un point de l'espace mondial (normalisé en {-1;1}).
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   * @return {array} La position écran.
   */
  getScreenPosition(viewIndex, x, y, z) {
    let view = this.views[viewIndex];
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getClipMatrix());
    matrix = Utils.MAT4_MULTIPLY(matrix, this.getProjectionMatrix(viewIndex));
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getCameraViewMatrix());
    let pos = Utils.MAT4_MULTIPLY_BY_VEC4(matrix, [x, y, z, 1]);
    return [pos[0] / pos[3], pos[1] / pos[3]];
  }

  /**
   * Récupère la matrice de projection.
   * @param {number} viewIndex - L'index de la vue.
   * @return {array} La matrice de projection.
   */
  getProjectionMatrix(viewIndex) {
    let projectionMatrix = Utils.MAT4_IDENTITY();
    let view = this.views[viewIndex];
    let viewport = view.getViewport();
    let projectionMode = view.getProjectionMode();

    if (projectionMode == ProjectionModeEnum.PERSPECTIVE) {
      let width = this.canvas.clientWidth * viewport.widthFactor;
      let height = this.canvas.clientHeight * viewport.heightFactor;
      let perspectiveFovy = view.getPerspectiveFovy();
      let perspectiveNear = view.getPerspectiveNear();
      let perspectiveFar = view.getPerspectiveFar();
      projectionMatrix = Utils.MAT4_PERSPECTIVE(perspectiveFovy, width / height, perspectiveNear, perspectiveFar);
    }
    else if (projectionMode == ProjectionModeEnum.ORTHOGRAPHIC) {
      let orthographicSize = view.getOrthographicSize();
      let orthographicDepth = view.getOrthographicDepth();
      projectionMatrix = Utils.MAT4_ORTHOGRAPHIC(orthographicSize, orthographicDepth);
    }
    else {
      throw new Error('Gfx3Manager::setView(): ProjectionMode not valid !');
    }

    return projectionMatrix;
  }

  /**
   * Efface et prépare la vue au dessin.
   * @param {number} viewIndex - L'index de la vue à effacer/dessiner.
   */
  clear(viewIndex) {
    let view = this.views[viewIndex];
    let viewport = view.getViewport();
    let x = this.canvas.clientWidth * viewport.xFactor;
    let y = this.canvas.clientHeight * viewport.yFactor;
    let width = this.canvas.clientWidth * viewport.widthFactor;
    let height = this.canvas.clientHeight * viewport.heightFactor;
    let clipMatrix = view.getClipMatrix();
    let projectionMatrix = this.getProjectionMatrix(viewIndex);
    let viewMatrix = view.getCameraViewMatrix();
    let backgroundColor = view.getBackgroundColor();

    this.gl.viewport(x, y, width, height);
    this.gl.scissor(x, y, width, height);

    this.gl.enable(this.gl.SCISSOR_TEST);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.useProgram(this.defaultShader);
    this.gl.uniformMatrix4fv(this.defaultShaderUniforms.cMatrix, false, clipMatrix);
    this.gl.uniformMatrix4fv(this.defaultShaderUniforms.pMatrix, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.defaultShaderUniforms.vMatrix, false, viewMatrix);

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.cMatrix, false, clipMatrix);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.pMatrix, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.vMatrix, false, viewMatrix);
  }

  /**
   * Dessine un mesh texturé.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} numVertices - Le nombre de points.
   * @param {array} vertices - Le tableau de points.
   * @param {array} normals - Le tableau de normales.
   * @param {array} textureCoords - Le tableau d'uvs.
   * @param {Texture} texture - La texture source.
   */
  drawMesh(matrix, numVertices, vertices, normals, textureCoords, texture) {
    this.gl.useProgram(this.defaultShader);
    this.gl.uniformMatrix4fv(this.defaultShaderUniforms.mMatrix, false, matrix);

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.defaultShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.defaultShaderUniforms.position);

    let normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.defaultShaderUniforms.normal, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.defaultShaderUniforms.normal);

    let textureCoordsBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordsBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.defaultShaderUniforms.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.defaultShaderUniforms.textureCoord);

    if (texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture.glt);
      this.gl.uniform1i(this.defaultShaderUniforms.texture, 0);
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, numVertices);
  }

  /**
   * Dessine un cercle de debug.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} radius - Le rayon.
   * @param {array} step - Le nombre de pas.
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugCircle(matrix, radius, step, color) {
    if (!this.showDebug) {
      return;
    }

    let angleStep = (Math.PI * 2) / step;
    let vertices = [];
    let numVertices = 0;

    for (let i = 0; i < step; i++) {
      let x = Math.cos(i * angleStep) * radius;
      let y = Math.sin(i * angleStep) * radius;
      let z = 0;
      vertices.push(x, y, z);
      numVertices++;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.debugShader, 'u_model'), false, matrix);

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.debugShader, 'a_position'), 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.debugShader, 'a_position'));

    if (color) {
      this.gl.uniform3fv(this.gl.getUniformLocation(this.debugShader, 'u_color'), color);
    }

    this.gl.drawArrays(this.gl.LINES, 0, numVertices);
  }

  /**
   * Dessine un rectangle englobant de debug.
   * @param {array} min - Point minimum (2 entrées).
   * @param {array} max - Point maximum (2 entrées).
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugBoundingRect(min, max, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    let a = [min[0], min[1], 0];
    let b = [min[0], max[1], 0];
    let c = [max[0], min[1], 0];
    let d = [max[0], max[1], 0];

    let vertices = [];
    vertices.push(...a, ...b, ...c);
    vertices.push(...a, ...d, ...c);

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, Utils.MAT4_IDENTITY());

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  /**
   * Dessine une sphere de debug.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} radius - Le rayon.
   * @param {array} step - Le nombre de pas.
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugSphere(matrix, radius, step, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, matrix);

    let angleStep = (Math.PI * 0.5) / step;
    let vertices = [];
    let numVertices = 0;

    for (let i = step * -1; i <= step; i++) {
      let r = Math.cos(i * angleStep) * radius;
      let y = Math.sin(i * angleStep) * radius;
      for (let j = 0; j <= step * 4; j++) {
        let z = Math.sin(j * angleStep) * r;
        let x = Math.cos(j * angleStep) * Math.cos(i * angleStep) * radius;
        vertices.push(x, y, z);
        numVertices++;
      }
    }

    for (let i = step * -1; i <= step; i++) {
      for (let j = 0; j <= step * 4; j++) {
        let x = Math.cos(j * angleStep) * radius * Math.cos(i * angleStep);
        let y = Math.sin(j * angleStep) * radius;
        let z = Math.cos(j * angleStep) * radius * Math.sin(i * angleStep);
        vertices.push(x, y, z);
        numVertices++;
      }
    }

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);

    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.LINE_STRIP, 0, numVertices);
  }

  /**
   * Dessine un gizmo de debug.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} size - La taille des axes.
   */
  drawDebugAxes(matrix, size) {
    if (!this.showDebug) {
      return;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, matrix);

    let axes = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    for (let i = 0; i < axes.length; i++) {
      let vertices = [];
      vertices.push(0, 0, 0);
      vertices.push(Utils.VEC3_SCALE(axes[i], size));
      let vertexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
      this.gl.uniform3fv(this.debugShaderUniforms.color, axes[i]);
      this.gl.drawArrays(this.gl.LINES, 0, 2);
    }
  }

  /**
   * Dessine une grille de debug.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} extend - Grandeur de la grille.
   * @param {number} spacing - L'espacement entre les cellules.
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugGrid(matrix, extend, spacing, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    let nbCells = extend * 2;
    let gridSize = nbCells * spacing;
    let left = -gridSize * 0.5;
    let top = -gridSize * 0.5;
    let vertices = [];
    let numVertices = 0;

    for (let i = 0; i <= nbCells; i++) {
      let vLineFromX = left + (i * spacing);
      let vLineFromY = top;
      let vLineFromZ = 0;
      let vLineDestX = left + (i * spacing);
      let vLineDestY = top + gridSize;
      let vLineDestZ = 0;
      let hLineFromX = left;
      let hLineFromY = top + (i * spacing);
      let hLineFromZ = 0;
      let hLineDestX = left + gridSize;
      let hLineDestY = top + (i * spacing);
      let hLineDestZ = 0;
      vertices.push(vLineFromX, vLineFromY, vLineFromZ, vLineDestX, vLineDestY, vLineDestZ);
      vertices.push(hLineFromX, hLineFromY, hLineFromZ, hLineDestX, hLineDestY, hLineDestZ);
      numVertices += 4;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, matrix);

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.LINES, 0, numVertices);
  }

  /**
   * Dessine une boite englobante de debug.
   * @param {array} min - Point minimum (3 entrées).
   * @param {array} max - Point maximum (3 entrées).
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugBoundingBox(min, max, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    let a = [min[0], min[1], min[2]];
    let b = [max[0], min[1], min[2]];
    let c = [max[0], max[1], min[2]];
    let d = [min[0], max[1], min[2]];
    let e = [min[0], max[1], max[2]];
    let f = [max[0], max[1], max[2]];
    let g = [max[0], min[1], max[2]];
    let h = [min[0], min[1], max[2]];

    let vertices = [];
    vertices.push(...a, ...b, ...h, ...g);
    vertices.push(...d, ...c, ...e, ...f);
    vertices.push(...a, ...d, ...h, ...e);
    vertices.push(...b, ...c, ...g, ...f);
    vertices.push(...d, ...e, ...c, ...f);
    vertices.push(...a, ...h, ...b, ...g);

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, Utils.MAT4_IDENTITY());

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.LINES, 0, 24);
  }

  /**
   * Dessine un ensemble de lignes de debug.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} numVertices - Le nombre de points.
   * @param {array} vertices - Le tableau de points.
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugLines(matrix, numVertices, vertices, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, matrix);

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.LINES, 0, numVertices);
  }

  /**
   * Dessine un ensemble de points.
   * @param {array} matrix - La matrix de modèle (16 entrées).
   * @param {number} numVertices - Le nombre de points.
   * @param {array} vertices - Le tableau de points.
   * @param {array} color - La couleur (3 entrées).
   */
  drawDebugPoints(matrix, numVertices, vertices, color = [1, 1, 1]) {
    if (!this.showDebug) {
      return;
    }

    this.gl.useProgram(this.debugShader);
    this.gl.uniformMatrix4fv(this.debugShaderUniforms.mMatrix, false, matrix);

    let vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(this.debugShaderUniforms.position, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(this.debugShaderUniforms.position);
    this.gl.uniform3fv(this.debugShaderUniforms.color, color);
    this.gl.drawArrays(this.gl.POINTS, 0, numVertices);
  }
}

function CREATE_SHADER_PROGRAM(gl, vsSource, fsSource) {
  let vertexShader = CREATE_SHADER(gl, gl.VERTEX_SHADER, vsSource);
  let fragmentShader = CREATE_SHADER(gl, gl.FRAGMENT_SHADER, fsSource);

  let shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('CREATE_SHADER_PROGRAM: fail to init program shader' + gl.getProgramInfoLog(shaderProgram));
  }

  return shaderProgram;
}

function CREATE_SHADER(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    throw new Error('CREATE_SHADER: An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
  }

  return shader;
}

module.exports.gfx3Manager = new Gfx3Manager();
},{"../helpers":22,"./gfx3_shaders":17,"./gfx3_view":20}],16:[function(require,module,exports){
let { Utils } = require('../helpers');
let { Gfx3Drawable } = require('./gfx3_drawable');
let { gfx3Manager } = require('./gfx3_manager');
let { eventManager } = require('../event/event_manager');

/**
 * Classe représentant un chemin de fer.
 * Attention: Cet objet n'est pas affecté par les transformations.
 * Permet à un objet rattaché de se déplacer sur le chemin définit par le tableau de points.
 * @extends Gfx3Drawable
 */
class Gfx3Mover extends Gfx3Drawable {
  /**
   * Créer un chemin de fer.
   */
  constructor() {
    super();
    this.points = [];
    this.speed = 1;
    this.drawable = null;
    this.currentPointIndex = 1;
    this.playing = false;
    this.looped = false;
  }

  async loadFromData(data) {
    this.points = data['Points'];
    this.speed = data['Speed'];
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    if (this.points.length < 2) {
      return;
    }
    if (!this.drawable) {
      return;
    }
    if (!this.playing) {
      return;
    }

    let position = this.drawable.getPosition();
    let delta = Utils.VEC3_SUBSTRACT(this.points[this.currentPointIndex], position);
    let direction = Utils.VEC3_NORMALIZE(delta);
    let nextPosition = Utils.VEC3_ADD(position, Utils.VEC3_SCALE(direction, this.speed * (ts / 1000)));

    this.drawable.setPosition(nextPosition[0], nextPosition[1], nextPosition[2]);
    this.drawable.setRotation(0, Utils.VEC2_ANGLE([direction[0], direction[2]]), 0);

    if (Utils.VEC3_LENGTH(delta) < 0.1) {
      if (this.currentPointIndex == this.points.length - 1) {
        this.currentPointIndex = this.looped ? 1 : this.points.length - 1;
        this.playing = this.looped;
        eventManager.emit(this, 'E_FINISHED');
      }
      else {
        this.currentPointIndex = this.currentPointIndex + 1;
      }
    }
  }

  /**
   * Fonction de dessin.
   * @param {number} viewIndex - Index de la vue en cours.
   */
  draw() {
    gfx3Manager.drawDebugLines(Utils.MAT4_IDENTITY(), this.vertexCount, this.vertices, [0.0, 1.0, 0.0]);
  }

  /**
   * Retourne les points du chemin de fer.
   * @return {array} Un tableau de points représentant le chemin à parcourir (tableau à deux dimensions).
   */
  getPoints() {
    return this.points;
  }

  /**
   * Définit les points du chemin de fer.
   * Dans le cas ou le dernier point est strictement identique au premier alors le mouvement est une boucle infinie.
   * @param {array} points - Un tableau de points représentant le chemin à parcourir (tableau à deux dimensions).
   */
  setPoints(points) {
    this.clearVertices();
    this.clearNormals();
    this.clearTextureCoords();

    for (let i = 0; i < points.length - 1; i++) {
      this.defineVertice(points[i][0], points[i][1], points[i][2]);
      this.defineVertice(points[i + 1][0], points[i + 1][1], points[i + 1][2]);
    }

    if (Utils.VEC3_ISEQUAL(points[points.length - 1], points[0])) {
      this.looped = true;
    }

    this.points = points;
  }

  /**
   * Retourne la vitesse de déplacement de l'objet en mouvement.
   * @return {number} La vitesse de déplacement.
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Définit la vitesse de déplacement de l'objet en mouvement.
   * @param {number} speed - La vitesse de déplacement.
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * Retourne l'objet en mouvement.
   * @return {GfxDrawable} L'objet en mouvement.
   */
  getDrawable() {
    return this.drawable;
  }

  /**
   * Définit l'objet en mouvement.
   * @param {GfxDrawable} drawable - L'objet en mouvement.
   */
  setDrawable(drawable) {
    this.drawable = drawable;
  }

  /**
   * Vérifie si l'objet est en mouvement.
   * @return {boolean} Si vrai, l'objet est en mouvement.
   */
  isPlaying() {
    return this.playing;
  }

  /**
   * Définit si l'objet est en mouvement.
   * @param {boolean} playing - Si vrai, l'objet est en mouvement sinon il est en pause.
   */
  setPlaying(playing) {
    this.playing = playing;
  }

  /**
   * Joue le mouvement.
   */
  play() {
    if (this.points.length < 2) {
      throw new Error('GfxMover::play: points is not defined.');
    }
    if (!this.drawable) {
      throw new Error('GfxMover::play: drawable is not defined.');
    }

    this.drawable.setPosition(this.points[0]);
    this.currentPointIndex = 1;
    this.playing = true;
  }
}

module.exports.Gfx3Mover = Gfx3Mover;
},{"../event/event_manager":6,"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15}],17:[function(require,module,exports){
module.exports.DEFAULT_VERTEX_SHADER = `
  attribute vec4 vPosition;
  attribute vec3 vNormal;
  attribute vec2 vTextureCoord;

  uniform mat4 uClipMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  varying vec2 textureCoord;

  void main() {
    gl_Position = uClipMatrix * uProjectionMatrix * uViewMatrix * uModelMatrix * vPosition;
    vNormal;
    textureCoord = vTextureCoord;
  }
`;

module.exports.DEFAULT_PIXEL_SHADER = `
  precision mediump float;
  varying vec2 textureCoord;
  uniform sampler2D uTexture;

  void main() {
    gl_FragColor = texture2D(uTexture, textureCoord);
  }
`;

module.exports.DEBUG_VERTEX_SHADER = `
  attribute vec4 vPosition;

  uniform mat4 uClipMatrix;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  void main() {
    gl_Position = uClipMatrix * uProjectionMatrix * uViewMatrix * uModelMatrix * vPosition;
    gl_PointSize = 5.0;
  }
`;

module.exports.DEBUG_PIXEL_SHADER = `
  precision mediump float;
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1);
  }
`;

},{}],18:[function(require,module,exports){
/**
 * Classe représentant une texture.
 */
class Gfx3Texture {
  constructor() {
    this.glt = null;
    this.width = 1;
    this.height = 1;
  }
}

module.exports.Gfx3Texture = Gfx3Texture;
},{}],19:[function(require,module,exports){
let { Gfx3Texture } = require('./gfx3_texture');
let { gfx3Manager } = require('./gfx3_manager');

/**
 * Singleton représentant un gestionnaire de ressources texture.
 */
class Gfx3TextureManager {
  /**
   * Créer un gestionnaire de ressources texture.
   */
  constructor() {
    this.gl = gfx3Manager.getContext();
    this.textures = {};
    this.defaultTexture = new Gfx3Texture();

    this.defaultTexture.glt = this.gl.createTexture();
    this.defaultTexture.width = 1;
    this.defaultTexture.height = 1;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.defaultTexture.glt);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.defaultTexture.width, this.defaultTexture.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  }

  /**
   * Charge une nouvelle ressource de façon asynchrone.
   * @param {string} path - Le chemin du fichier texture.
   * @return {Promise} Promesse resolue lors du chargement du fichier en mémoire.
   */
  async loadTexture(path) {
    return new Promise(resolve => {
      if (this.getTexture(path) != this.defaultTexture) {
        return resolve();
      }

      let image = new Image();
      image.src = path;

      image.addEventListener('load', () => {
        let texture = new Gfx3Texture();
        texture.glt = this.gl.createTexture();
        texture.width = image.width;
        texture.height = image.height;
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.glt);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        let ext = this.gl.getExtension('EXT_texture_filter_anisotropic');
        if (ext) {
          let max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
          this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
        }

        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.textures[path] = texture;
        resolve(texture);
      });
    });
  }

  /**
   * Supprime la ressource.
   * @param {string} path - Le chemin du fichier texture.
   */
  deleteTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx3TextureManager::deleteTexture(): The texture file doesn\'t exist, cannot delete !');
    }

    this.textures[path] = null;
    delete this.textures[path];
  }

  /**
   * Récupère la ressource.
   * Si celle-ci n'est pas pré-chargée c'est alors la texture par default qui est retournée.
   * @param {string} path - Le chemin du fichier de texture.
   * @return {Texture} La texture.
   */
  getTexture(path) {
    return this.textures[path] ? this.textures[path] : this.defaultTexture;
  }

  /**
   * Supprime toutes les ressources du gestionnaire.
   */
  releaseTextures() {
    for (let path in this.textures) {
      this.textures[path] = null;
      delete this.textures[path];
    }
  }
}

module.exports.gfx3TextureManager = new Gfx3TextureManager();
},{"./gfx3_manager":15,"./gfx3_texture":18}],20:[function(require,module,exports){
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
},{"../helpers":22,"./gfx3_viewport":21}],21:[function(require,module,exports){
/**
 * Classe représentant la position et la taille d'un rectangle de rendu.
 */
class Gfx3Viewport {
  constructor() {
    this.xFactor = 0;
    this.yFactor = 0;
    this.widthFactor = 1;
    this.heightFactor = 1;
  }
}

module.exports.Gfx3Viewport = Gfx3Viewport;
},{}],22:[function(require,module,exports){
class Utils {
  static BIND(fn, ctx) {
    return fn.bind(ctx);
  }
  static BIND_1(fn, ctx, a) {
    return fn.bind(ctx, a);
  }

  static BIND_2(fn, ctx, a, b) {
    return fn.bind(ctx, a, b);
  }

  static BIND_3(fn, ctx, a, b, c) {
    return fn.bind(ctx, a, b, c);
  }

  static SHUFFLE(arr) {
    let res = arr.slice();
    let tmp, cur, tp = res.length;
    if (tp) {
      while (--tp) {
        cur = Math.floor(Math.random() * (tp + 1));
        tmp = res[cur];
        res[cur] = res[tp];
        res[tp] = tmp;
      }
    }

    return res;
  }

  static RANDARRAY(min, max) {
    let arr = [];
    for (let i = min; i <= max; i++) {
      arr.push(i);
    }

    return Utils.SHUFFLE(arr);
  }

  static GET_RANDOM_INT(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static GET_RANDOM_FLOAT(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  static CLAMP(a, b, c) {
    return Math.max(b, Math.min(c, a));
  }

  static DEG_TO_RAD(deg) {
    return deg * (Math.PI / 180);
  }

  /**************************************************************************/

  static VEC2_CREATE(x = 0, y = 0) {
    return [x, y];
  }

  static VEC2_DISTANCE(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    return Math.sqrt((x * x) + (y * y));
  }

  static VEC2_LENGTH(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  }

  static VEC2_NORMALIZE(a) {
    let len = Utils.VEC2_LENGTH(a);
    if (len > 0) {
      let x = a[0] / len;
      let y = a[1] / len;
      return [x, y];
    }
    else {
      return [0, 0];
    }
  }

  static VEC2_DOT(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  static VEC2_ADD(a, b) {
    let x = a[0] + b[0];
    let y = a[1] + b[1];
    return [x, y];
  }

  static VEC2_SUBSTRACT(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    return [x, y];
  }

  static VEC2_MULTIPLY(a, b) {
    let x = a[0] * b[0];
    let y = a[1] * b[1];
    return [x, y];
  }

  static VEC2_SCALE(a, scale) {
    let x = a[0] * scale;
    let y = a[1] * scale;
    return [x, y];
  }

  static VEC2_ANGLE_BETWEEN(a, b) {
    return Math.acos(Utils.VEC2_DOT(a, b) / (Utils.VEC2_LENGTH(a) * Utils.VEC2_LENGTH(b)));
  }

  static VEC2_ANGLE(a) {
    let angle = Math.atan2(a[1], a[0]);
    return (angle > 0) ? angle : (angle + Math.PI * 2);
  }

  static VEC2_ISEQUAL(a, b) {
    return a[0] == b[0] && a[1] == b[1];
  }

  /**************************************************************************/

  static VEC3_ZERO = [0, 0, 0];
  static VEC3_BACKWARD = [0, 0, 1];
  static VEC3_FORWARD = [0, 0, -1];
  static VEC3_LEFT = [-1, 0, 0];
  static VEC3_RIGHT = [1, 0, 0];
  static VEC3_UP = [0, 1, 0];
  static VEC3_DOWN = [0, -1, 0];

  static VEC3_CREATE(x = 0, y = 0, z = 0) {
    return [x, y, z];
  }

  static VEC3_DISTANCE(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt((x * x) + (y * y) + (z * z));
  }

  static VEC3_LENGTH(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  }

  static VEC3_NORMALIZE(a) {
    let len = Utils.VEC3_LENGTH(a);
    if (len > 0) {
      let x = a[0] / len;
      let y = a[1] / len;
      let z = a[2] / len;
      return [x, y, z];
    }
    else {
      return [0, 0, 0];
    }
  }

  static VEC3_DOT(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  static VEC3_CROSS(a, b) {
    let x = a[1] * b[2] - a[2] * b[1];
    let y = a[2] * b[0] - a[0] * b[2];
    let z = a[0] * b[1] - a[1] * b[0];
    return [x, y, z];
  }

  static VEC3_ADD(a, b) {
    let x = a[0] + b[0];
    let y = a[1] + b[1];
    let z = a[2] + b[2];
    return [x, y, z];
  }

  static VEC3_SUBSTRACT(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    let z = a[2] - b[2];
    return [x, y, z];
  }

  static VEC3_MULTIPLY(a, b) {
    let x = a[0] * b[0];
    let y = a[1] * b[1];
    let z = a[2] * b[2];
    return [x, y, z];
  }

  static VEC3_SCALE(a, scale) {
    let x = a[0] * scale;
    let y = a[1] * scale;
    let z = a[2] * scale;
    return [x, y, z];
  }

  static VEC3_ISEQUAL(a, b) {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
  }

  /**************************************************************************/

  static MAT3_MULTIPLY_BY_VEC3(a, v) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let v00 = v[0];
    let v01 = v[1];
    let v02 = v[2];

    let c00 = v00 * a00 + v01 * a10 + v02 * a20;
    let c01 = v00 * a01 + v01 * a11 + v02 * a21;
    let c02 = v00 * a02 + v01 * a12 + v02 * a22;

    return [
      c00, c01, c02
    ];
  }

  static MAT3_MULTIPLY(a, b) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let b00 = b[0];
    let b01 = b[1];
    let b02 = b[2];
    let b10 = b[3];
    let b11 = b[4];
    let b12 = b[5];
    let b20 = b[6];
    let b21 = b[7];
    let b22 = b[8];

    let c00 = b00 * a00 + b01 * a10 + b02 * a20;
    let c01 = b00 * a01 + b01 * a11 + b02 * a21;
    let c02 = b00 * a02 + b01 * a12 + b02 * a22;

    let c10 = b10 * a00 + b11 * a10 + b12 * a20;
    let c11 = b10 * a01 + b11 * a11 + b12 * a21;
    let c12 = b10 * a02 + b11 * a12 + b12 * a22;

    let c20 = b20 * a00 + b21 * a10 + b22 * a20;
    let c21 = b20 * a01 + b21 * a11 + b22 * a21;
    let c22 = b20 * a02 + b21 * a12 + b22 * a22;

    return [
      c00, c01, c02,
      c10, c11, c12,
      c20, c21, c22
    ];
  }

  static MAT3_INVERT(a) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) {
      return null;
    }

    det = 1.0 / det;

    let out = [];
    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;

    return out;
  }

  static MAT3_IDENTITY() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  static MAT3_SCALE(x, y) {
    return [
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    ];
  }

  static MAT3_ROTATE(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, s, 0,
      -s, c, 0,
      0, 0, 1
    ];
  }

  static MAT3_TRANSLATE(x, y) {
    return [
      1, 0, 0,
      0, 1, 0,
      x, y, 1
    ]
  }

  static MAT3_PROJECTION(w, h) {
    return [
      2 / w, 0, 0,
      0, 2 / h, 0,
      -1, -1, 1
    ];
  }

  /**************************************************************************/

  static MAT4_MULTIPLY_BY_VEC4(a, v) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let v00 = v[0];
    let v01 = v[1];
    let v02 = v[2];
    let v03 = v[3];

    let c00 = v00 * a00 + v01 * a10 + v02 * a20 + v03 * a30;
    let c01 = v00 * a01 + v01 * a11 + v02 * a21 + v03 * a31;
    let c02 = v00 * a02 + v01 * a12 + v02 * a22 + v03 * a32;
    let c03 = v00 * a03 + v01 * a13 + v02 * a23 + v03 * a33;

    return [
      c00, c01, c02, c03
    ];
  }

  static MAT4_COMPUTE(...matrices) {
    for (let i = 0; i < matrices.length - 1; i++) {
      matrices[i + 1] = Utils.MAT4_MULTIPLY(matrices[i], matrices[i + 1]);
    }

    return matrices[matrices.length - 1];
  }

  static MAT4_MULTIPLY(a, b) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let b00 = b[0];
    let b01 = b[1];
    let b02 = b[2];
    let b03 = b[3];
    let b10 = b[4];
    let b11 = b[5];
    let b12 = b[6];
    let b13 = b[7];
    let b20 = b[8];
    let b21 = b[9];
    let b22 = b[10];
    let b23 = b[11];
    let b30 = b[12];
    let b31 = b[13];
    let b32 = b[14];
    let b33 = b[15];

    let c00 = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    let c01 = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    let c02 = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    let c03 = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

    let c10 = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    let c11 = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    let c12 = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    let c13 = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

    let c20 = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    let c21 = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    let c22 = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    let c23 = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

    let c30 = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    let c31 = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    let c32 = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    let c33 = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return [
      c00, c01, c02, c03,
      c10, c11, c12, c13,
      c20, c21, c22, c23,
      c30, c31, c32, c33
    ];
  }

  static MAT4_INVERT(a) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }

    det = 1.0 / det;

    let out = [];
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  }

  static MAT4_IDENTITY() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_SCALE(x, y, z) {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_X(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_Y(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_Z(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_TRANSLATE(x, y, z) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]
  }

  static MAT4_TRANSFORM(position, rotation, scale) {
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(position[0], position[1], position[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_X(rotation[0]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Y(rotation[1]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Z(rotation[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(scale[0], scale[1], scale[2]));
    return matrix;
  }

  static MAT4_ORTHOGRAPHIC(size, depth) {
    return [
      2 / size, 0, 0, 0,
      0, 2 / size, 0, 0,
      0, 0, -2 / depth, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_PERSPECTIVE(fov, ar, near, far) {
    return [
      (1 / (Math.tan(fov / 2) * ar)), 0, 0, 0,
      0, 1 / Math.tan(fov / 2), 0, 0,
      0, 0, (near + far) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
    ];
  }

  static MAT4_LOOKAT(position, target, vertical = [0, 1, 0]) {
    let axeZ = Utils.VEC3_NORMALIZE(Utils.VEC3_SUBSTRACT(target, position));
    let axeX = Utils.VEC3_CROSS(vertical, axeZ);
    let axeY = Utils.VEC3_CROSS(axeZ, axeX);

    return [
      axeX[0], axeX[1], axeX[2], 0,
      axeY[0], axeY[1], axeY[2], 0,
      axeZ[0], axeZ[1], axeZ[2], 0,
      position[0], position[1], position[2], 1];
  }
}

module.exports.Utils = Utils;
},{}],23:[function(require,module,exports){
let { Application } = require('./application');
let { ArrayCollection } = require('./array/array_collection');
let { BoundingBox } = require('./bounding/bounding_box');
let { BoundingRect } = require('./bounding/bounding_rect');
let { EventSubscriber } = require('./event/event_subscriber');
let { Gfx3CollisionBox } = require('./gfx3/gfx3_collisionbox');
let { Gfx3Drawable } = require('./gfx3/gfx3_drawable');
let { Gfx3JAM } = require('./gfx3/gfx3_jam');
let { Gfx3JAS } = require('./gfx3/gfx3_jas');
let { Gfx3JSM } = require('./gfx3/gfx3_jsm');
let { Gfx3JSS } = require('./gfx3/gfx3_jss');
let { Gfx3JWM } = require('./gfx3/gfx3_jwm');
let { Gfx3Mover } = require('./gfx3/gfx3_mover');
let { Gfx3Shader } = require('./gfx3/gfx3_shaders');
let { Gfx3Texture } = require('./gfx3/gfx3_texture');
let { Gfx3View } = require('./gfx3/gfx3_view');
let { Gfx3Viewport } = require('./gfx3/gfx3_viewport');
let { Screen } = require('./screen/screen');
let { ScriptMachine } = require('./script/script_machine');
let { UIBubble } = require('./ui/ui_bubble');
let { UIDescriptionList } = require('./ui/ui_description_list');
let { UIDialog } = require('./ui/ui_dialog');
let { UIInputRange } = require('./ui/ui_input_range');
let { UIInputSelect } = require('./ui/ui_input_select');
let { UIInputSelectMultiple } = require('./ui/ui_input_select');
let { UIInputSlider } = require('./ui/ui_input_slider');
let { UIInputText } = require('./ui/ui_input_text');
let { UIKeyboard } = require('./ui/ui_keyboard');
let { UIListView } = require('./ui/ui_list_view');
let { UIMenuItemText } = require('./ui/ui_menu_item_text');
let { UIMenu } = require('./ui/ui_menu');
let { UIMessage } = require('./ui/ui_message');
let { UIPrint } = require('./ui/ui_print');
let { UIPrompt } = require('./ui/ui_prompt');
let { UISprite } = require('./ui/ui_sprite');
let { UIText } = require('./ui/ui_text');
let { UIWidget } = require('./ui/ui_widget');
let { Utils } = require('./helpers');
let { SizeModeEnum } = require('./application');
let { ProjectionModeEnum } = require('./gfx3/gfx3_view');
let { MenuFocusEnum } = require('./ui/ui_menu');
let { MenuAxisEnum } = require('./ui/ui_menu');
let { inputManager } = require('./input/input_manager');
let { gfx3Manager } = require('./gfx3/gfx3_manager');
let { gfx3TextureManager } = require('./gfx3/gfx3_texture_manager');
let { eventManager } = require('./event/event_manager');
let { screenManager } = require('./screen/screen_manager');
let { soundManager } = require('./sound/sound_manager');
let { uiManager } = require('./ui/ui_manager');

module.exports.GWE = {
  Application,
  ArrayCollection,
  BoundingBox,
  BoundingRect,
  EventSubscriber,
  Gfx3CollisionBox,
  Gfx3Drawable,
  Gfx3JAM,
  Gfx3JAS,
  Gfx3JSM,
  Gfx3JSS,
  Gfx3JWM,
  Gfx3Mover,
  Gfx3Shader,
  Gfx3Texture,
  Gfx3View,
  Gfx3Viewport,
  Screen,
  ScriptMachine,
  UIBubble,
  UIDescriptionList,
  UIDialog,
  UIInputRange,
  UIInputSelect,
  UIInputSelectMultiple,
  UIInputSlider,
  UIInputText,
  UIKeyboard,
  UIListView,
  UIMenuItemText,
  UIMenu,
  UIMessage,
  UIPrint,
  UIPrompt,
  UISprite,
  UIText,
  UIWidget,
  Utils,
  SizeModeEnum,
  ProjectionModeEnum,
  MenuFocusEnum,
  MenuAxisEnum,
  inputManager,
  gfx3Manager,
  gfx3TextureManager,
  eventManager,
  screenManager,
  soundManager,
  uiManager
};
},{"./application":2,"./array/array_collection":3,"./bounding/bounding_box":4,"./bounding/bounding_rect":5,"./event/event_manager":6,"./event/event_subscriber":7,"./gfx3/gfx3_collisionbox":8,"./gfx3/gfx3_drawable":9,"./gfx3/gfx3_jam":10,"./gfx3/gfx3_jas":11,"./gfx3/gfx3_jsm":12,"./gfx3/gfx3_jss":13,"./gfx3/gfx3_jwm":14,"./gfx3/gfx3_manager":15,"./gfx3/gfx3_mover":16,"./gfx3/gfx3_shaders":17,"./gfx3/gfx3_texture":18,"./gfx3/gfx3_texture_manager":19,"./gfx3/gfx3_view":20,"./gfx3/gfx3_viewport":21,"./helpers":22,"./input/input_manager":24,"./screen/screen":25,"./screen/screen_manager":26,"./script/script_machine":27,"./sound/sound_manager":28,"./ui/ui_bubble":29,"./ui/ui_description_list":30,"./ui/ui_dialog":31,"./ui/ui_input_range":32,"./ui/ui_input_select":33,"./ui/ui_input_slider":34,"./ui/ui_input_text":35,"./ui/ui_keyboard":36,"./ui/ui_list_view":37,"./ui/ui_manager":38,"./ui/ui_menu":39,"./ui/ui_menu_item_text":40,"./ui/ui_message":41,"./ui/ui_print":42,"./ui/ui_prompt":43,"./ui/ui_sprite":44,"./ui/ui_text":45,"./ui/ui_widget":46}],24:[function(require,module,exports){
class InputManager {
  constructor() {
    this.keymap = {};
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  isKeyDown(key) {
    return this.keymap[key];
  }

  handleKeyDown(e) {
    this.keymap[e.key] = true;
  }

  handleKeyUp(e) {
    this.keymap[e.key] = false;
  }
}

module.exports.inputManager = new InputManager();
},{}],25:[function(require,module,exports){
/**
 * Classe représentant un écran.
 */
class Screen {
  /**
   * Créer un écran.
   */
  constructor(app) {
    this.app = app;
    this.blocking = true;
  }

  /**
   * Définit l'interrupteur de bloquage.
   * Nota bene: Si un écran est bloquant, celui-ci va stopper la répartition descendante.
   * @param {boolean} blocking - Interrupteur de bloquage.
   */
  setBlocking(blocking) {
    this.blocking = blocking;
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

  /**
   * Fonction appelée lors de l'ajout de l'écran dans le gestionnaire.
   * @param {object} args - Données transitoires.
   */
  async onEnter(args) {
    // virtual method called during enter phase !
  }

  /**
   * Fonction appelée lors de la suppression de l'écran dans le gestionnaire.
   * @param {object} args - Données transitoires.
   */
  async onExit() {
    // virtual method called during exit phase !
  }

  /**
   * Fonction appelée lorsque l'écran entre en dernière position dans le gestionnaire.
   */
  onBringToFront() {
    // virtual method called when get the top state level !
  }

  /**
   * Fonction appelée lorsque l'écran quitte la dernière position dans le gestionnaire.
   */
  onBringToBack() {
    // virtual method called when lost the top state level !
  }
}

module.exports.Screen = Screen;
},{}],26:[function(require,module,exports){
/**
 * Singleton représentant un gestionnaire d'écrans.
 */
class ScreenManager {
  /**
   * Créer un gestionnaire d'écrans.
   */
  constructor() {
    this.requests = [];
    this.screens = [];
  }

  /**
   * Répartition de la mise à jour à tous les écrans.
   * Nota bene: Si un écran est bloquant, celui-ci va stopper la répartition descendante.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    while (this.requests.length > 0) {
      let request = this.requests.pop();
      request();
    }

    for (let i = this.screens.length - 1; i >= 0; i--) {
      this.screens[i].update(ts);
      if (this.screens[i].blocking) {
        return;
      }
    }
  }

  /**
   * Répartition du rafraichissement graphique à tous les écrans.
   * Nota bene: Si un écran est bloquant, celui-ci va stopper la répartition descendante.
   * @param {number} viewIndex - Index de la vue en cours.
   */
  draw(viewIndex) {
    for (let i = this.screens.length - 1; i >= 0; i--) {
      this.screens[i].draw(viewIndex);
      if (this.screens[i].blocking) {
        return;
      }
    }
  }

  /**
   * Commande l'ajout d'un écran.
   * @param {Screen} newTopScreen - Ecran à ajouter.
   * @param {object} args - Données transitoires.
   */
  requestPushScreen(newTopScreen, args = {}) {
    this.requests.push(() => {
      if (this.screens.indexOf(newTopScreen) != -1) {
        throw new Error('ScreenManager::requestPushScreen(): You try to push an existing screen to the stack !');
      }

      let topScreen = this.screens[this.screens.length - 1];
      topScreen.onBringToBack(newTopScreen);

      let promise = newTopScreen.onEnter(args);
      promise.then(() => this.screens.push(newTopScreen));
    });
  }

  /**
   * Commande l'ajout d'un écran et supprime tous les écrans courants.
   * @param {Screen} newScreen - Ecran à ajouter.
   * @param {object} args - Données transitoires.
   */
  requestSetScreen(newScreen, args = {}) {
    this.requests.push(() => {
      this.screens.forEach(screen => screen.onExit());
      this.screens = [];
      let promise = newScreen.onEnter(args);
      promise.then(() => this.screens.push(newScreen));
    });
  }

  /**
   * Commande la suppression du dernier écran.
   */
  requestPopScreen() {
    this.requests.push(() => {
      if (this.screens.length == 0) {
        throw new Error('ScreenManager::requestPopScreen: You try to pop an empty state stack !');
      }

      let topScreen = this.screens[this.screens.length - 1];
      topScreen.onExit();
      this.screens.pop();

      if (this.screens.length > 0) {
        let newTopScreen = this.screens[this.screens.length - 1];
        newTopScreen.onBringToFront(topScreen);
      }
    });
  }
}

module.exports.screenManager = new ScreenManager();
},{}],27:[function(require,module,exports){
let fs = require('fs');

class JSC {
  constructor() {
    this.blocks = [];
  }
}

class JSCBlock {
  constructor() {
    this.id = '';
    this.description = '';
    this.calls = [];
  }
}

class JSCBlockCall {
  constructor() {
    this.commandName = '';
    this.commandArgs = [];
  }
}

/**
 * Classe représentant une machine de script.
 * Cette classe crée un contexte d'exécution et permet de lancer un script (fichier JSC).
 * Note: Chaque script à sa propre machine d'exécution.
 */
class ScriptMachine {
  /**
   * Créer une machine de script.
   */
  constructor() {
    this.jsc = new JSC();
    this.commandRegister = new Map();
    this.enabled = true;
    this.currentBlockId = '';
    this.currentCallIndex = 0;
    this.onBeforeBlockExec = (block) => { };
    this.onAfterBlockExec = (block) => { };
    this.onBeforeCommandExec = (command) => { };
    this.onAfterCommandExec = (command) => { };
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    if (!this.enabled) {
      return;
    }

    let currentBlock = this.jsc.blocks.find(block => block.id == this.currentBlockId);
    if (!currentBlock) {
      return;
    }

    if (this.currentCallIndex == currentBlock.calls.length) {
      this.onAfterBlockExec(currentBlock);
      this.currentBlockId = '';
      this.currentCallIndex = 0;
      return;
    }

    if (this.currentCallIndex == 0) {
      this.onBeforeBlockExec(currentBlock);
    }

    let currentCall = currentBlock.calls[this.currentCallIndex];
    let jumpto = this.runCommand(currentCall.commandName, currentCall.commandArgs);
    if (typeof jumpto === 'string') {
      this.currentBlockId = jumpto;
      this.currentCallIndex = 0;
      return;
    }

    if (this.currentCallIndex < currentBlock.calls.length) {
      this.currentCallIndex++;
    }
  }

  /**
   * Charge un fichier "jsc".
   * @param {string} path - Le chemin du fichier.
   */
  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    this.jsc = new JSC();

    for (let objBlock of json) {
      let block = new JSCBlock();
      block.id = objBlock['Id'];
      block.description = objBlock['Description'];
      block.calls = [];
      for (let objCall of objBlock['Calls']) {
        let call = new JSCBlockCall();
        call.commandName = objCall['Name'];
        call.commandArgs = objCall['Args'];
        block.calls.push(call);
      }

      this.jsc.blocks.push(block);
    }
  }

  /**
   * Enregistre une nouvelle commande.
   * Note: L'identifiant d'une commande doit être unique.
   * @param {string} key - L'identifiant de la commande.
   * @param {function} commandFunc - La fonction de la commande.
   */
  registerCommand(key, commandFunc = () => { }) {
    if (this.commandRegister.has(key)) {
      throw new Error('ScriptMachine::registerCommand: key already exist !')
    }

    this.commandRegister.set(key, commandFunc);
  }

  /**
   * Exécute une commande.
   * @param {string} key - L'identifiant de la commande.
   * @param {array} args - Un tableau d'arguments passés à la fonction de la commande.
   * @return {string} Le retour de la commande.
   */
  runCommand(key, args = []) {
    let command = this.commandRegister.get(key);
    if (!command) {
      throw new Error('ScriptMachine::runCommand: try to call an not existant command ' + key + ' !');
    }

    this.onBeforeCommandExec(command);
    let jumpto = command.call(this, ...args);
    this.onAfterCommandExec(command);
    return jumpto;
  }

  /**
   * Vide le registre des commandes.
   */
  clearCommandRegister() {
    this.commandRegister = new Map();
  }

  /**
   * Vérifie si la machine de script est activée.
   * @return {boolean} Le drapeau d'activation.
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Définit d'activation.
   * @param {boolean} enabled - Le drapeau d'activation.
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Saute sur le block d'instructions ciblé.
   * @param {string} blockId - L'identifiant du block d'instructions.
   */
  jump(blockId) {
    this.currentBlockId = blockId;
    this.currentCallIndex = 0;
  }
}

module.exports.ScriptMachine = ScriptMachine;
},{"fs":1}],28:[function(require,module,exports){
/**
 * Singleton représentant un gestionnaire de ressources son.
 */
class SoundManager {
  /**
   * Créer un gestionnaire de ressources son.
   */
  constructor() {
    this.sounds = {};
  }

  /**
   * Charge une nouvelle ressource de façon asynchrone.
   * @param {string} path - Le chemin du fichier son.
   * @return {Promise} Promesse resolue lors du chargement du fichier en mémoire.
   */
  async loadSound(path) {
    return new Promise(resolve => {
      let sound = new Audio();
      sound.src = path;
      sound.addEventListener('canplaythrough', () => {
        this.sounds[path] = sound;
        resolve(sound);
      });
    });
  }

  /**
   * Supprime la ressource.
   * @param {string} path - Le chemin du fichier son.
   */
  deleteSound(path) {
    if (!this.sounds[path]) {
      throw new Error('SoundManager::deleteSound(): The sound file doesn\'t exist, cannot delete !');
    }

    this.sounds[path].src = '';
    this.sounds[path] = null;
    delete this.sounds[path];
  }

  /**
   * Joue la ressource.
   * @param {string} path - Le chemin du fichier son.
   */
  playSound(path) {
    if (!this.sounds[path]) {
      throw new Error('SoundManager::play(): The sound file doesn\'t exist, cannot play !');
    }

    this.sounds[path].play();
  }

  /**
   * Met en pause la ressource.
   * @param {string} path - Le chemin du fichier son.
   */
  pauseSound(path) {
    this.sounds[path].pause();
  }

  /**
   * Supprime toutes les ressources du gestionnaire.
   */
  releaseSounds() {
    for (let path in this.sounds) {
      this.sounds[path].src = '';
      this.sounds[path] = null;
      delete this.sounds[path];
    }
  }
}

module.exports.soundManager = new SoundManager();
},{}],29:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');
let { UIMenu } = require('./ui_menu');
let { UIMenuItemText } = require('./ui_menu_item_text');

class UIBubble extends UIWidget {
  constructor() {
    super({
      className: 'UIBubble',
      template: `
      <div class="UIBubble-text js-text"></div>
      <div class="UIBubble-menu js-menu"></div>`
    });

    this.text = '';
    this.actions = [];
    this.stepDuration = 0;
    this.currentTextOffset = 0;
    this.currentActionTextOffset = 0;
    this.currentActionIndex = 0;
    this.timeElapsed = 0;
    this.isFinished = false;

    this.menuWidget = new UIMenu();
    this.node.querySelector('.js-menu').replaceWith(this.menuWidget.node);
    eventManager.subscribe(this.menuWidget, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  update(ts) {
    this.menuWidget.update(ts);

    if (!this.isFinished && this.currentTextOffset == this.text.length && this.currentActionIndex == this.actions.length) {
      this.isFinished = true;
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('.js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
        this.currentTextOffset++;
      }
      else if (this.currentActionIndex < this.actions.length) {
        if (this.currentActionTextOffset == 0) {
          this.menuWidget.addWidget(new UIMenuItemText({ text: '' }));
        }
        else if (this.currentActionTextOffset < this.actions[this.currentActionIndex].length) {
          this.menuWidget.itemWidgets[this.currentActionIndex].setText(this.actions[this.currentActionIndex].substring(0, this.currentActionTextOffset + 1));
          this.currentActionTextOffset++;
        }
        else {
          this.currentActionIndex++;
          this.currentActionTextOffset = 0;
        }
      }

      this.timeElapsed = 0;
    }
    else {
      this.timeElapsed += ts;
    }
  }

  delete() {
    this.menuWidget.delete();
    super.delete();
  }

  focus() {
    this.menuWidget.focus();
    super.focus();
  }

  unfocus() {
    this.menuWidget.unfocus();
    super.unfocus();
  }

  setWidth(width) {
    this.node.style.width = width + 'px';
  }

  setText(text) {
    this.text = text;
    this.currentTextOffset = 0;
    this.isFinished = false;
  }

  setActions(actions) {
    this.actions = actions;
    this.currentActionIndex = 0;
    this.currentActionTextOffset = 0;
    this.isFinished = false;
    this.menuWidget.clear();
  }

  setStepDuration(stepDuration) {
    this.stepDuration = stepDuration;
  }

  handleMenuItemSelected(data) {
    eventManager.emit(this, 'E_MENU_ITEM_SELECTED', data);
  }

  onKeyDown(e) {
    if (e.key == 'Enter' && this.isFinished) {
      eventManager.emit(this, 'E_CLOSE');
    }
  }
}

module.exports.UIBubble = UIBubble;
},{"../event/event_manager":6,"./ui_menu":39,"./ui_menu_item_text":40,"./ui_widget":46}],30:[function(require,module,exports){
let { UIWidget } = require('./ui_widget');

class UIDescriptionList extends UIWidget {
  constructor() {
    super({
      className: 'UIDescriptionList'
    });
  }

  addItem(id, label, value) {
    let tpl = document.createElement('template');
    tpl.innerHTML = `
      <span class="UIDescriptionList-item js-${id}">
        <span class="UIDescriptionList-item-label js-label">${label}</span>
        <span class="UIDescriptionList-item-value js-value">${value}</span>
      </span>`;

    this.node.appendChild(tpl.content);
  }

  removeItem(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::removeItem(): item not found !');
    }

    this.node.removeChild(item);
  }

  setItem(id, value) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::setItem(): item not found !');
    }

    item.querySelector('.js-value').textContent = value;
  }

  setItemVisible(id, visible) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::setItemVisible(): item not found !');
    }

    item.style.display = (visible) ? 'block' : 'none';
  }

  getItemVisible(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::getItemVisible(): item not found !');
    }

    return item.style.display == 'block';
  }

  getItemValue(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::getItemValue(): item not found !');
    }

    return item.querySelector('.js-value').textContent;
  }

  clear() {
    this.node.innerHTML = '';
  }
}

module.exports.UIDescriptionList = UIDescriptionList;
},{"./ui_widget":46}],31:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIDialog extends UIWidget {
  constructor() {
    super({
      className: 'UIDialog',
      template: `
      <div class="UIDialog-author js-author"></div>
      <div class="UIDialog-textbox">
        <div class="UIDialog-textbox-text js-text"></div>
        <div class="UIDialog-textbox-next js-next"></div>
      </div>`
    });

    this.text = '';
    this.stepDuration = 0;
    this.currentTextOffset = 0;
    this.timeElapsed = 0;
    this.isFinished = false;
  }

  update(ts) {
    if (this.isFinished) {
      return;
    }

    if (!this.isFinished && this.currentTextOffset == this.text.length) {
      this.isFinished = true;
      this.node.querySelector('.js-next').style.display = 'block';
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('.js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
        this.currentTextOffset++;
      }

      this.timeElapsed = 0;
    }
    else {
      this.timeElapsed += ts;
    }
  }

  setAuthor(author) {
    this.node.querySelector('.UIDialog-author').textContent = author;
  }

  setText(text) {
    this.text = text;
    this.currentTextOffset = 0;
    this.isFinished = false;
    this.node.querySelector('.js-next').style.display = 'none';
  }

  setStepDuration(stepDuration) {
    this.stepDuration = stepDuration;
  }

  onKeyDown(e) {
    if (e.key == 'Enter' && this.isFinished) {
      eventManager.emit(this, 'E_CLOSE');
    }
  }
}

module.exports.UIDialog = UIDialog;
},{"../event/event_manager":6,"./ui_widget":46}],32:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIInputRange extends UIWidget {
  constructor() {
    super({
      className: 'UIInputRange',
      template: `
      <div class="UIInputRange-prevIcon"><</div>
      <div class="UIInputRange-value js-value">0</div>
      <div class="UIInputRange-nextIcon">></div>`
    });

    this.value = 0;
    this.min = 0;
    this.max = 0;
    this.step = 1;
  }

  setValue(value) {
    if (value == this.value) {
      return;
    }

    this.node.querySelector('.js-value').textContent = value;
    this.value = value;
  }

  setMin(min) {
    this.min = min;
  }

  setMax(max) {
    this.max = max;
  }

  setStep(step) {
    this.step = step;
  }

  onKeyDown(e) {
    if (e.key == 'ArrowLeft' && this.value - this.step >= this.min) {
      this.value -= this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }
    else if (e.key == 'ArrowRight' && this.value + this.step <= this.max) {
      this.value += this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }

    this.node.querySelector('.js-value').textContent = this.value;
  }
}

module.exports.UIInputRange = UIInputRange;
},{"../event/event_manager":6,"./ui_widget":46}],33:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIMenuItemText } = require('./ui_menu_item_text');
let { UIMenu } = require('./ui_menu');

class UIInputSelect extends UIMenu {
  constructor() {
    super({
      className: 'UIInputSelect',
      columns: Infinity
    });

    this.index = -1;
    eventManager.subscribe(this, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  setValue(index) {
    if (index == this.index) {
      return;
    }

    this.unselectWidgets();
    this.selectWidget(index, false);
    this.index = index;
  }

  addItem(text) {
    this.addWidget(new UIMenuItemText({ text: text }));
  }

  handleMenuItemSelected() {
    this.index = this.getSelectedWidgetIndex();
    eventManager.emit(this, 'E_VALUE_CHANGED', { index: this.index });
  }
}

class UIInputSelectMultiple extends UIMenu {
  constructor() {
    super({
      className: 'UIInputSelectMultiple',
      columns: Infinity,
      multiple: true
    });

    this.indexes = [];
    eventManager.subscribe(this, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  setValues(indexes) {
    if (indexes == this.indexes) {
      return;
    }

    this.unselectWidgets();
    indexes.forEach(index => this.selectWidget(index, false));
    this.indexes = indexes;
  }

  addItem(text) {
    super.addWidget(new UIMenuItemText({ text: text }));
  }

  handleMenuItemSelected() {
    this.indexes = this.getSelectedWidgetIndexes();
    eventManager.emit(this, 'E_VALUES_CHANGED', { indexes: this.indexes });
  }
}

module.exports.UIInputSelect = UIInputSelect;
module.exports.UIInputSelectMultiple = UIInputSelectMultiple;
},{"../event/event_manager":6,"./ui_menu":39,"./ui_menu_item_text":40}],34:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIInputSlider extends UIWidget {
  constructor() {
    super({
      className: 'UIInputSlider',
      template: `
      <input class="UIInputSlider-range js-range" type="range" min="0" max="0" step="1" value="0">
      <div class="UIInputSlider-value js-value">0</div>`
    });

    this.value = 0;
    this.min = 0;
    this.max = 0;
    this.step = 1;
  }

  setValue(value) {
    if (value == this.value) {
      return;
    }

    this.node.querySelector('.js-range').value = value;
    this.node.querySelector('.js-value').textContent = value;
    this.value = value;    
  }

  setMin(min) {
    this.node.querySelector('.js-range').min = min;
    this.min = min;
  }

  setMax(max) {
    this.node.querySelector('.js-range').max = max;
    this.max = max;
  }

  setStep(step) {
    this.node.querySelector('.js-range').step = step;
    this.step = step;
  }

  onKeyDown(e) {
    if (e.key == 'ArrowLeft' && this.value - this.step >= this.min) {
      this.value -= this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }
    else if (e.key == 'ArrowRight' && this.value + this.step <= this.max) {
      this.value += this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }

    this.node.querySelector('.js-range').value = this.value;
    this.node.querySelector('.js-value').textContent = this.value;
  }
}

module.exports.UIInputSlider = UIInputSlider;
},{"../event/event_manager":6,"./ui_widget":46}],35:[function(require,module,exports){
module.exports.UIInputText = {};
},{}],36:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

let GRID_WIDTH = 10;
let GRID_HEIGHT = 8;

class UIKeyboard extends UIWidget {
  constructor() {
    super({
      className: 'UIKeyboard',
      template: `
      <div class="UIKeyboard-value js-value"></div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="A">A</button>
        <button class="UIKeyboard-row-item js-item" data-char="B">B</button>
        <button class="UIKeyboard-row-item js-item" data-char="C">C</button>
        <button class="UIKeyboard-row-item js-item" data-char="D">D</button>
        <button class="UIKeyboard-row-item js-item" data-char="E">E</button>
        <button class="UIKeyboard-row-item js-item" data-char="F">F</button>
        <button class="UIKeyboard-row-item js-item" data-char="G">G</button>
        <button class="UIKeyboard-row-item js-item" data-char="H">H</button>
        <button class="UIKeyboard-row-item js-item" data-char="I">I</button>
        <button class="UIKeyboard-row-item js-item" data-char="J">J</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="K">K</button>
        <button class="UIKeyboard-row-item js-item" data-char="L">L</button>
        <button class="UIKeyboard-row-item js-item" data-char="M">M</button>
        <button class="UIKeyboard-row-item js-item" data-char="N">N</button>
        <button class="UIKeyboard-row-item js-item" data-char="O">O</button>
        <button class="UIKeyboard-row-item js-item" data-char="P">P</button>
        <button class="UIKeyboard-row-item js-item" data-char="Q">Q</button>
        <button class="UIKeyboard-row-item js-item" data-char="R">R</button>
        <button class="UIKeyboard-row-item js-item" data-char="S">S</button>
        <button class="UIKeyboard-row-item js-item" data-char="T">T</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="U">U</button>
        <button class="UIKeyboard-row-item js-item" data-char="V">V</button>
        <button class="UIKeyboard-row-item js-item" data-char="W">W</button>
        <button class="UIKeyboard-row-item js-item" data-char="X">X</button>
        <button class="UIKeyboard-row-item js-item" data-char="Y">Y</button>
        <button class="UIKeyboard-row-item js-item" data-char="Z">Z</button>
        <button class="UIKeyboard-row-item js-item" data-char="!">!</button>
        <button class="UIKeyboard-row-item js-item" data-char="?">?</button>
        <button class="UIKeyboard-row-item js-item" data-char="$">$</button>
        <button class="UIKeyboard-row-item js-item" data-char="#">#</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="a">a</button>
        <button class="UIKeyboard-row-item js-item" data-char="b">b</button>
        <button class="UIKeyboard-row-item js-item" data-char="c">c</button>
        <button class="UIKeyboard-row-item js-item" data-char="d">d</button>
        <button class="UIKeyboard-row-item js-item" data-char="e">e</button>
        <button class="UIKeyboard-row-item js-item" data-char="f">f</button>
        <button class="UIKeyboard-row-item js-item" data-char="g">g</button>
        <button class="UIKeyboard-row-item js-item" data-char="h">h</button>
        <button class="UIKeyboard-row-item js-item" data-char="i">i</button>
        <button class="UIKeyboard-row-item js-item" data-char="j">j</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="k">k</button>
        <button class="UIKeyboard-row-item js-item" data-char="l">l</button>
        <button class="UIKeyboard-row-item js-item" data-char="m">m</button>
        <button class="UIKeyboard-row-item js-item" data-char="n">n</button>
        <button class="UIKeyboard-row-item js-item" data-char="o">o</button>
        <button class="UIKeyboard-row-item js-item" data-char="p">p</button>
        <button class="UIKeyboard-row-item js-item" data-char="q">q</button>
        <button class="UIKeyboard-row-item js-item" data-char="r">r</button>
        <button class="UIKeyboard-row-item js-item" data-char="s">s</button>
        <button class="UIKeyboard-row-item js-item" data-char="t">t</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="u">u</button>
        <button class="UIKeyboard-row-item js-item" data-char="v">v</button>
        <button class="UIKeyboard-row-item js-item" data-char="w">w</button>
        <button class="UIKeyboard-row-item js-item" data-char="x">x</button>
        <button class="UIKeyboard-row-item js-item" data-char="y">y</button>
        <button class="UIKeyboard-row-item js-item" data-char="z">z</button>
        <button class="UIKeyboard-row-item js-item" data-char="=">=</button>
        <button class="UIKeyboard-row-item js-item" data-char="-">-</button>
        <button class="UIKeyboard-row-item js-item" data-char="+">+</button>
        <button class="UIKeyboard-row-item js-item" data-char="%">%</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="0">0</button>
        <button class="UIKeyboard-row-item js-item" data-char="1">1</button>
        <button class="UIKeyboard-row-item js-item" data-char="2">2</button>
        <button class="UIKeyboard-row-item js-item" data-char="3">3</button>
        <button class="UIKeyboard-row-item js-item" data-char="4">4</button>
        <button class="UIKeyboard-row-item js-item" data-char="5">5</button>
        <button class="UIKeyboard-row-item js-item" data-char="6">6</button>
        <button class="UIKeyboard-row-item js-item" data-char="7">7</button>
        <button class="UIKeyboard-row-item js-item" data-char="8">8</button>
        <button class="UIKeyboard-row-item js-item" data-char="9">9</button>
      </div>
      <div class="UIKeyboard-row">
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="">&nbsp;</button>
        <button class="UIKeyboard-row-item js-item" data-char="RETURN">&#9166;</button>
        <button class="UIKeyboard-row-item js-item" data-char="ENTER">x</button>
      </div>`
    });

    this.value = '';
    this.row = 0;
    this.column = 0;
  }

  focus() {
    let items = this.node.querySelectorAll('.js-item');
    let item = items[this.row * GRID_WIDTH + this.column];  
    item.classList.add('focused');
    super.focus();
  }

  unfocus() {
    let items = this.node.querySelectorAll('.js-item');
    let item = items[this.row * GRID_WIDTH + this.column];
    item.classList.remove('focused');
    super.unfocus();
  }

  setValue(value) {
    if (value == this.value) {
      return;
    }

    this.node.querySelector('.js-value').textContent = value;
    this.value = value;
  }

  nextFocus(direction) {
    let items = this.node.querySelectorAll('.js-item');
    items.forEach(item => item.classList.remove('focused'));

    if (direction == 'UP') {
      this.row = (this.row - 1) < 0 ? GRID_HEIGHT - 1 : this.row - 1;
    }
    else if (direction == 'RIGHT') {
      this.column = (this.column + 1) > GRID_WIDTH - 1 ? 0 : this.column + 1;
    }
    else if (direction == 'DOWN') {
      this.row = (this.row + 1) > GRID_HEIGHT - 1 ? 0 : this.row + 1;
    }
    else if (direction == 'LEFT') {
      this.column = (this.column - 1) < 0 ? GRID_WIDTH - 1 : this.column - 1;
    }

    items[this.row * GRID_WIDTH + this.column].classList.add('focused');
  }

  onKeyDown(e) {
    if (e.key == 'ArrowUp') {
      this.nextFocus('UP');
    }
    else if (e.key == 'ArrowRight') {
      this.nextFocus('RIGHT');
    }
    else if (e.key == 'ArrowDown') {
      this.nextFocus('DOWN');
    }
    else if (e.key == 'ArrowLeft') {
      this.nextFocus('LEFT');
    }
    else if (e.key == 'Enter') {
      let items = this.node.querySelectorAll('.js-item');
      let item = items[this.row * GRID_WIDTH + this.column];

      if (item.dataset.char == 'ENTER') {
        eventManager.emit(this, 'E_VALIDATE', { value: this.value });
      }
      else if (item.dataset.char == 'RETURN') {
        this.value = this.value.substr(0, this.value.length - 1);
        this.node.querySelector('.js-value').textContent = this.value;
      }
      else {
        this.value += item.dataset.char;
        this.node.querySelector('.js-value').textContent = this.value;  
      }
    }
  }
}

module.exports.UIKeyboard = UIKeyboard;
},{"../event/event_manager":6,"./ui_widget":46}],37:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { ArrayCollection } = require('../array/array_collection');
let { UIMenu } = require('./ui_menu');

class UIListView extends UIMenu {
  constructor(options = {}) {
    super(options);
    this.collection = new ArrayCollection();
    this.views = [];
    this.sortPredicate = () => true;
    this.filterPredicate = () => true;
    this.enablePredicate = () => true;
  }

  delete() {
    eventManager.unsubscribe(this.collection, 'E_ITEM_ADDED', this);
    eventManager.unsubscribe(this.collection, 'E_ITEM_REMOVED', this);
    super.delete();
  }

  setCollection(collection) {
    eventManager.unsubscribe(this.collection, 'E_ITEM_ADDED', this);
    eventManager.unsubscribe(this.collection, 'E_ITEM_REMOVED', this);
    this.clear();

    if (collection) {
      let items = collection.getItems();
      let views = items.sort(this.sortPredicate).filter(this.filterPredicate);
      views.forEach(item => this.addItem(item, this.enablePredicate(item)));
      eventManager.subscribe(collection, 'E_ITEM_ADDED', this, this.handleItemAdded);
      eventManager.subscribe(collection, 'E_ITEM_REMOVED', this, this.handleItemRemoved);
      this.collection = collection;
      this.views = views;
    }
    else {
      this.collection = new ArrayCollection();
      this.views = [];
    }
  }

  addItem(item, enabled = true, index = -1) {
    // virtual method called during item add !
  }

  getFocusedItem() {
    return this.views[this.getFocusedWidgetIndex()];
  }

  getSelectedItem() {
    return this.views[this.getSelectedWidgetIndex()];
  }

  setSortPredicate(sortPredicate) {
    if (this.collection) {
      let items = this.collection.getItems();
      this.views = items.sort(sortPredicate).filter(this.filterPredicate);

      this.clear();
      this.views.forEach(item => this.addItem(item, this.enablePredicate(item)));
    }

    this.sortPredicate = sortPredicate;
  }

  setFilterPredicate(filterPredicate) {
    if (this.collection) {
      let items = this.collection.getItems();
      this.views = items.sort(this.sortPredicate).filter(filterPredicate);

      this.clear();
      this.views.forEach(item => this.addItem(item, this.enablePredicate(item)));
    }

    this.filterPredicate = filterPredicate;
  }

  setEnablePredicate(enablePredicate) {
    if (this.collection) {
      let items = this.collection.getItems();
      this.views = items.sort(this.sortPredicate).filter(this.filterPredicate);

      this.clear();
      this.views.forEach(item => this.addItem(item, enablePredicate(item)));
    }

    this.enablePredicate = enablePredicate;
  }

  handleItemAdded(data) {
    let items = this.collection.getItems();
    this.views = items.sort(this.sortPredicate).filter(this.filterPredicate);

    let index = this.views.indexOf(data.item);
    this.addItem(data.item, this.enablePredicate(data.item), index);
  }

  handleItemRemoved(data) {
    let index = this.views.indexOf(data.item);
    this.removeWidget(index);

    let items = this.collection.getItems();
    this.views = items.sort(this.sortPredicate).filter(this.filterPredicate);    
  }
}

module.exports.UIListView = UIListView;
},{"../array/array_collection":3,"../event/event_manager":6,"./ui_menu":39}],38:[function(require,module,exports){
let { eventManager} = require('../event/event_manager');
const { UIWidget } = require('./ui_widget');

/**
 * Singleton représentant un gestionnaire d'interface utilisateur.
 */
class UIManager {
  /**
   * Créer un gestionnaire d'interface utilisateur.
   */
  constructor() {
    this.root = null;
    this.fadeLayer = null;
    this.overLayer = null;
    this.focusedWidget = null;
    this.widgets = [];

    this.root = document.getElementById('UI_ROOT');
    if (!this.root) {
      throw new Error('UIManager::UIManager: UI_ROOT element not found !');
    }

    this.fadeLayer = document.getElementById('UI_FADELAYER');
    if (!this.fadeLayer) {
      throw new Error('UIManager::UIManager: UI_FADELAYER element not found !');
    }

    this.overLayer = document.getElementById('UI_OVERLAYER');
    if (!this.overLayer) {
      throw new Error('UIManager::UIManager: UI_OVERLAYER element not found !');
    }
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    for (let widget of this.widgets) {
      widget.update(ts);
    }
  }

  /**
   * Récupère les widgets.
   * @return {array} Le tableau des widgets.
   */
  getWidgets() {
    return this.widgets;
  }

  /**
   * Donne le focus à {widget}.
   * @param {UIWidget} widget - L'élément d'interface utilisateur.
   */
  focus(widget) {
    if (this.focusedWidget) {
      this.focusedWidget.unfocus();
    }

    widget.focus();
    this.focusedWidget = widget;
    eventManager.emit(this, 'E_FOCUSED', { widget: widget });
  }

  /**
   * Enlève le focus.
   */
  unfocus() {
    if (!this.focusedWidget) {
      return;
    }

    this.focusedWidget.unfocus();
    this.focusedWidget = null;
    eventManager.emit(this, 'E_UNFOCUSED');
  }

  /**
   * Ajoute un élément HTML au noeud racine.
   * Nota bene: Idéal pour des éléments d'affichage simple et sans logique interne.
   * @param {Node} node - Element HTML.
   * @param {string} styles - Styles CSS.
   */
  addNode(node, styles = '') {
    node.style.cssText += styles;
    this.root.appendChild(node);
  }

  /**
   * Supprime un élément HTML au noeud racine.
   * Nota bene: Idéal pour des éléments d'affichage simple et sans logique interne.
   * @param {Node} node - Element HTML.
   */
  removeNode(node) {
    this.root.removeChild(node);
  }

  /**
   * Ajoute un widget au noeud racine.
   * @param {UIWidget} widget - Element d'interface utilisateur.
   * @param {string} styles - Styles CSS.
   * @return {UIWidget} L'élément d'interface utilisateur.
   */
  addWidget(widget, styles = '') {
    widget.appendStyles(styles);
    this.root.appendChild(widget.getNode());
    this.widgets.push(widget);
    return widget;
  }

  /**
   * Supprime un widget au noeud racine.
   * @param {UIWidget} widget - Element d'interface utilisateur.
   */
  removeWidget(widget) {
    let index = this.widgets.indexOf(widget);
    if (index == -1) {
      throw new Error('UIManager::removeWidget: fail to remove widget !');
    }

    if (this.widgets[index] == this.focusedWidget) {
      this.unfocus();
    }

    this.widgets[index].delete();
    this.widgets.splice(index, 1);
    return true;
  }

  /**
   * Supprime tous les widgets.
   */
  clear() {
    this.root.innerHTML = '';
    this.focusedWidget = null;

    while (this.widgets.length > 0) {
      let widget = this.widgets.pop();
      widget.delete();
    }
  }

  /**
   * Lance une animation de fondu (invisible -> fond noir).
   * @param {number} delay - La durée à attendre avant de débuter l'animation.
   * @param {number} ms - La durée de l'animation.
   * @param {string} transitionTimingFunction - Fonction d'interpolation.
   * @param {function} cb - Fonction appelée à la fin de l'animation.
   */
  fadeIn(delay, ms, transitionTimingFunction = 'linear', cb = () => {}) {
    this.fadeLayer.style.transitionDuration = ms + 'ms';
    this.fadeLayer.style.transitionDelay = delay + 'ms';
    this.fadeLayer.style.transitionTimingFunction = transitionTimingFunction;
    this.fadeLayer.style.opacity = 1;
    setTimeout(() => { cb(); }, delay + ms);
  }

  /**
   * Lance une animation de fondu (fond noir -> invisible).
   * @param {number} delay - La durée à attendre avant de débuter l'animation.
   * @param {number} ms - La durée de l'animation.
   * @param {string} transitionTimingFunction - Fonction d'interpolation.
   * @param {function} cb - Fonction appelée à la fin de l'animation.
   */
  fadeOut(delay, ms, transitionTimingFunction = 'linear', cb = () => {}) {
    this.fadeLayer.style.transitionDuration = ms + 'ms';
    this.fadeLayer.style.transitionDelay = delay + 'ms';
    this.fadeLayer.style.transitionTimingFunction = transitionTimingFunction;
    this.fadeLayer.style.opacity = 0;
    setTimeout(() => { cb(); }, delay + ms);
  }

  /**
   * Active la sur-couche opaque.
   * @param {boolean} enable - Si vrai, la sur-couche est activée.
   */
   enableOverlayer(enable) {
    this.overLayer.style.opacity = (enable) ? '1' : '0';
  }
}

module.exports.uiManager = new UIManager();
},{"../event/event_manager":6,"./ui_widget":46}],39:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

let MenuFocusEnum = {
  AUTO: 0,
  NONE: 1
};

let MenuAxisEnum = {
  X: 0,
  Y: 1,
  XY: 2
};

class UIMenu extends UIWidget {
  constructor(options = {}) {
    super({
      className: options.className ?? 'UIMenu'
    });

    this.axis = options.axis ?? MenuAxisEnum.Y;
    this.rows = options.rows ?? 0;
    this.columns = options.columns ?? 0;
    this.multiple = options.multiple ?? false;
    this.selectable = options.selectable ?? true;
    this.widgets = [];

    if (this.axis == MenuAxisEnum.X) {
      this.rows = 1;
      this.columns = Infinity;
      this.node.style.display = 'flex';
      this.node.style.flexDirection = 'row';
    }
    else if (this.axis == MenuAxisEnum.Y) {
      this.rows = Infinity;
      this.columns = 1;
      this.node.style.display = 'flex';
      this.node.style.flexDirection = 'column';
    }
    else {
      this.node.style.display = 'grid';
      this.node.style.grid = 'repeat(' + this.rows + ', auto) / repeat(' + this.columns + ', auto)';
    }
  }

  update(ts) {
    for (let widget of this.widgets) {
      widget.update(ts);
    }
  }

  focus(focusIndex = MenuFocusEnum.AUTO) {
    if (focusIndex == MenuFocusEnum.AUTO) {
      let focusedIndex = this.getFocusedWidgetIndex();
      this.focusWidget(focusedIndex > 0 ? focusedIndex : 0, true);
    }
    else if (focusIndex >= 0) {
      this.focusWidget(focusIndex, true);
    }

    super.focus();
  }

  getFocusedWidgetIndex() {
    return this.widgets.findIndex(w => w.isFocused());
  }

  getSelectedWidgetIndex() {
    return this.widgets.findIndex(w => w.isSelected());
  }

  getSelectedWidgetIndexes() {
    return this.widgets.map(w => w.isSelected());
  }

  getWidgets() {
    return this.widgets;
  }

  addWidget(widget, index = -1) {
    let widgetNode = widget.getNode();

    if (index == -1) {
      this.widgets.push(widget);
      this.node.appendChild(widgetNode);
    }
    else {
      this.widgets.splice(index + 1, 0, widget);
      this.node.insertBefore(widgetNode, this.node.children[index]);
    }

    widgetNode.addEventListener('click', () => this.handleWidgetClicked(widget));
  }

  removeWidget(index) {
    let widget = this.widgets[index];
    if (!widget) {
      throw new Error('UIMenu::removeWidget(): widget not found !');
    }

    this.widgets.splice(this.widgets.indexOf(widget), 1);
    widget.delete();
  }

  focusWidget(index, preventScroll = false, emit = true) {
    let widget = this.widgets[index];
    if (!widget) {
      throw new Error('UIMenu::focusWidget(): widget not found !');
    }

    if (!preventScroll) {
      let rect = this.getViewRectWidget(index);
      if (rect.top < 0) {
        this.node.scrollTop += rect.top;
      }
      if (rect.bottom > this.node.clientHeight) {
        this.node.scrollTop += rect.bottom - this.node.clientHeight;
      }
    }

    this.widgets.forEach(w => w.unfocus());
    widget.focus();

    if (emit) {
      eventManager.emit(this, 'E_MENU_ITEM_FOCUSED', { widget: widget, index: index });
    }
  }

  unfocusWidget(emit = true) {
    this.widgets.forEach(w => w.unfocus());

    if (emit) {
      eventManager.emit(this, 'E_MENU_ITEM_UNFOCUSED');
    }
  }

  selectWidget(index, emit = true) {
    let widget = this.widgets[index];
    if (!widget) {
      throw new Error('UIMenu::selectWidget(): widget not found !');
    }
    if (!widget.isEnabled()) {
      return;
    }

    if (this.multiple && widget.isSelected()) {
      widget.setSelected(false);
      return;
    }

    if (!this.multiple) {
      this.widgets.forEach(w => w.setSelected(false));
    }

    widget.setSelected(true);

    if (emit) {
      eventManager.emit(this, 'E_MENU_ITEM_SELECTED', { widget: widget, index: index });
    }
  }

  unselectWidget(index, emit = true) {
    let widget = this.widgets[index];
    if (!widget) {
      throw new Error('UIMenu::unselectWidget(): widget not found !');
    }
    if (!widget.isSelected()) {
      return;
    }

    widget.setSelected(false);

    if (emit) {
      eventManager.emit(this, 'E_MENU_ITEM_UNSELECTED', { widget: widget, index: index });
    }
  }

  unselectWidgets(emit = true) {
    this.widgets.forEach(w => w.setSelected(false));
    
    if (emit) {
      eventManager.emit(this, 'E_MENU_UNSELECTED');
    }
  }

  setEnabledWidget(index, enabled) {
    const widget = this.widgets[index];
    if (!widget) {
      throw new Error('UIMenu::setEnabledWidget(): widget not found !');
    }

    widget.setEnabled(enabled);
  }

  setEnabledWidgets(enabled) {
    this.widgets.forEach(w => w.setEnabled(enabled));
  }

  clear() {
    this.widgets.forEach(w => w.delete());
    this.widgets = [];
    this.node.innerHTML = '';
  }

  close() {
    this.unselectWidgets();
    this.unfocusWidget();
    this.hide();
  }

  getViewRectWidget(index) {
    let top = this.node.children[index].offsetTop - this.node.scrollTop;
    let bottom = top + this.node.children[index].offsetHeight;
    return { top, bottom };
  }

  onKeyDown(e) {
    let focusedIndex = this.getFocusedWidgetIndex();
    if (e.key == 'Escape') {
      eventManager.emit(this, 'E_CLOSED');
    }
    else if (e.key == 'Enter' && this.selectable && focusedIndex != -1) {
      this.selectWidget(focusedIndex);
    }
    else if (e.key == 'ArrowLeft') {
      let prevIndex = (focusedIndex - 1 < 0) ? this.widgets.length - 1 : focusedIndex - 1;
      this.focusWidget(prevIndex);
    }
    else if (e.key == 'ArrowRight') {
      let nextIndex = (focusedIndex + 1 > this.widgets.length - 1) ? 0 : focusedIndex + 1;
      this.focusWidget(nextIndex);
    }
    else if (e.key == 'ArrowUp') {
      let prevIndex = (focusedIndex - this.columns < 0) ? this.widgets.length - 1 : focusedIndex - this.columns;
      this.focusWidget(prevIndex);
    }
    else if (e.key == 'ArrowDown') {
      let nextIndex = (focusedIndex + this.columns > this.widgets.length - 1) ? 0 : focusedIndex + this.columns;
      this.focusWidget(nextIndex);
    }
  }

  handleWidgetClicked(widget) {
    if (!this.isFocused()) {
      return;
    }

    this.selectWidget(this.widgets.indexOf(widget), true);
  }
}

module.exports.MenuFocusEnum = MenuFocusEnum;
module.exports.MenuAxisEnum = MenuAxisEnum;
module.exports.UIMenu = UIMenu;
},{"../event/event_manager":6,"./ui_widget":46}],40:[function(require,module,exports){
let { UIWidget } = require('./ui_widget');

class UIMenuItemText extends UIWidget {
  constructor(options = {}) {
    super({
      className: 'UIMenuItemText'
    });

    this.node.textContent = options.text ?? '';
  }

  setText(text) {
    this.node.textContent = text;
  }
}

module.exports.UIMenuItemText = UIMenuItemText;
},{"./ui_widget":46}],41:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIMessage extends UIWidget {
  constructor() {
    super({
      className: 'UIMessage',
      template: `
      <div class="UIMessage-inner">
        <div class="UIMessage-picture js-picture"></div>
        <div class="UIMessage-textbox">
          <div class="UIMessage-textbox-author js-author"></div>
          <div class="UIMessage-textbox-text js-text"></div>
          <div class="UIMessage-textbox-next js-next"></div>
        </div>
      </div>`
    });

    this.text = '';
    this.stepDuration = 0;
    this.currentTextOffset = 0;
    this.timeElapsed = 0;
    this.isFinished = false;
  }

  update(ts) {
    if (this.isFinished) {
      return;
    }

    if (!this.isFinished && this.currentTextOffset == this.text.length) {
      this.isFinished = true;
      this.node.querySelector('.js-next').style.display = 'block';
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('.js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
        this.currentTextOffset++;
      }

      this.timeElapsed = 0;
    }
    else {
      this.timeElapsed += ts;
    }
  }

  setPicture(pictureFile) {
    this.node.querySelector('.js-picture').innerHTML = '<img class="UIMessage-picture-img" src="' + pictureFile + '">';
  }

  setAuthor(author) {
    this.node.querySelector('.js-author').textContent = author;
  }

  setText(text) {
    this.text = text;
    this.currentTextOffset = 0;
    this.isFinished = false;
    this.node.querySelector('.js-next').style.display = 'none';
  }

  setStepDuration(stepDuration) {
    this.stepDuration = stepDuration;
  }

  onKeyDown(e) {
    if (e.key == 'Enter' && this.isFinished) {
      eventManager.emit(this, 'E_CLOSE');
    }
  }
}

module.exports.UIMessage = UIMessage;
},{"../event/event_manager":6,"./ui_widget":46}],42:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIPrint extends UIWidget {
  constructor() {
    super({
      className: 'UIPrint',
      template: `
      <div class="UIPrint-textbox">
        <div class="UIPrint-textbox-text js-text"></div>
        <div class="UIPrint-textbox-next js-next"></div>
      </div>`
    });

    this.text = '';
    this.stepDuration = 0;
    this.currentTextOffset = 0;
    this.timeElapsed = 0;
    this.isFinished = false;
  }

  update(ts) {
    if (this.isFinished) {
      return;
    }

    if (!this.isFinished && this.currentTextOffset == this.text.length) {
      this.isFinished = true;
      this.node.querySelector('.js-next').style.display = 'block';
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('.js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
        this.currentTextOffset++;
      }

      this.timeElapsed = 0;
    }
    else {
      this.timeElapsed += ts;
    }
  }

  setText(text) {
    this.text = text;
    this.currentTextOffset = 0;
    this.isFinished = false;
    this.node.querySelector('.js-next').style.display = 'none';
  }

  setStepDuration(stepDuration) {
    this.stepDuration = stepDuration;
  }

  onKeyDown(e) {
    if (e.key == 'Enter' && this.isFinished) {
      eventManager.emit(this, 'E_CLOSE');
    }
  }
}

module.exports.UIPrint = UIPrint;
},{"../event/event_manager":6,"./ui_widget":46}],43:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');
let { UIMenuItemText } = require('./ui_menu_item_text');
let { UIMenu } = require('./ui_menu');
let { MenuAxisEnum } = require('./ui_menu');

class UIPrompt extends UIWidget {
  constructor() {
    super({
      className: 'UIPrompt',
      template: `
      <div class="UIPrompt-text js-text"></div>
      <div class="UIPrompt-menu js-menu"></div>`
    });

    this.menu = new UIMenu({ axis: MenuAxisEnum.X });
    this.node.querySelector('.js-menu').replaceWith(this.menu.node);
    eventManager.subscribe(this.menu, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  update(ts) {
    this.menu.update(ts);
  }

  delete() {
    this.menu.delete();
    super.delete();
  }

  focus() {
    this.menu.focus();
    super.focus();
  }

  unfocus() {
    this.menu.unfocus();
    super.unfocus();
  }

  setText(text) {
    this.node.querySelector('.js-text').textContent = text;
  }

  setActions(actions) {
    this.menu.clear();
    for (let action of actions) {
      this.menu.addWidget(new UIMenuItemText({ text: action }));
    }
  }

  handleMenuItemSelected(data) {
    eventManager.emit(this, 'E_MENU_ITEM_SELECTED', data);
  }
}

module.exports.UIPrompt = UIPrompt;
},{"../event/event_manager":6,"./ui_menu":39,"./ui_menu_item_text":40,"./ui_widget":46}],44:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class JAS {
  constructor() {
    this.imageFile = '';
    this.animations = [];
  }
}

class JASFrame {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class JASAnimation {
  constructor() {
    this.name = '';
    this.frames = [];
    this.frameDuration = 0;
  }
}

class UISprite extends UIWidget {
  constructor(options = {}) {
    super({
      className: options.className ?? 'UISprite'
    });

    this.jas = new JAS();
    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.isLooped = false;
    this.timeElapsed = 0;
  }

  update(ts) {
    let currentAnimation = this.jas.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let currentFrame = currentAnimation.frames[this.currentAnimationFrameIndex];

    this.node.style.backgroundPositionX = -currentFrame.x + 'px';
    this.node.style.backgroundPositionY = -currentFrame.y + 'px';
    this.node.style.width = currentFrame.width + 'px';
    this.node.style.height = currentFrame.height + 'px';

    if (this.timeElapsed >= currentAnimation.frameDuration) {
      if (this.currentAnimationFrameIndex == currentAnimation.frames.length - 1) {
        eventManager.emit(this, 'E_FINISHED');
        this.currentAnimationFrameIndex = this.isLooped ? 0 : currentAnimation.frames.length - 1;
        this.timeElapsed = 0;
      }
      else {
        this.currentAnimationFrameIndex = this.currentAnimationFrameIndex + 1;
        this.timeElapsed = 0;
      }
    }
    else {
      this.timeElapsed += ts;
    }
  }

  loadFromData(data) {
    this.jas = new JAS();
    this.jas.imageFile = data['ImageFile'];

    for (let obj of data['Animations']) {
      let animation = new JASAnimation();
      animation.name = obj['Name'];
      animation.frames = [];
      animation.frameDuration = parseInt(obj['FrameDuration']);

      for (let objFrame of obj['Frames']) {
        let frame = new JASFrame();
        frame.x = objFrame['X'];
        frame.y = objFrame['Y'];
        frame.width = objFrame['Width'];
        frame.height = objFrame['Height'];
        animation.frames.push(frame);
      }

      this.jas.animations.push(animation);
    }

    this.node.style.backgroundImage = 'url("' + this.jas.imageFile + '")';
    this.currentAnimationName = '';
    this.currentAnimationIndex = 0;
    this.timeElapsed = 0;
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    this.loadFromData(await response.json());
  }

  loadFromFileSync(path) {
    let request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send(null);
    this.loadFromData(JSON.parse(this.responseText));
  }

  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    let animation = this.jas.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('UISprite::play: animation not found.');
    }

    this.currentAnimationName = animationName;
    this.currentAnimationFrameIndex = 0;
    this.isLooped = isLooped;
    this.timeElapsed = 0;
  }
}

module.exports.UISprite = UISprite;
},{"../event/event_manager":6,"./ui_widget":46}],45:[function(require,module,exports){
let { UIWidget } = require('./ui_widget');

class UIText extends UIWidget {
  constructor() {
    super({
      className: 'UIText',
      template: '<span class="UIText-text js-text"></span>'
    });
  }

  setText(text) {
    this.node.querySelector('.js-text').textContent = text;
  }
}

module.exports.UIText = UIText;
},{"./ui_widget":46}],46:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');

/**
 * Classe représentant un élément d'interface utilisateur.
 */
class UIWidget {
  /**
   * Créer un élément d'interface utilisateur.
   */
  constructor(options = {}) {
    this.id = '';
    this.className = options.className ?? '';
    this.template = options.template ?? '';
    this.node = document.createElement('div');
    this.node.className = this.className;
    this.node.innerHTML = this.template;
    this.handleKeyDownCb = (e) => this.onKeyDown(e);
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    // virtual method called during update phase !
  }

  /**
   * Destructeur.
   * Nota bene: Entraine la désinscription des évènements utilisateur et détache le noeud HTML de son parent.
   */
  delete() {
    document.removeEventListener('keydown', this.handleKeyDownCb);
    this.node.remove();
    this.node = null;
  }

  /**
   * Retourne l'identifiant.
   * @return {string} L'Identifiant.
   */
  getId() {
    return this.id;
  }

  /**
   * Définit l'identifiant.
   * @param {string} id - L'Identifiant.
   */
  setId(id) {
    this.id = id;
  }

  /**
   * Retourne le noeud HTML parent.
   * @param {HTMLElement} node - Le noeud HTML.
   */
  getNode() {
    return this.node;
  }

  /**
   * Ajoute du css dans le style-inline du noeud parent.
   * @param {string} styles - Le css.
   */
  appendStyles(styles) {
    this.node.style.cssText += styles;
  }

  /**
   * Donne le focus.
   * Nota bene: Souscription aux évènements utilisateur et ajout de la classe 'u-focused'.
   */
  focus() {
    this.node.classList.add('u-focused');
    eventManager.emit(this, 'E_FOCUSED');
    document.addEventListener('keydown', this.handleKeyDownCb);
  }

  /**
   * Enlève le focus.
   * Nota bene: Désinscription aux évènements utilisateur et suppréssion de la classe 'u-focused'.
   */
  unfocus() {
    this.node.classList.remove('u-focused');
    eventManager.emit(this, 'E_UNFOCUSED');
    document.removeEventListener('keydown', this.handleKeyDownCb);
  }

  /**
   * Vérifie si le widget est focus.
   * @return {boolean} Vrai si le widget est focus.
   */
  isFocused() {
    return this.node.classList.contains('u-focused') == true;
  }

  /**
   * Rends le widget visible.
   */
  setVisible(visible) {
    if (visible) {
      this.node.classList.remove('u-hidden');
      
    }
    else {
      this.node.classList.add('u-hidden');
    }
  }

  /**
   * Vérifie si le widget est visible.
   * @return {boolean} Vrai si le widget est visible.
   */
  isVisible() {
    return this.node.classList.contains('u-hidden') == false;
  }

  setEnabled(enabled) {
    if (enabled) {
      this.node.classList.remove('u-disabled');
    }
    else {
      this.node.classList.add('u-disabled');
    }
  }

  isEnabled() {
    return this.node.classList.contains('u-disabled') === false;
  }

  setSelected(selected) {
    if (selected) {
      this.node.classList.add('u-selected');
    }
    else {
      this.node.classList.remove('u-selected');
    }
  }

  isSelected() {
    return this.node.classList.contains('u-selected');
  }

  animate(animation) {
    this.node.style.animation = animation;
  }

  onKeyDown(e) {
    // virtual method !
  }
}

module.exports.UIWidget = UIWidget;
},{"../event/event_manager":6}],47:[function(require,module,exports){
window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { BootScreen } = require('./screens/boot_screen');
  let { gameManager } = require('./game_manager');  

  await gameManager.loadFromFile('./assets/player.json');
  GWE.screenManager.requestSetScreen(new BootScreen(gameManager));
  requestAnimationFrame(ts => gameManager.run(ts));
});
},{"./game_manager":67,"./screens/boot_screen":68,"gwe":23}],48:[function(require,module,exports){
class Attributes {
  constructor(data) {
    this.map = data;
    this.modifiers = [];
  }

  get(key) {
    if (!this.map.hasOwnProperty(key)) {
      return;
    }

    let value = this.map[key];

    for (let modifier of this.modifiers) {
      if (modifier.getAttributeKey() == key && modifier.getType() == 'MUL') {
        value *= modifier.getValue();
      }
    }

    for (let modifier of this.modifiers) {
      if (modifier.getAttributeKey() == key && modifier.getType() == 'ADD') {
        value += modifier.getValue();
      }
    }

    for (let modifier of this.modifiers) {
      if (modifier.getAttributeKey() == key && modifier.getType() == 'SUB') {
        value -= modifier.getValue();
      }
    }

    for (let modifier of this.modifiers) {
      if (modifier.getAttributeKey() == key && modifier.getType() == 'SET') {
        value = modifier.getValue();
      }
    }

    for (let modifier of this.modifiers) {
      if (modifier.getAttributeKey() == key && modifier.getType() == 'FIN') {
        value = modifier.getValue();
      }
    }

    if (value < 0) {
      value = 0;
    }

    if (this.map.hasOwnProperty(key + '_MIN')) {
      value = Math.max(value, this.map[key + '_MIN']);
    }
    if (this.map.hasOwnProperty(key + '_MAX')) {
      value = Math.min(value, this.map[key + '_MAX']);
    }

    return value;
  }

  getBase(key) {
    if (!this.map.hasOwnProperty(key)) {
      return;
    }

    return this.map[key];
  }

  set(key, value) {
    if (!this.map.hasOwnProperty(key)) {
      return;
    }

    if (value < 0) {
      value = 0;
    }

    if (this.map.hasOwnProperty(key + '_MIN')) {
      value = Math.max(value, this.map[key + '_MIN']);
    }
    if (this.map.hasOwnProperty(key + '_MAX')) {
      value = Math.min(value, this.map[key + '_MAX']);
    }

    this.map[key] = value;
  }

  add(key, value) {
    this.set(key, this.getBase(key) + value);
  }

  has(key) {
    return this.map.hasOwnProperty(key);
  }

  addModifier(modifier) {
    this.modifiers.push(modifier);
  }

  removeModifier(modifier) {
    this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
  }

  addModifiers(modifiers) {
    for (let modifier of modifiers) {
      this.modifiers.push(modifier);
    }
  }

  removeModifiers(modifiersToRemove) {
    for (let modifier of modifiersToRemove) {
      this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
    }
  }

  clearModifiers() {
    while (this.modifiers.length) {
      this.modifiers.pop();
    }
  }
}

module.exports.Attributes = Attributes;
},{}],49:[function(require,module,exports){
let { GWE } = require('gwe');
let { EnemyCharacter } = require('./enemy_character');
let { NewTurnBattleAction, ApplyEffectBattleAction, LetBattleAction } = require('./battle_actions');
let { gameManager } = require('../game_manager');

class Battle {
  constructor() {
    this.backgroundImage = '';
    this.enemies = [];
    this.player = gameManager.getPlayer();
    this.heroes = this.player.getHeroes();
    this.numTurns = 0;
    this.characterQueue = [];
  }

  async loadFromData(data) {
    this.backgroundImage = data['BackgroundImage'];

    for (let obj of data['Enemies']) {
      let enemy = new EnemyCharacter();
      await enemy.loadFromFile('assets/models/' + obj['EnemyId'] + '/data.json');
      enemy.setPosition(obj['Position']);
      this.enemies.push(enemy);
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getBackgroundImage() {
    return this.backgroundImage;
  }

  getEnemies() {
    return this.enemies;
  }

  getHeroes() {
    return this.heroes;
  }

  getNumTurns() {
    return this.numTurns;
  }

  getCharacterQueue() {
    return this.characterQueue;
  }

  startup() {
    this.runAction(new NewTurnBattleAction(this));
  }

  async runAction(action) {
    // exec action
    await action.exec();

    // remove died character from the queue
    for (let char of this.characterQueue) {
      if (char.getAttribute('HP') == 0) {
        this.characterQueue.splice(this.characterQueue.indexOf(char), 1);
      }
    }

    // check lost
    let sumHeroHealth = this.heroes.reduce((s, hero) => s + hero.getAttribute('HP'), 0);
    if (sumHeroHealth == 0) {
      return GWE.eventManager.emit(this, 'E_LOST');
    }

    // check win
    let sumEnemyHealth = this.enemies.reduce((s, enemy) => s + enemy.getAttribute('HP'), 0);
    if (sumEnemyHealth == 0) {
      return GWE.eventManager.emit(this, 'E_WIN');
    }

    // if queue is empty everybody has played, return and create new turn !
    if (this.characterQueue.length == 0) {
      return this.runAction(new NewTurnBattleAction(this));
    }

    // else, set character ready
    let ready = this.characterQueue.filter(char => char.isReady());
    if (ready.length == 0) {
      let i = 0;
      while (i < this.characterQueue.length && this.characterQueue[0].getType() == this.characterQueue[i].getType()) {
        ready.push(this.characterQueue[i]);
        this.characterQueue[i].setReady(true);
        i++;
      }
    }

    if (ready[0] instanceof EnemyCharacter) {
      this.handleAI();
    }
    else {
      GWE.eventManager.emit(this, 'E_HERO_READY', { char: ready[0] });
    }
  }

  async operationNewTurn() {
    let characters = [...this.heroes, ...this.enemies];
    characters = characters.sort((a, b) => b.getAttribute('AGILITY') - a.getAttribute('AGILITY'));
    characters = characters.filter(c => c.getAttribute('HP') > 0);

    for (let char of characters) {
      for (let seal of char.getActiveSeals()) {
        seal.incTurnCount();
        if (seal.onTurnEffect) {
          await seal.onTurnEffect.apply(seal.getFromChar(), char);
        }
        if (seal.getTurnCount() == seal.getNumTurns()) {
          char.removeSeal(seal);
        }
      }

      char.setReady(false);
    }

    this.numTurns++;
    this.characterQueue = characters;
    GWE.eventManager.emit(this, 'E_NEW_TURN');
  }

  async operationLet(fromChar) {
    this.characterQueue.splice(this.characterQueue.indexOf(fromChar), 1);
  }

  async operationApplyEffect(effect, fromChar, toChar) {
    await effect.apply(fromChar, toChar);
    let attributes = fromChar.getAttributes();
    attributes.add('MP', - effect.getCost());

    this.characterQueue.splice(this.characterQueue.indexOf(fromChar), 1);
  }

  async operationApplyItem(item, fromChar, toChar) {
    let inventory = this.player.getInventory();
    let effect = item.getEffect();

    await effect.apply(fromChar, toChar);
    inventory.removeItemById(item.getId());
    this.characterQueue.splice(this.characterQueue.indexOf(fromChar), 1);
  }

  handleAI() {
    let enemy = this.characterQueue[0];
    let charArray = [...this.heroes, ...this.enemies];

    let orderedPatterns = enemy.patterns.sort((a, b) => a.priority - b.priority);
    let availablePatterns = orderedPatterns.filter(pattern => pattern.isConditionCheck(this, enemy));

    let selectedEffect = null;
    let selectedTarget = null;

    if (availablePatterns.length > 0) {
      for (let pattern of availablePatterns) {
        let targets = charArray.filter(char => pattern.effect.isTargetConditionCheck(enemy, char));
        if (targets.length > 0) {
          selectedEffect = pattern.effect;
          selectedTarget = targets.sort(pattern.targetSort)[0];
          break;
        }
      }
    }
    else {
      let indexes = GWE.Utils.RANDARRAY(0, enemy.patterns.length - 1);
      for (let index of indexes) {
        let pattern = enemy.patterns[index];
        let targets = charArray.filter(char => pattern.effect.isTargetConditionCheck(enemy, char));
        if (targets.length > 0) {
          selectedEffect = pattern.effect;
          selectedTarget = targets.sort((a, b) => pattern.targetSort(a, b))[0];
          break;
        }
      }
    }

    if (selectedEffect && selectedTarget) {
      this.runAction(new ApplyEffectBattleAction(this, selectedEffect, enemy, selectedTarget));
    }
    else {
      this.runAction(new LetBattleAction(this, enemy));
    }
  }
}

module.exports.Battle = Battle;
},{"../game_manager":67,"./battle_actions":50,"./enemy_character":54,"gwe":23}],50:[function(require,module,exports){
class BattleAction {
  constructor(battle) {
    this.battle = battle;
  }

  async exec() {}
}

class LetBattleAction extends BattleAction {
  constructor(battle, fromChar) {
    super(battle);
    this.fromChar = fromChar;
  }

  async exec() {
    await this.battle.operationLet(this.fromChar);
  }
}

class ApplyEffectBattleAction extends BattleAction {
  constructor(battle, effect, fromChar, toChar) {
    super(battle);
    this.effect = effect;
    this.fromChar = fromChar;
    this.toChar = toChar;
  }

  async exec() {
    await this.battle.operationApplyEffect(this.effect, this.fromChar, this.toChar);
  }
}

class ApplyItemBattleAction extends BattleAction {
  constructor(battle, item, fromChar, toChar) {
    super(battle);
    this.item = item;
    this.fromChar = fromChar;
    this.toChar = toChar;
  }

  async exec() {
    await this.battle.operationApplyItem(this.item, this.fromChar, this.toChar);
  }
}

class NewTurnBattleAction extends BattleAction {
  constructor(battle) {
    super(battle);
  }

  async exec() {
    await this.battle.operationNewTurn();
  }
}

module.exports.LetBattleAction = LetBattleAction;
module.exports.ApplyEffectBattleAction = ApplyEffectBattleAction;
module.exports.ApplyItemBattleAction = ApplyItemBattleAction;
module.exports.NewTurnBattleAction = NewTurnBattleAction;
},{}],51:[function(require,module,exports){
let { GWE } = require('gwe');
let { Attributes } = require('./attributes');
let { Effect } = require('./effect');
let { ELEMENT } = require('./enums');

class CharacterAbstract {
  constructor() {
    this.id = '';
    this.type = '';
    this.name = '';
    this.description = '';
    this.pictureFile = '';
    this.spriteFile = '';
    this.attributes; // [LV, LV_MAX, XP, XP_MAX, HP, HP_MAX, MP, MP_MAX, ATK, DEF, MAGIC_ATK, MAGIC_DEF, AGILITY, ELEMENT]
    this.attackEffects = [];
    this.magicEffects = [];
    this.activeSeals = [];
    this.ready = false;
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.type = data['Type'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.pictureFile = data['PictureFile'];
    this.spriteFile = data['SpriteFile'];
    this.attributes = new Attributes(data['Attributes']);

    for (let effectId of data['AttackEffectIds']) {
      let effect = new Effect();
      await effect.loadFromFile('assets/models/' + effectId + '/data.json');
      this.attackEffects.push(effect);
    }

    for (let effectId of data['MagicEffectIds']) {
      let effect = new Effect();
      await effect.loadFromFile('assets/models/' + effectId + '/data.json');
      this.magicEffects.push(effect);
    }
  }

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPictureFile() {
    return this.pictureFile;
  }

  getSpriteFile() {
    return this.spriteFile;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  getAttackEffects() {
    return this.attackEffects;
  }

  getMagicEffects() {
    return this.magicEffects;
  }

  getActiveSeals() {
    return this.activeSeals;
  }

  setReady(ready) {
    this.ready = ready;
  }

  isReady() {
    return this.ready;
  }

  async addSeal(seal) {
    if (!seal.stackable && this.activeSeals.find(s => s.id == seal.id)) {
      return GWE.eventManager.emit(this, 'E_SEAL_ADD_FAILED');
    }

    this.attributes.addModifiers(seal.modifiers);
    this.activeSeals.push(seal);
    await GWE.eventManager.emit(this, 'E_SEAL_ADDED');
  }

  async removeSeal(seal) {
    if (!this.activeSeals.find(s => s == seal)) {
      return GWE.eventManager.emit(this, 'E_SEAL_REMOVE_FAILED');
    }

    this.attributes.removeModifiers(seal.modifiers);
    this.activeSeals.splice(this.activeSeals.indexOf(seal), 1);
    await GWE.eventManager.emit(this, 'E_SEAL_REMOVED');
  }

  async increaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_HP', { amount: amount });
  }

  async decreaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_HP', { amount: amount });
  }

  async increaseMP(amount) {
    this.attributes.add('MP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_MP', { amount: amount });
  }

  async decreaseMP(amount) {
    this.attributes.add('MP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_MP', { amount: amount });
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function GET_ELEMENTAL_OPPOSITION_FACTOR(attackElement, defendElement) {
  if (
    (attackElement == ELEMENT.RED && defendElement == ELEMENT.BLUE) ||
    (attackElement == ELEMENT.BLUE && defendElement == ELEMENT.RED) ||
    (attackElement == ELEMENT.BLACK && defendElement == ELEMENT.WHITE) ||
    (attackElement == ELEMENT.WHITE && defendElement == ELEMENT.BLACK)) {
    return 2;
  }

  return 1;
}

module.exports.CharacterAbstract = CharacterAbstract;
},{"./attributes":48,"./effect":53,"./enums":55,"gwe":23}],52:[function(require,module,exports){
let { ItemAbstract } = require('./item_abstract');
let { Effect } = require('./effect');

class CommonItem extends ItemAbstract {
  constructor() {
    super();
    this.effect = null;
  }

  async loadFromData(data) {
    if (data.hasOwnProperty('Effect')) {
      this.effect = new Effect();
      await this.effect.loadFromData(data['Effect']);
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  hasEffect() {
    return this.effect ? true : false;
  }

  getEffect() {
    return this.effect;
  }

  isTarget(fromChar, toChar) {
    return this.effect && this.effect.isTargetConditionCheck(fromChar, toChar);
  }

  apply(fromChar, toChar) {
    this.effect.apply(fromChar, toChar);
  }
}

module.exports.CommonItem = CommonItem;
},{"./effect":53,"./item_abstract":59}],53:[function(require,module,exports){
let { GWE } = require('gwe');
let { EFFECT_TARGET_CONDITION_MAPPING } = require('./mappings/effect_target_condition_mapping');
let { EFFECT_MECHANIC_MAPPING } = require('./mappings/effect_mechanic_mapping');
let { ITEM_AVAILABILITY_TYPE } = require('./enums');

class Effect {
  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.cost = 0;
    this.spriteAnimationName = '';
    this.availabilityType = '';
    this.mechanicId = '';
    this.mechanicOpts = {};
    this.targetConditionId = '';
    this.targetConditionOpts = {};
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.cost = data['Cost'];
    this.spriteAnimationName = data['SpriteAnimationName'];
    this.availabilityType = data['AvailabilityType'];
    this.mechanicId = data['MechanicId'];
    this.mechanicOpts = data['MechanicOpts'];
    this.targetConditionId = data['TargetConditionId'];
    this.targetConditionOpts = data['TargetConditionOpts'];
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getCost() {
    return this.cost;
  }

  getSpriteAnimationName() {
    return this.spriteAnimationName;
  }

  getAvailabilityType() {
    return this.availabilityType;
  }

  getMechanicId() {
    return this.mechanicId;
  }

  getMechanicOpts() {
    return this.mechanicOpts;
  }

  getTargetConditionId() {
    return this.targetConditionId;
  }

  getTargetConditionOpts() {
    return this.targetConditionOpts;
  }

  isMenuAvailable() {
    return this.availabilityType == ITEM_AVAILABILITY_TYPE.ALL || this.availabilityType == ITEM_AVAILABILITY_TYPE.MENU;
  }

  isBattleAvailable() {
    return this.availabilityType == ITEM_AVAILABILITY_TYPE.ALL || this.availabilityType == ITEM_AVAILABILITY_TYPE.BATTLE;
  }

  isUsable(fromChar) {
    return this.cost <= fromChar.getAttribute('MP');
  }

  isTargetConditionCheck(fromChar, toChar) {
    let targetFn = EFFECT_TARGET_CONDITION_MAPPING[this.targetConditionId];
    return targetFn(fromChar, toChar, this.targetConditionOpts);
  }

  async apply(fromChar, toChar) {
    await GWE.eventManager.emit(toChar, 'E_EFFECT_INFLICT', { effect: this });
    let mechanicFn = EFFECT_MECHANIC_MAPPING[this.mechanicId];
    await mechanicFn(fromChar, toChar, this.mechanicOpts);
  }
}

module.exports.Effect = Effect;
},{"./enums":55,"./mappings/effect_mechanic_mapping":60,"./mappings/effect_target_condition_mapping":61,"gwe":23}],54:[function(require,module,exports){
let { CharacterAbstract } = require('./character_abstract');
let { Effect } = require('./effect');
let { ENEMY_PATTERN_CONDITION_MAPPING } = require('./mappings/enemy_pattern_condition_mapping');
let { ENEMY_PATTERN_TARGET_SORT_MAPPING } = require('./mappings/enemy_pattern_target_sort_mapping');

class EnemyCharacter extends CharacterAbstract {
  constructor() {
    super();
    this.gils = 0;
    this.patterns = [];
    this.position = [0, 0, 0];
  }

  async loadFromData(data) {
    this.gils = data['Gils'];

    for (let obj of data['Patterns']) {
      let pattern = new EnemyPattern();
      await pattern.loadFromData(obj);
      this.patterns.push(pattern);
    }

    await super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getGils() {
    return this.gils;
  }

  getPatterns() {
    return this.patterns;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }
}

class EnemyPattern {
  constructor() {
    this.name = '';
    this.effect = null;
    this.priority = 0;
    this.conditionId = '';
    this.conditionOpts = {};
    this.targetSortId = '';
    this.targetSortOpts = {};
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.effect = new Effect();
    await this.effect.loadFromFile('assets/models/' + data['EffectId'] + '/data.json');
    this.priority = data['Priority'];
    this.conditionId = data['ConditionId'];
    this.conditionOpts = data['ConditionOpts'];
    this.targetSortId = data['TargetSortId'];
    this.targetSortOpts = data['TargetSortOpts'];
  }

  isConditionCheck(battle, enemy) {
    let conditionFn = ENEMY_PATTERN_CONDITION_MAPPING[this.conditionId];
    return conditionFn(battle, enemy, this.conditionOpts);
  }

  targetSort(a, b) {
    let targetSortFn = ENEMY_PATTERN_TARGET_SORT_MAPPING[this.targetSortId];
    return targetSortFn(a, b);
  }
}

module.exports.EnemyCharacter = EnemyCharacter;
module.exports.EnemyPattern = EnemyPattern;
},{"./character_abstract":51,"./effect":53,"./mappings/enemy_pattern_condition_mapping":62,"./mappings/enemy_pattern_target_sort_mapping":63}],55:[function(require,module,exports){
module.exports.CHARACTER_TYPE = {
  ENEMY: 'ENEMY',
  ALLY: 'ALLY'
};

module.exports.ITEM_AVAILABILITY_TYPE = {
  ALL: 'ALL',
  MENU: 'MENU',
  BATTLE: 'BATTLE'
};

module.exports.ITEM_TYPE = {
  POTION: 'POTION',
  FOOD: 'FOOD',
  WEAPON: 'WEAPON',
  HELMET: 'HELMET',
  ARMOR: 'ARMOR',
  RELIC: 'RELIC',
  OTHER: 'OTHER'
};

module.exports.EQUIPMENT_ITEM_SUBTYPE = {
  WEAPON_DAGGER: 'WEAPON_DAGGER',
  WEAPON_SWORD: 'WEAPON_SWORD',
  WEAPON_GUN: 'WEAPON_GUN',
  HELMET_ARMOR: 'HELMET_ARMOR',
  HELMET_EVASION: 'HELMET_EVASION',
  HELMET_MAGIC: 'HELMET_MAGIC',
  ARMOR_GENERAL: 'ARMOR_GENERAL',
  ARMOR_MAGIC: 'ARMOR_MAGIC',
  RELIC_PHYSICS: 'RELIC_PHYSICS',
  RELIC_MAGIC: 'RELIC_MAGIC'
};

module.exports.ELEMENT = {
  RED: 'RED',
  BLUE: 'BLUE',
  BLACK: 'BLACK',
  WHITE: 'WHITE'
};
},{}],56:[function(require,module,exports){
let { Modifier } = require('./modifier');
let { ItemAbstract } = require('./item_abstract');

class EquipmentItem extends ItemAbstract {
  constructor() {
    super();
    this.subType = '';
    this.modifiers = [];
  }

  async loadFromData(data) {
    this.subType = data['SubType'];

    for (let obj of data['Modifiers']) {
      this.modifiers.push(new Modifier(obj));
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getSubType() {
    return this.subType;
  }

  getModifiers() {
    return this.modifiers;
  }
}

module.exports.EquipmentItem = EquipmentItem;
},{"./item_abstract":59,"./modifier":64}],57:[function(require,module,exports){
let { CharacterAbstract } = require('./character_abstract');
let { EquipmentItem } = require('./equipment_item');
let { ITEM_TYPE } = require('./enums');

class HeroCharacter extends CharacterAbstract {
  constructor() {
    super();
    this.weapon = null;
    this.helmet = null;
    this.armor = null;
    this.relic = null;
    this.allowedEquipmentItemSubTypes = [];
  }

  async loadFromData(data) {
    if (data['WeaponId']) {
      let weapon = new EquipmentItem();
      await weapon.loadFromFile('assets/models/' + data['WeaponId'] + '/data.json');
      this.setEquipment(weapon);
    }
    if (data['HelmetId']) {
      let helmet = new EquipmentItem();
      await helmet.loadFromFile('assets/models/' + data['HelmetId'] + '/data.json');
      this.setEquipment(helmet);
    }
    if (data['ArmorId']) {
      let armor = new EquipmentItem();
      await armor.loadFromFile('assets/models/' + data['ArmorId'] + '/data.json');
      this.setEquipment(armor);
    }
    if (data['RelicId']) {
      let relic = new EquipmentItem();
      await relic.loadFromFile('assets/models/' + data['RelicId'] + '/data.json');
      this.setEquipment(relic);
    }

    for (let subType of data['AllowedEquipmentItemSubTypes']) {
      this.allowedEquipmentItemSubTypes.push(subType);
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getWeapon() {
    return this.weapon;
  }

  getHelmet() {
    return this.helmet;
  }

  getArmor() {
    return this.armor;
  }

  getRelic() {
    return this.relic;
  }

  getAllowedEquipmentItemSubTypes() {
    return this.allowedEquipmentItemSubTypes;
  }

  isEquipableItem(item) {
    return item instanceof EquipmentItem && this.allowedEquipmentItemSubTypes.includes(item.getSubType());
  }

  getAttributesWith(equipmentItem) {
    let newAttributes = {};
    let oldEquipment = this.setEquipment(equipmentItem);

    for (let attributeKey in this.attributes.map) {
      newAttributes[attributeKey] = this.attributes.get(attributeKey);
    }

    if (oldEquipment) {
      this.setEquipment(oldEquipment);
    }
    else {
      this.removeEquipment(equipmentItem);
    }

    return newAttributes;
  }

  setEquipment(equipmentItem) {
    let oldEquipmentItem = null;
    if (equipmentItem.type == ITEM_TYPE.WEAPON) {
      oldEquipmentItem = this.weapon;
      this.weapon = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.HELMET) {
      oldEquipmentItem = this.helmet;
      this.helmet = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.ARMOR) {
      oldEquipmentItem = this.armor;
      this.armor = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.RELIC) {
      oldEquipmentItem = this.relic;
      this.relic = equipmentItem;
    }

    if (oldEquipmentItem) {
      this.attributes.removeModifiers(oldEquipmentItem.modifiers);
    }

    this.attributes.addModifiers(equipmentItem.modifiers);
    return oldEquipmentItem;
  }

  removeEquipment(equipmentItem) {
    if (equipmentItem == this.weapon) {
      this.attributes.removeModifiers(this.weapon.modifiers);
      this.weapon = null;
      return true;
    }
    else if (equipmentItem == this.helmet) {
      this.attributes.removeModifiers(this.helmet.modifiers);
      this.helmet = null;
      return true;
    }
    else if (equipmentItem == this.armor) {
      this.attributes.removeModifiers(this.armor.modifiers);
      this.armor = null;
      return true;
    }
    else if (equipmentItem == this.relic) {
      this.attributes.removeModifiers(this.relic.modifiers);
      this.relic = null;
      return true;
    }

    return false;
  }
}

module.exports.HeroCharacter = HeroCharacter;
},{"./character_abstract":51,"./enums":55,"./equipment_item":56}],58:[function(require,module,exports){
let { GWE } = require('gwe');
let { EquipmentItem } = require('./equipment_item');
let { CommonItem } = require('./common_item');

const ITEM_STACK_MAX_CAPACITY = 99;

class Inventory extends GWE.ArrayCollection {
  constructor() {
    super();
  }

  async loadFromData(data) {
    for (let obj of data) {
      if (obj['ItemTypeName'] == 'CommonItem') {
        let item = new CommonItem();
        await item.loadFromFile('assets/models/' + obj['ItemId'] + '/data.json');
        item.setQuantity(obj['Quantity']);
        this.items.push(item);
      }
      else if (obj['ItemTypeName'] == 'EquipmentItem') {
        let item = new EquipmentItem();
        await item.loadFromFile('assets/models/' + obj['ItemId'] + '/data.json');
        item.setQuantity(obj['Quantity']);
        this.items.push(item);
      }
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getItemById(itemId) {
    return this.items.find(item => item.getId() == itemId);
  }

  findItemById(itemId) {
    return this.items.findIndex(item => item.getId() == itemId);
  }

  addItem(newItem) {
    let itemIndex = this.items.findIndex(item => item.getId() == newItem.id);

    if (itemIndex != -1) {
      let item = this.items[itemIndex];
      if (item.getQuantity() + newItem.getQuantity() > ITEM_STACK_MAX_CAPACITY) {
        return;
      }

      item.setQuantity(item.getQuantity() + newItem.getQuantity());
    }
    else {
      this.items.push(newItem);
      GWE.eventManager.emit(this, 'E_ITEM_ADDED', { item: newItem, index: this.items.indexOf(newItem) });
    }
  }

  removeItemById(itemId, quantity = 1) {
    let itemIndex = this.items.findIndex(item => item.getId() == itemId);
    if (itemIndex == -1) {
      return;
    }

    let item = this.items[itemIndex];
    let restQuantity = item.getQuantity() - quantity;

    if (restQuantity == 0) {
      this.items.splice(this.items.indexOf(item), 1);
      GWE.eventManager.emit(this, 'E_ITEM_REMOVED', { item: item, index: itemIndex });
    }
    else if (restQuantity > 0) {
      item.setQuantity(restQuantity);
    }
    else {
      return; // throw
    }

    return restQuantity;
  }
}

module.exports.Inventory = Inventory;
},{"./common_item":52,"./equipment_item":56,"gwe":23}],59:[function(require,module,exports){
class ItemAbstract {
  constructor() {
    this.id = '';
    this.type = '';
    this.name = '';
    this.description = '';
    this.pictureFile = '';
    this.soldable = true;
    this.price = 0;
    this.quantity = 1;
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.type = data['Type'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.pictureFile = data['PictureFile'];
    this.soldable = data['Soldable'];
    this.price = data['Price'];
  }

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPictureFile() {
    return this.pictureFile;
  }

  getSoldable() {
    return this.soldable;
  }

  getPrice() {
    return this.price;
  }

  getQuantity() {
    return this.quantity;
  }

  setQuantity(quantity) {
    this.quantity = quantity;
  }
}

module.exports.ItemAbstract = ItemAbstract;
},{}],60:[function(require,module,exports){
let { Seal } = require('../seal');
let EFFECT_MECHANIC_MAPPING = {};

EFFECT_MECHANIC_MAPPING['RESTORE'] = async function (fromChar, toChar, opts = { amount, element }) {
  await toChar.increaseHP(opts.amount, opts.element);
}

EFFECT_MECHANIC_MAPPING['DAMAGE'] = async function (fromChar, toChar, opts = { amount, element }) {
  await toChar.decreaseHP(opts.amount, opts.element);
}

EFFECT_MECHANIC_MAPPING['INCREASE_MANA'] = async function (fromChar, toChar, opts = { amount }) {
  await toChar.increaseHP(opts.amount);
}

EFFECT_MECHANIC_MAPPING['DECREASE_MANA'] = async function (fromChar, toChar, opts = { amount }) {
  await toChar.decreaseHP(opts.amount);
}

EFFECT_MECHANIC_MAPPING['ADD_SEAL'] = async function (fromChar, toChar, opts = { sealId }) {
  let seal = Seal.createFromFile('assets/models/' + opts.sealId + '/data.json');
  seal.fromChar = fromChar;
  await toChar.addSeal(seal);
}

EFFECT_MECHANIC_MAPPING['REMOVE_SEAL'] = async function (fromChar, toChar, opts = { sealId }) {
  for (let seal of toChar.getActiveSeals()) {
    if (seal.getId() == sealId) {
      await toChar.removeSeal(seal);
    }
  }
}

module.exports.EFFECT_MECHANIC_MAPPING = EFFECT_MECHANIC_MAPPING;
},{"../seal":66}],61:[function(require,module,exports){
let EFFECT_TARGET_CONDITION_MAPPING = {};

EFFECT_TARGET_CONDITION_MAPPING['IS_ALL'] = function (fromChar, toChar, opts) {
  return true;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_SELF'] = function (fromChar, toChar, opts) {
  return fromChar == toChar;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALLY'] = function (fromChar, toChar, opts) {
  return fromChar.constructor.name == toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALIVE_ALLY'] = function (fromChar, toChar, opts) {
  return toChar.getAttribute('HP') > 0 && fromChar.constructor.name == toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_OPPONENT'] = function (fromChar, toChar, opts) {
  return fromChar.constructor.name != toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALIVE_OPPONENT'] = function (fromChar, toChar, opts) {
  return toChar.getAttribute('HP') > 0 && fromChar.constructor.name != toChar.constructor.name;
}

module.exports.EFFECT_TARGET_CONDITION_MAPPING = EFFECT_TARGET_CONDITION_MAPPING;
},{}],62:[function(require,module,exports){
let ENEMY_PATTERN_CONDITION_MAPPING = {};

ENEMY_PATTERN_CONDITION_MAPPING['SELF_HAS_LOWER_HP'] = function (battle, enemy, opts) {
  let r = (enemy.getAttribute('HP') / enemy.getAttribute('HP_MAX')) * 100;
  return r < opts.number;
}

ENEMY_PATTERN_CONDITION_MAPPING['ALLY_HAS_LOWER_HP'] = function (battle, enemy, opts) {
  for (let char of battle.getEnemies()) {
    let r = (char.getAttribute('HP') / char.getAttribute('HP_MAX')) * 100;
    if (char != enemy && r != 0 && r < opts.number) return true;
  }

  return false;
}

module.exports.ENEMY_PATTERN_CONDITION_MAPPING = ENEMY_PATTERN_CONDITION_MAPPING;
},{}],63:[function(require,module,exports){
let ENEMY_PATTERN_TARGET_SORT_MAPPING = {};

ENEMY_PATTERN_TARGET_SORT_MAPPING['LOWEST_HP'] = function (a, b) {
  return a.getAttribute('HP') - b.getAttribute('HP');
}

ENEMY_PATTERN_TARGET_SORT_MAPPING['HIGHEST_HP'] = function (a, b) {
  return b.getAttribute('HP') - a.getAttribute('HP');
}

module.exports.ENEMY_PATTERN_TARGET_SORT_MAPPING = ENEMY_PATTERN_TARGET_SORT_MAPPING;
},{}],64:[function(require,module,exports){
class Modifier {
  constructor(data) {
    this.type = '';
    this.attributeKey = '';
    this.value = 0;

    if (!data.hasOwnProperty('Type')) {
      return;
    }
    if (!(
      data['Type'] == 'MUL' ||
      data['Type'] == 'ADD' ||
      data['Type'] == 'SUB' ||
      data['Type'] == 'SET' ||
      data['Type'] == 'FIN')) {
      return;
    }
    if (!data.hasOwnProperty('AttributeKey')) {
      return;
    }
    if (!data.hasOwnProperty('Value')) {
      return;
    }

    this.type = data['Type'];
    this.attributeKey = data['AttributeKey'];
    this.value = data['Value'];
  }

  getType() {
    return this.type;
  }

  getAttributeKey() {
    return this.attributeKey;
  }

  getValue() {
    return this.value;
  }
}

module.exports.Modifier = Modifier;
},{}],65:[function(require,module,exports){
let { GWE } = require('gwe');
let { HeroCharacter } = require('./hero_character');
let { Inventory } = require('./inventory');

class Player {
  constructor() {
    this.gils = 0;
    this.inventory = null;
    this.heroes = [];
  }

  async loadFromData(data) {
    this.gils = data['Gils'];
    this.inventory = new Inventory();
    this.inventory.loadFromData(data['Inventory']);

    for (let obj of data['Heroes']) {
      let hero = new HeroCharacter();
      hero.loadFromData(obj);
      this.heroes.push(hero);
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getGils() {
    return this.gils;
  }

  increaseGils(amount) {
    this.gils += amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  decreaseGils(amount) {
    if (this.gils - amount < 0) {
      throw new Error('Player::decreaseGils(): gils cannot be negative !');
    }

    this.gils -= amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  getInventory() {
    return this.inventory;
  }

  getHeroes() {
    return this.heroes;
  }
}

module.exports.Player = Player;
},{"./hero_character":57,"./inventory":58,"gwe":23}],66:[function(require,module,exports){
let { Effect } = require('./effect');
let { Modifier } = require('./modifier');

class Seal {
  constructor() {
    this.id = '';
    this.name = '';
    this.description = '';
    this.iconFile = '';
    this.stackable = false;
    this.numTurns = 0;
    this.onTurnEffect = null;
    this.modifiers = [];
    this.turnCount = 0;
    this.fromChar = null;
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.iconFile = data['IconFile'];
    this.stackable = data['Stackable'];
    this.numTurns = data['NumTurns'];

    if (data['OnTurnEffect']) {
      this.onTurnEffect = new Effect();
      this.onTurnEffect.loadFromData(data['OnTurnEffect']);
    }

    for (let obj of data['Modifiers']) {
      this.modifiers.push(new Modifier(obj));
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getIconFile() {
    return this.iconFile;
  }

  getStackable() {
    return this.stackable;
  }

  getNumTurns() {
    return this.numTurns;
  }

  getModifiers() {
    return this.modifiers;
  }

  getTurnCount() {
    return this.turnCount;
  }

  incTurnCount() {
    this.turnCount++;
  }
  
  getFromChar() {
    return this.fromChar;
  }
}

module.exports.Seal = Seal;
},{"./effect":53,"./modifier":64}],67:[function(require,module,exports){
let { GWE } = require('gwe');
const { Player } = require('./core/player');

class Game extends GWE.Application {
  constructor(resolutionWidth, resolutionHeight, sizeMode) {
    super(resolutionWidth, resolutionHeight, sizeMode);
    this.player = null;
  }

  async loadFromFile(path) {
    this.player = new Player();
    await this.player.loadFromFile(path);
  }

  getPlayer() {
    return this.player;
  }
}

module.exports.gameManager = new Game(600, 600, GWE.SizeModeEnum.FIXED);
},{"./core/player":65,"gwe":23}],68:[function(require,module,exports){
let { GWE } = require('gwe');
let { GameScreen } = require('./game_screen');
let { MenuScreen } = require('./menu_screen');
let { ShopScreen, SHOP_SCREEN_MODE } = require('./shop_screen');

class BootScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.uiMenu = new GWE.UIMenu();
  }

  async onEnter() {
    this.uiMenu.addWidget(new GWE.UIMenuItemText({ text: 'Lancer le mode combat' }));
    this.uiMenu.addWidget(new GWE.UIMenuItemText({ text: 'Menu' }));
    this.uiMenu.addWidget(new GWE.UIMenuItemText({ text: 'Magasin' }));
    GWE.uiManager.addWidget(this.uiMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)');
    GWE.uiManager.focus(this.uiMenu);

    GWE.eventManager.subscribe(this.uiMenu, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiMenu);
  }

  handleMenuItemSelected(data) {
    if (data.index == 0) {
      GWE.screenManager.requestSetScreen(new GameScreen(this.app), { battleId: 'battle_0000' });
    }
    else if (data.index == 1) {
      GWE.screenManager.requestSetScreen(new MenuScreen(this.app));
    }
    else if (data.index == 2) {
      GWE.screenManager.requestSetScreen(new ShopScreen(this.app, SHOP_SCREEN_MODE.COMMON_STORE), { inventoryId: 'inventory_0000' });
    }
  }
}

module.exports.BootScreen = BootScreen;
},{"./game_screen":69,"./menu_screen":72,"./shop_screen":74,"gwe":23}],69:[function(require,module,exports){
let { GWE } = require('gwe');
let { HeroCharacter } = require('../core/hero_character');
let { Battle } = require('../core/battle');
let { LetBattleAction, ApplyEffectBattleAction, ApplyItemBattleAction } = require('../core/battle_actions');
let { CommonItem } = require('../core/common_item');
let { UIInventory } = require('../ui/ui_inventory');
let { UIEffects } = require('../ui/ui_effects');
let { UIBattleHeroes } = require('../ui/ui_battle_heroes');
let { UIBattleStatus } = require('../ui/ui_battle_status');
let { UIBattleArea } = require('../ui/ui_battle_area');
let { gameManager } = require('../game_manager');

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.player = gameManager.getPlayer();
    this.inventory = this.player.getInventory();
    this.battle = new Battle();
    this.uiTitle = new GWE.UIText();
    this.uiActionMenu = new GWE.UIMenu();
    this.uiEffects = new UIEffects();
    this.uiInventory = new UIInventory({ showPrice: false, showQuantity: true });
    this.uiHeroes = new UIBattleHeroes();
    this.uiStatus = new UIBattleStatus();
    this.uiArea = new UIBattleArea();
  }

  async onEnter(args) {
    await this.battle.loadFromFile('assets/models/' + args.battleId + '/data.json');

    this.uiTitle.setVisible(false);
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:0; right:0; height:50px; z-index:2;');

    this.uiActionMenu.addWidget(new GWE.UIMenuItemText({ text: 'Attaques' }));
    this.uiActionMenu.addWidget(new GWE.UIMenuItemText({ text: 'Magies' }));
    this.uiActionMenu.addWidget(new GWE.UIMenuItemText({ text: 'Objets' }));
    this.uiActionMenu.addWidget(new GWE.UIMenuItemText({ text: 'Passer' }));
    GWE.uiManager.addWidget(this.uiActionMenu, 'position:absolute; bottom:0; left:0; width:20%; height:150px; z-index:1;');

    this.uiEffects.setVisible(false);
    GWE.uiManager.addWidget(this.uiEffects, 'position:absolute; top:50px; bottom:150px; left:0; right:0; z-index:2;');

    this.uiInventory.setVisible(false);
    this.uiInventory.setFilterPredicate(item => item instanceof CommonItem);
    GWE.uiManager.addWidget(this.uiInventory, 'position:absolute; top:50px; bottom:150px; left:0; right:0; z-index:2;');

    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; bottom:0; left:20%; right:0; height:150px; z-index:1;');

    this.uiStatus.setBattle(this.battle);
    GWE.uiManager.addWidget(this.uiStatus, 'position:absolute; top:0; left:0; right:0; height:50px; z-index:1;');

    this.uiArea.setBattle (this.battle);
    GWE.uiManager.addWidget(this.uiArea, 'position:absolute; top:0; right:0; bottom:0; left:0;');

    GWE.eventManager.subscribe(this.battle, 'E_HERO_READY', this, this.handleBattleHeroReady);
    GWE.eventManager.subscribe(this.battle, 'E_WIN', this, this.handleBattleWin);
    GWE.eventManager.subscribe(this.battle, 'E_LOST', this, this.handleBattleLost);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_UNFOCUSED', this, this.handleHeroesUnfocused);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_MENU_ITEM_FOCUSED', this, this.handleHeroesItemFocused);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_MENU_ITEM_SELECTED', this, this.handleHeroesItemSelected);
    GWE.eventManager.subscribe(this.uiActionMenu, 'E_CLOSED', this, this.handleActionMenuClosed);
    GWE.eventManager.subscribe(this.uiActionMenu, 'E_MENU_ITEM_SELECTED', this, this.handleActionMenuItemSelected);
    GWE.eventManager.subscribe(this.uiEffects, 'E_CLOSED', this, this.handleEffectsClosed);
    GWE.eventManager.subscribe(this.uiEffects, 'E_MENU_ITEM_SELECTED', this, this.handleEffectsItemSelected);
    GWE.eventManager.subscribe(this.uiInventory, 'E_CLOSED', this, this.handleItemsMenuClosed);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_SELECTED', this, this.handleItemsMenuItemSelected);
    GWE.eventManager.subscribe(this.uiArea, 'E_CLOSED', this, this.handleAreaClosed);
    GWE.eventManager.subscribe(this.uiArea, 'E_ENTER_PRESSED', this, this.handleAreaEnterPressed);

    this.battle.startup();
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiActionMenu);
    GWE.uiManager.removeWidget(this.uiEffects);
    GWE.uiManager.removeWidget(this.uiInventory);
    GWE.uiManager.removeWidget(this.uiHeroes);
    GWE.uiManager.removeWidget(this.uiStatus);
    GWE.uiManager.removeWidget(this.uiArea);
  }

  handleBattleHeroReady(data) {
    GWE.uiManager.focus(this.uiHeroes);
  }

  handleBattleWin() {
    GWE.screenManager.requestPopScreen();
  }

  handleBattleLost() {
    GWE.screenManager.requestPopScreen();
  }

  handleHeroesUnfocused() {
    this.uiArea.unfocusFighter();
  }

  handleHeroesItemFocused(data) {
    let fighters = this.uiArea.getFighters();
    let heroes = this.battle.getHeroes();
    let index = fighters.findIndex(fighter => fighter.getCharacter() == heroes[data.index]);
    this.uiArea.focusFighter(index);
  }

  handleHeroesItemSelected() {
    GWE.uiManager.focus(this.uiActionMenu);
  }

  handleActionMenuClosed() {
    this.uiHeroes.unselectWidgets();
    GWE.uiManager.focus(this.uiHeroes);
  }

  handleActionMenuItemSelected(data) {
    let selectedHero = this.uiHeroes.getSelectedItem();
    if (data.index == 0) {
      this.uiTitle.setText('Attaques');
      this.uiEffects.setCollection(new GWE.ArrayCollection(selectedHero.getAttackEffects()));
      this.uiEffects.setEnablePredicate(effect => effect.isUsable(selectedHero));
      this.uiTitle.setVisible(true);
      this.uiEffects.setVisible(true);
      GWE.uiManager.focus(this.uiEffects);
    }
    else if (data.index == 1) {
      this.uiTitle.setText('Magies');
      this.uiEffects.setCollection(new GWE.ArrayCollection(selectedHero.getMagicEffects()));
      this.uiEffects.setEnablePredicate(effect => effect.isUsable(selectedHero));
      this.uiTitle.setVisible(true);
      this.uiEffects.setVisible(true);
      GWE.uiManager.focus(this.uiEffects);
    }
    else if (data.index == 2) {
      this.uiTitle.setText('Objets');
      this.uiInventory.setCollection(this.inventory);
      this.uiTitle.setVisible(true);
      this.uiInventory.setVisible(true);
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.index == 3) {
      this.battle.runAction(new LetBattleAction(this.battle, selectedHero));
      this.uiActionMenu.unselectWidgets();
      this.uiHeroes.unselectWidgets();
    }
  }

  handleEffectsClosed() {
    this.uiTitle.setVisible(false);
    this.uiEffects.setVisible(false);
    this.uiActionMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiActionMenu);
  }

  handleEffectsItemSelected() {
    let selectedHero = this.uiHeroes.getSelectedItem();
    let selectedEffect = this.uiEffects.getSelectedItem();
    this.uiArea.setFocusableFighterPredicate(fighter => selectedEffect.isTargetConditionCheck(selectedHero, fighter.getCharacter()));
    this.uiTitle.setVisible(false);
    this.uiEffects.setVisible(false);
    GWE.uiManager.focus(this.uiArea);
  }

  handleItemsMenuClosed() {
    this.uiTitle.setVisible(false);
    this.uiInventory.setVisible(false);
    this.uiActionMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiActionMenu);
  }

  handleItemsMenuItemSelected() {
    let selectedHero = this.uiHeroes.getSelectedItem();
    let selectedItem = this.uiInventory.getSelectedItem();
    this.uiTitle.setVisible(false);
    this.uiInventory.setVisible(false);
    this.uiArea.setFocusableFighterPredicate(fighter => selectedItem.isTarget(selectedHero, fighter.getCharacter()));
    GWE.uiManager.focus(this.uiArea);
  }

  handleAreaClosed() {
    let actionIndex = this.uiActionMenu.getSelectedWidgetIndex();
    if (actionIndex == 0 || actionIndex == 1) {
      this.uiTitle.setVisible(true);
      this.uiEffects.setVisible(true);
      this.uiEffects.unselectWidgets();
      GWE.uiManager.focus(this.uiEffects);
    }
    else if (actionIndex == 2) {
      this.uiTitle.setVisible(true);
      this.uiInventory.setVisible(true);
      this.uiInventory.unselectWidgets();
      GWE.uiManager.focus(this.uiInventory);
    }
  }

  handleAreaEnterPressed() {
    let actionIndex = this.uiActionMenu.getSelectedWidgetIndex();
    let selectedHero = this.uiHeroes.getSelectedItem();
    let selectedTarget = this.uiArea.getFocusedFighter().getCharacter();

    if (actionIndex == 0 || actionIndex == 1) {
      let selectedEffect = this.uiEffects.getSelectedItem();
      this.battle.runAction(new ApplyEffectBattleAction(this.battle, selectedEffect, selectedHero, selectedTarget));
    }
    else if (actionIndex == 2) {
      let selectedItem = this.uiInventory.getSelectedItem();
      this.battle.runAction(new ApplyItemBattleAction(this.battle, selectedItem, selectedHero, selectedTarget));
    }

    this.uiActionMenu.unselectWidgets();
    this.uiHeroes.unselectWidgets();
  }
}

module.exports.GameScreen = GameScreen;
},{"../core/battle":49,"../core/battle_actions":50,"../core/common_item":52,"../core/hero_character":57,"../game_manager":67,"../ui/ui_battle_area":75,"../ui/ui_battle_heroes":77,"../ui/ui_battle_status":78,"../ui/ui_effects":79,"../ui/ui_inventory":82,"gwe":23}],70:[function(require,module,exports){
let { GWE } = require('gwe');
let { EquipmentItem } = require('../core/equipment_item');
let { ITEM_TYPE } = require('../core/enums');
let { UIInventory } = require('../ui/ui_inventory');
let { UIHeroesEquipment } = require('../ui/ui_heroes_equipment');
let { gameManager } = require('../game_manager');

class MenuEquipmentsScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.player = gameManager.getPlayer();
    this.inventory = this.player.getInventory();
    this.uiTopMenu = new GWE.UIMenu({ axis: GWE.MenuAxisEnum.X });
    this.uiTitle = new GWE.UIText();
    this.uiDescription = new GWE.UIText();
    this.uiInventory = new UIInventory({ showPrice: false, showQuantity: true });
    this.uiHeroes = new UIHeroesEquipment();
    this.uiSortMenu = new GWE.UIMenu();
    this.uiFilterMenu = new GWE.UIMenu();
  }

  async onEnter() {
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Equiper' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Supprimer' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Trier' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Filtrer' }));
    GWE.uiManager.addWidget(this.uiTopMenu, 'position:absolute; top:0; left:0; width:70%; height:50px;');
    GWE.uiManager.focus(this.uiTopMenu);

    this.uiTitle.setText('Objets');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:70%; width:30%; height:50px;');

    this.uiDescription.setText('Description...');
    GWE.uiManager.addWidget(this.uiDescription, 'position:absolute; top:50px; left:0; width:100%; height:50px;');

    this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem);
    this.uiInventory.setCollection(this.player.getInventory());
    GWE.uiManager.addWidget(this.uiInventory, 'position:absolute; top:100px; left:0; bottom:0; width:40%;');

    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; top:100px; left:40%; bottom:0; width:60%;');

    this.uiSortMenu.setVisible(false);
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Aucun' }));
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Alphabétique' }));
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Quantité' }));
    GWE.uiManager.addWidget(this.uiSortMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);');

    this.uiFilterMenu.setVisible(false);
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Aucun' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Arme' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Haume' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Armure' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Relique' }));
    GWE.uiManager.addWidget(this.uiFilterMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);');

    GWE.eventManager.subscribe(this.uiTopMenu, 'E_CLOSED', this, this.handleTopMenuClosed);
    GWE.eventManager.subscribe(this.uiTopMenu, 'E_FOCUSED', this, this.handleTopMenuFocused);
    GWE.eventManager.subscribe(this.uiTopMenu, 'E_MENU_ITEM_SELECTED', this, this.handleTopMenuItemSelected);
    GWE.eventManager.subscribe(this.uiInventory, 'E_CLOSED', this, this.handleInventoryClosed);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_FOCUSED', this, this.handleInventoryItemFocused);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_SELECTED', this, this.handleInventoryItemSelected);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_CLOSED', this, this.handleHeroesClosed);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_MENU_ITEM_SELECTED', this, this.handleHeroesItemSelected);
    GWE.eventManager.subscribe(this.uiSortMenu, 'E_MENU_ITEM_SELECTED', this, this.handleSortMenuItemSelected);
    GWE.eventManager.subscribe(this.uiFilterMenu, 'E_MENU_ITEM_SELECTED', this, this.handleFilterMenuItemSelected);
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiTopMenu);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiDescription);
    GWE.uiManager.removeWidget(this.uiInventory);
    GWE.uiManager.removeWidget(this.uiHeroes);
    GWE.uiManager.removeWidget(this.uiSortMenu);
    GWE.uiManager.removeWidget(this.uiFilterMenu);
  }

  handleTopMenuClosed() {
    GWE.screenManager.requestPopScreen();
  }

  handleTopMenuFocused() {
    this.uiTopMenu.setEnabledWidget(0, this.uiInventory.views.length > 0);
    this.uiTopMenu.setEnabledWidget(1, this.uiInventory.views.length > 0);
    this.uiDescription.setText('Description...');

    for (let widget of this.uiHeroes.getWidgets()) {
      widget.setEquipmentItem(null);
      widget.setEnabled(true);
    }
  }

  handleTopMenuItemSelected(data) {
    if (data.index == 0) {
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.index == 1) {
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.index == 2) {
      this.uiSortMenu.setVisible(true);
      GWE.uiManager.focus(this.uiSortMenu);
    }
    else if (data.index == 3) {
      this.uiFilterMenu.setVisible(true);
      GWE.uiManager.focus(this.uiFilterMenu);
    }
  }

  handleInventoryClosed() {
    this.uiInventory.unselectWidgets();
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleInventoryItemFocused(data) {
    let item = this.uiInventory.getFocusedItem();
    this.uiDescription.setText(item.description);

    for (let widget of this.uiHeroes.getWidgets()) {
      let hero = widget.getHero();
      widget.setEquipmentItem(item);
      widget.setEnabled(hero.isEquipableItem(item));
    }
  }

  handleInventoryItemSelected(data) {
    let index = this.uiTopMenu.getSelectedWidgetIndex();
    if (index == 0) {
      GWE.uiManager.focus(this.uiHeroes);
    }
    else if (index == 1) {
      let selectedItem = this.uiInventory.getSelectedItem();
      this.inventory.removeItemById(selectedItem.getId());
      this.uiInventory.unselectWidgets();
      this.uiTopMenu.unselectWidgets();
      GWE.uiManager.focus(this.uiTopMenu);
    }
  }

  handleHeroesClosed() {
    this.uiHeroes.unselectWidgets();
    this.uiInventory.unselectWidgets();
    GWE.uiManager.focus(this.uiInventory);
  }

  handleHeroesItemSelected() {
    let selectedItem = this.uiInventory.getSelectedItem();
    let selectedHero = this.uiHeroes.getSelectedItem();

    let oldItem = selectedHero.setEquipment(selectedItem);
    if (oldItem) {
      this.inventory.addItem(oldItem);
    }

    this.inventory.removeItemById(selectedItem.getId());
    this.uiHeroes.unselectWidgets();
    this.uiInventory.unselectWidgets();
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleSortMenuItemSelected(data) {
    if (data.index == 0) {
      this.uiInventory.setSortPredicate(() => true);
    }
    else if (data.index == 1) {
      this.uiInventory.setSortPredicate((a, b) => a.getName().localeCompare(b.getName()));
    }
    else if (data.index == 2) {
      this.uiInventory.setSortPredicate((a, b) => a.getQuantity() - b.getQuantity());
    }

    this.uiSortMenu.setVisible(false);
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleFilterMenuItemSelected(data) {
    if (data.index == 0) {
      this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem);
    }
    else if (data.index == 1) {
      this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem && item.getType() == ITEM_TYPE.WEAPON);
    }
    else if (data.index == 2) {
      this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem && item.getType() == ITEM_TYPE.HELMET);
    }
    else if (data.index == 3) {
      this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem && item.getType() == ITEM_TYPE.ARMOR);
    }
    else if (data.index == 4) {
      this.uiInventory.setFilterPredicate(item => item instanceof EquipmentItem && item.getType() == ITEM_TYPE.RELIC);
    }

    this.uiFilterMenu.setVisible(false);
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }
}

module.exports.MenuEquipmentsScreen = MenuEquipmentsScreen;
},{"../core/enums":55,"../core/equipment_item":56,"../game_manager":67,"../ui/ui_heroes_equipment":81,"../ui/ui_inventory":82,"gwe":23}],71:[function(require,module,exports){
let { GWE } = require('gwe');
let { CommonItem } = require('../core/common_item');
let { ITEM_TYPE } = require('../core/enums');
let { UIInventory } = require('../ui/ui_inventory');
let { UIHeroes } = require('../ui/ui_heroes');
let { gameManager } = require('../game_manager');

class MenuItemsScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.player = gameManager.getPlayer();
    this.inventory = this.player.getInventory();
    this.uiTopMenu = new GWE.UIMenu({ axis: GWE.MenuAxisEnum.X });
    this.uiTitle = new GWE.UIText();
    this.uiDescription = new GWE.UIText();
    this.uiInventory = new UIInventory({ showPrice: false, showQuantity: true });
    this.uiHeroes = new UIHeroes();
    this.uiSortMenu = new GWE.UIMenu();
    this.uiFilterMenu = new GWE.UIMenu();
  }

  async onEnter() {
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Utiliser' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Supprimer' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Trier' }));
    this.uiTopMenu.addWidget(new GWE.UIMenuItemText({ text: 'Filtrer' }));
    GWE.uiManager.addWidget(this.uiTopMenu, 'position:absolute; top:0; left:0; width:70%; height:50px;');
    GWE.uiManager.focus(this.uiTopMenu);

    this.uiTitle.setText('Objets');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:70%; width:30%; height:50px;');

    this.uiDescription.setText('Description...');
    GWE.uiManager.addWidget(this.uiDescription, 'position:absolute; top:50px; left:0; width:100%; height:50px;');

    this.uiInventory.setFilterPredicate(item => item instanceof CommonItem);
    this.uiInventory.setCollection(this.inventory);
    GWE.uiManager.addWidget(this.uiInventory, 'position:absolute; top:100px; left:0; bottom:0; width:40%;');

    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; top:100px; left:40%; bottom:0; width:60%;');

    this.uiSortMenu.setVisible(false);
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Aucun' }));
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Alphabétique' }));
    this.uiSortMenu.addWidget(new GWE.UIMenuItemText({ text: 'Quantité' }));
    GWE.uiManager.addWidget(this.uiSortMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);');

    this.uiFilterMenu.setVisible(false);
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Aucun' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Potion' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Nourriture' }));
    this.uiFilterMenu.addWidget(new GWE.UIMenuItemText({ text: 'Autre' }));
    GWE.uiManager.addWidget(this.uiFilterMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);');

    GWE.eventManager.subscribe(this.uiTopMenu, 'E_CLOSED', this, this.handleTopMenuClosed);
    GWE.eventManager.subscribe(this.uiTopMenu, 'E_FOCUSED', this, this.handleTopMenuFocused);
    GWE.eventManager.subscribe(this.uiTopMenu, 'E_MENU_ITEM_SELECTED', this, this.handleTopMenuItemSelected);
    GWE.eventManager.subscribe(this.uiInventory, 'E_CLOSED', this, this.handleInventoryClosed);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_FOCUSED', this, this.handleInventoryItemFocused);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_SELECTED', this, this.handleInventoryItemSelected);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_CLOSED', this, this.handleHeroesClosed);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_MENU_ITEM_SELECTED', this, this.handleHeroesItemSelected);
    GWE.eventManager.subscribe(this.uiSortMenu, 'E_MENU_ITEM_SELECTED', this, this.handleSortMenuItemSelected);
    GWE.eventManager.subscribe(this.uiFilterMenu, 'E_MENU_ITEM_SELECTED', this, this.handleFilterMenuItemSelected);
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiTopMenu);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiDescription);
    GWE.uiManager.removeWidget(this.uiInventory);
    GWE.uiManager.removeWidget(this.uiHeroes);
    GWE.uiManager.removeWidget(this.uiSortMenu);
    GWE.uiManager.removeWidget(this.uiFilterMenu);
  }

  handleTopMenuClosed() {
    GWE.screenManager.requestPopScreen();
  }

  handleTopMenuFocused() {
    let usableItems = this.uiInventory.views.filter(item => item.hasEffect() && item.getEffect().isMenuAvailable());
    let items = this.uiInventory.views;
    
    this.uiTopMenu.setEnabledWidget(0, usableItems.length > 0);
    this.uiTopMenu.setEnabledWidget(1, items.length > 0);
    this.uiDescription.setText('Description...');

    for (let widget of this.uiHeroes.getWidgets()) {
      widget.setEnabled(true);
    }
  }

  handleTopMenuItemSelected(data) {
    if (data.index == 0) {
      this.uiInventory.setEnablePredicate(item => item.hasEffect() && item.getEffect().isMenuAvailable());
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.index == 1) {
      this.uiInventory.setEnablePredicate(item => true);
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.index == 2) {
      this.uiSortMenu.setVisible(true);
      GWE.uiManager.focus(this.uiSortMenu);
    }
    else if (data.index == 3) {
      this.uiFilterMenu.setVisible(true);
      GWE.uiManager.focus(this.uiFilterMenu);
    }
  }

  handleInventoryClosed() {
    this.uiInventory.unselectWidgets();
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleInventoryItemFocused(data) {
    let item = this.uiInventory.getFocusedItem();
    this.uiDescription.setText(item.description);

    for (let widget of this.uiHeroes.getWidgets()) {
      let hero = widget.getHero();
      widget.setEnabled(item.isTarget(hero, hero));
    }
  }

  handleInventoryItemSelected(data) {
    let index = this.uiTopMenu.getSelectedWidgetIndex();
    if (index == 0) {
      GWE.uiManager.focus(this.uiHeroes);
    }
    else if (index == 1) {
      let selectedItem = this.uiInventory.getSelectedItem();
      this.inventory.removeItemById(selectedItem.getId());
      this.uiInventory.unselectWidgets();
      this.uiTopMenu.unselectWidgets();
      GWE.uiManager.focus(this.uiTopMenu);
    }
  }

  handleHeroesClosed() {
    this.uiHeroes.unselectWidgets();
    this.uiInventory.unselectWidgets();
    GWE.uiManager.focus(this.uiInventory);
  }

  handleHeroesItemSelected() {
    let selectedItem = this.uiInventory.getSelectedItem();
    let selectedHero = this.uiHeroes.getSelectedItem();
    let effect = selectedItem.getEffect();

    effect.apply(selectedHero, selectedHero);
    this.inventory.removeItemById(selectedItem.getId());

    this.uiHeroes.unselectWidgets();
    this.uiInventory.unselectWidgets();
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleSortMenuItemSelected(data) {
    if (data.index == 0) {
      this.uiInventory.setSortPredicate(() => true);
    }
    else if (data.index == 1) {
      this.uiInventory.setSortPredicate((a, b) => a.getName().localeCompare(b.getName()));
    }
    else if (data.index == 2) {
      this.uiInventory.setSortPredicate((a, b) => a.getQuantity() - b.getQuantity());
    }

    this.uiSortMenu.setVisible(false);
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }

  handleFilterMenuItemSelected(data) {
    if (data.index == 0) {
      this.uiInventory.setFilterPredicate(item => item instanceof CommonItem);
    }
    else if (data.index == 1) {
      this.uiInventory.setFilterPredicate(item => item instanceof CommonItem && item.getType() == ITEM_TYPE.POTION);
    }
    else if (data.index == 2) {
      this.uiInventory.setFilterPredicate(item => item instanceof CommonItem && item.getType() == ITEM_TYPE.FOOD);
    }
    else if (data.index == 3) {
      this.uiInventory.setFilterPredicate(item => item instanceof CommonItem && item.getType() == ITEM_TYPE.OTHER);
    }

    this.uiFilterMenu.setVisible(false);
    this.uiTopMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiTopMenu);
  }
}

module.exports.MenuItemsScreen = MenuItemsScreen;
},{"../core/common_item":52,"../core/enums":55,"../game_manager":67,"../ui/ui_heroes":80,"../ui/ui_inventory":82,"gwe":23}],72:[function(require,module,exports){
let { GWE } = require('gwe');
let { MenuEquipmentsScreen } = require('./menu_equipments_screen');
let { MenuItemsScreen } = require('./menu_items_screen');
let { MenuStatusScreen } = require('./menu_status_screen');
let { UIHeroes } = require('../ui/ui_heroes');
let { gameManager } = require('../game_manager');

class MenuScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.player = gameManager.getPlayer();
    this.uiTitle = new GWE.UIText();
    this.uiMainMenu = new GWE.UIMenu();
    this.uiHeroes = new UIHeroes();
  }

  async onEnter() {
    this.uiTitle.setText('Menu');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:0; right:0; height:50px');

    this.uiMainMenu.addWidget(new GWE.UIMenuItemText({ text: 'Objets' }));
    this.uiMainMenu.addWidget(new GWE.UIMenuItemText({ text: 'Equipements' }));
    this.uiMainMenu.addWidget(new GWE.UIMenuItemText({ text: 'Status' }));
    GWE.uiManager.addWidget(this.uiMainMenu, 'position:absolute; top:50px; left:0; bottom:0; width:40%');
    GWE.uiManager.focus(this.uiMainMenu);

    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; top:50px; left:40%; bottom:0; width:60%');

    GWE.eventManager.subscribe(this.uiMainMenu, 'E_CLOSED', this, this.handleMainMenuClosed);
    GWE.eventManager.subscribe(this.uiMainMenu, 'E_MENU_ITEM_SELECTED', this, this.handleMainMenuItemSelected);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_CLOSED', this, this.handleHeroesClosed);
    GWE.eventManager.subscribe(this.uiHeroes, 'E_MENU_ITEM_SELECTED', this, this.handleHeroesItemSelected);
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiMainMenu);
    GWE.uiManager.removeWidget(this.uiHeroes);
  }

  onBringToFront(oldTopScreen) {
    GWE.uiManager.focus(oldTopScreen instanceof MenuStatusScreen ? this.uiHeroes : this.uiMainMenu);
  }

  onBringToBack() {
    this.uiMainMenu.unselectWidgets();
    this.uiHeroes.unselectWidgets();
  }

  handleMainMenuClosed() {
    GWE.screenManager.requestPopScreen();
  }

  handleMainMenuItemSelected(data) {
    if (data.index == 0) {
      GWE.screenManager.requestPushScreen(new MenuItemsScreen(this.app));
    }
    else if (data.index == 1) {
      GWE.screenManager.requestPushScreen(new MenuEquipmentsScreen(this.app));
    }
    else if (data.index == 2) {
      GWE.uiManager.focus(this.uiHeroes);
    }
  }

  handleHeroesClosed() {
    this.uiMainMenu.unselectWidgets();
    GWE.uiManager.focus(this.uiMainMenu);
  }

  handleHeroesItemSelected(data) {
    let hero = this.uiHeroes.getSelectedItem();
    GWE.screenManager.requestPushScreen(new MenuStatusScreen(this.app, hero));
  }
}

module.exports.MenuScreen = MenuScreen;
},{"../game_manager":67,"../ui/ui_heroes":80,"./menu_equipments_screen":70,"./menu_items_screen":71,"./menu_status_screen":73,"gwe":23}],73:[function(require,module,exports){
let { GWE } = require('gwe');
let { UIStatus } = require('../ui/ui_status');

class MenuStatusScreen extends GWE.Screen {
  constructor(app, hero) {
    super(app);
    this.hero = hero;
    this.uiTitle = new GWE.UIText();
    this.uiStatus = new UIStatus();
    this.handleKeyDownCb = (e) => this.handleKeyDown(e);
  }

  async onEnter() {
    this.uiTitle.setText('Status');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:0; width:100%; height:50px');

    this.uiStatus.setHero(this.hero);
    GWE.uiManager.addWidget(this.uiStatus, 'position:absolute; top:50px; left:0; bottom:0; width:100%');

    document.addEventListener('keydown', this.handleKeyDownCb);
  }

  onExit() {
    document.removeEventListener('keydown', this.handleKeyDownCb);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiStatus);
  }

  handleKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.screenManager.requestPopScreen();
    }
  }
}

module.exports.MenuStatusScreen = MenuStatusScreen;
},{"../ui/ui_status":83,"gwe":23}],74:[function(require,module,exports){
let { GWE } = require('gwe');
let { Inventory } = require('../core/inventory');
let { UIInventory } = require('../ui/ui_inventory');
let { UIHeroes } = require('../ui/ui_heroes');
let { UIHeroesEquipment } = require('../ui/ui_heroes_equipment');
let { gameManager } = require('../game_manager');

let SHOP_SCREEN_MODE = {
  COMMON_STORE: 'COMMON_STORE',
  EQUIPMENT_STORE: 'EQUIPMENT_STORE'
};

let CHECKOUT_DESC = {
  QUANTITY: 0,
  TOTAL: 1
};

let PLAYER_DESC = {
  GILS: 0,
  INVENTORY: 1
};

class ShopScreen extends GWE.Screen {
  constructor(app, mode) {
    super(app);
    this.mode = mode;
    this.player = gameManager.getPlayer();
    this.inventory = this.player.getInventory();
    this.shopInventory = new Inventory();

    this.uiText = new GWE.UIText();
    this.uiTitle = new GWE.UIText();
    this.uiDescription = new GWE.UIText();
    this.uiInventory = new UIInventory({ showPrice: true, showQuantity: false });
    this.uiPlayerDesc = new GWE.UIDescriptionList();
    this.uiCheckoutDesc = new GWE.UIDescriptionList();
    this.uiHeroes = (this.mode == SHOP_SCREEN_MODE.COMMON_STORE) ? new UIHeroes() : new UIHeroesEquipment();
    this.handleKeyDownCb = (e) => this.handleKeyDown(e);
  }

  async onEnter(args) {
    await this.shopInventory.loadFromFile('assets/models/' + args.inventoryId + '/data.json');

    this.uiText.setText('Que voulez-vous acheter ?');
    GWE.uiManager.addWidget(this.uiText, 'position:absolute; top:0px; left:0; width:70%; height:50px;');

    this.uiTitle.setText('Magasin');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:70%; width:30%; height:50px;');

    this.uiDescription.setText('Description...');
    GWE.uiManager.addWidget(this.uiDescription, 'position:absolute; top:50px; left:0; width:100%; height:50px;');

    this.uiInventory.setCollection(this.shopInventory);
    GWE.uiManager.addWidget(this.uiInventory, 'position:absolute; top:100px; left:0; bottom:0; width:50%;');

    this.uiPlayerDesc.addItem(PLAYER_DESC.GILS, 'Gils', this.player.getGils());
    this.uiPlayerDesc.addItem(PLAYER_DESC.INVENTORY, 'Inventaire', 0);
    GWE.uiManager.addWidget(this.uiPlayerDesc, 'position:absolute; top:100px; left:50%; width:50%; height:84px');

    this.uiCheckoutDesc.setVisible(false);
    this.uiCheckoutDesc.addItem(CHECKOUT_DESC.QUANTITY, 'Quantite', 0);
    this.uiCheckoutDesc.addItem(CHECKOUT_DESC.TOTAL, 'Total', 0);
    GWE.uiManager.addWidget(this.uiCheckoutDesc, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10;');

    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; top:184px; left:50%; bottom:0; width:50%;');

    GWE.eventManager.subscribe(this.player, 'E_GILS_CHANGED', this, this.handlePlayerGilsChanged);
    GWE.eventManager.subscribe(this.uiInventory, 'E_CLOSED', this, this.handleInventoryClosed);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_FOCUSED', this, this.handleInventoryItemFocused);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_SELECTED', this, this.handleInventoryItemSelected);
    document.addEventListener('keydown', this.handleKeyDownCb);

    GWE.uiManager.focus(this.uiInventory);
  }

  async onExit() {
    document.removeEventListener('keydown', this.handleKeyDownCb);
    GWE.uiManager.removeWidget(this.uiText);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiDescription);
    GWE.uiManager.removeWidget(this.uiInventory);
    GWE.uiManager.removeWidget(this.uiPlayerDesc);
    GWE.uiManager.removeWidget(this.uiCheckoutDesc);
    GWE.uiManager.removeWidget(this.uiHeroes);
  }

  handlePlayerGilsChanged() {
    this.uiPlayerDesc.setItem(PLAYER_DESC.GILS, this.player.getGils());
  }

  handleInventoryClosed() {
    GWE.screenManager.requestPopScreen();
  }

  handleInventoryItemFocused(data) {
    let shopItem = this.uiInventory.getFocusedItem();
    let playerItems = this.inventory.getItems();
    let playerItem = playerItems.find(i => i.getId() == shopItem.getId());

    this.uiDescription.setText(shopItem.description);
    this.uiPlayerDesc.setItem(PLAYER_DESC.INVENTORY, playerItem ? playerItem.quantity : '0');

    if (this.mode == SHOP_SCREEN_MODE.COMMON_STORE) {
      for (let widget of this.uiHeroes.getWidgets()) {
        let hero = widget.getHero();
        widget.setEnabled(shopItem.isTarget(hero, hero));
      }
    }
    else {
      for (let widget of this.uiHeroes.getWidgets()) {
        let hero = widget.getHero();
        widget.setEquipmentItem(shopItem);
        widget.setEnabled(hero.isEquipableItem(shopItem));
      }
    }
  }

  handleInventoryItemSelected() {
    this.uiCheckoutDesc.setVisible(true);
    GWE.uiManager.focus(this.uiCheckoutDesc);
  }

  handleKeyDown(e) {
    if (!this.uiCheckoutDesc.isVisible()) {
      return;
    }

    let selectedItem = this.uiInventory.getSelectedItem();
    let quantity = parseInt(this.uiCheckoutDesc.getItemValue(CHECKOUT_DESC.QUANTITY));

    if (e.key == 'ArrowUp') {
      let newQuantity = quantity + 1;
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, newQuantity);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, newQuantity * selectedItem.getPrice());
    }
    else if (e.key == 'ArrowDown' && quantity > 0) {
      let newQuantity = quantity - 1;
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, newQuantity);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, newQuantity * selectedItem.getPrice());
    }
    else if (e.key == 'Enter') {
      let totalPrice = quantity * selectedItem.getPrice();
      if (this.player.getGils() - totalPrice < 0) {
        return
      }

      selectedItem.setQuantity(quantity);
      this.player.decreaseGils(totalPrice);
      this.inventory.addItem(selectedItem);

      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, 0);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, 0);
      this.uiCheckoutDesc.setVisible(false);
      this.uiInventory.unselectWidgets();
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (e.key == 'Escape') {
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, 0);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, 0);
      this.uiCheckoutDesc.setVisible(false);
      this.uiInventory.unselectWidgets();
      GWE.uiManager.focus(this.uiInventory);
    }
  }
}

module.exports.SHOP_SCREEN_MODE = SHOP_SCREEN_MODE;
module.exports.ShopScreen = ShopScreen;
},{"../core/inventory":58,"../game_manager":67,"../ui/ui_heroes":80,"../ui/ui_heroes_equipment":81,"../ui/ui_inventory":82,"gwe":23}],75:[function(require,module,exports){
let { GWE } = require('gwe');
let { UIBattleAreaFighter } = require('./ui_battle_area_fighter');

class UIBattleArea extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleArea',
      template: `
      <div class="UIBattleArea-bg js-bg"></div>
      <div class="UIBattleArea-fighters js-fighters"></div>`
    });

    this.battle = null;
    this.fighters = [];
    this.focusableFighterPredicate = () => true;
    this.focusedFighter = null;
  }

  update(ts) {
    this.node.querySelector('.js-bg').style.backgroundImage = 'url(' + this.battle.getBackgroundImage() + ')';
    for (let fighter of this.fighters) {
      fighter.update(ts);
    }
  }

  delete() {
    for (let fighter of this.fighters) fighter.delete();
    super.delete();
  }

  setBattle(battle) {
    for (let fighter of this.fighters) {
      fighter.delete();
    }

    if (battle) {
      for (let hero of battle.getHeroes()) {
        let fighter = CREATE_HERO_FIGHTER(hero);
        this.node.querySelector('.js-fighters').appendChild(fighter.node);
        this.fighters.push(fighter);
      }

      for (let enemy of battle.getEnemies()) {
        let fighter = CREATE_ENEMY_FIGHTER(enemy, enemy.getPosition());
        this.node.querySelector('.js-fighters').appendChild(fighter.node);
        this.fighters.push(fighter);
      }

      this.battle = battle;
    }
    else {
      this.battle = null;
    }
  }

  getFighters() {
    return this.fighters;
  }

  getFocusedFighter() {
    return this.focusedFighter;
  }

  setFocusableFighterPredicate(focusableFighterPredicate) {
    for (let i = 0; i < this.fighters.length; i++) {
      let fighter =  this.fighters[i];
      if (focusableFighterPredicate(fighter)) {
        this.focusFighter(i, true);
        break;
      }
    }

    this.focusableFighterPredicate = focusableFighterPredicate;
  }

  focusFighter(index, emit = false) {
    let fighter = this.fighters[index];
    if (!fighter) {
      throw new Error('UIBattleArea::focusFighter(): fighter not found !');
    }

    this.unfocusFighter();
    fighter.focus();
    this.focusedFighter = fighter;

    if (emit) {
      GWE.eventManager.emit(this, 'E_FIGHTER_FOCUSED', { fighter: fighter, index: index });
    }
  }

  unfocusFighter(emit = false) {
    if (!this.focusedFighter) {
      return;
    }

    this.focusedFighter.unfocus();
    this.focusedFighter = null;

    if (emit) {
      GWE.eventManager.emit(this, 'E_FIGHTER_UNFOCUSED');
    }
  }

  prevFocus() {
    let focusIndex = this.fighters.indexOf(this.focusedFighter);
    let i = 0;

    while (i < this.fighters.length) {
      focusIndex = focusIndex - 1 < 0 ? this.fighters.length - 1 : focusIndex - 1;
      if (this.focusableFighterPredicate(this.fighters[focusIndex])) {
        this.focusFighter(focusIndex, true);
        break;
      }

      i++;
    }
  }

  nextFocus() {
    let focusIndex = this.fighters.indexOf(this.focusedFighter);
    let i = 0;

    while (i < this.fighters.length) {
      focusIndex = focusIndex + 1 > this.fighters.length - 1 ? 0 : focusIndex + 1;
      if (this.focusableFighterPredicate(this.fighters[focusIndex])) {
        this.focusFighter(focusIndex, true);
        break;
      }

      i++;
    }
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.eventManager.emit(this, 'E_CLOSED');
    }
    else if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'ArrowLeft') {
      this.prevFocus();
    }
    else if (e.key == 'ArrowRight') {
      this.nextFocus();
    }
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CREATE_HERO_FIGHTER(hero) {
  let fighter = new UIBattleAreaFighter();
  fighter.setVisible(false);
  fighter.setCharacter(hero);
  fighter.node.style.position = 'absolute';
  fighter.node.style.right = '10px';
  fighter.node.style.bottom = '150px';
  fighter.node.style.zIndex = '1';
  return fighter;
}

function CREATE_ENEMY_FIGHTER(enemy, position) {
  let fighter = new UIBattleAreaFighter();
  fighter.setVisible(true);
  fighter.setCharacter(enemy);
  fighter.node.style.position = 'absolute';
  fighter.node.style.left = position[0] + 'px';
  fighter.node.style.top = position[1] + 'px';
  fighter.node.style.zIndex = position[2];
  return fighter;
}

module.exports.UIBattleArea = UIBattleArea;
},{"./ui_battle_area_fighter":76,"gwe":23}],76:[function(require,module,exports){
let { GWE } = require('gwe');
let { HeroCharacter } = require('../core/hero_character');

class UIBattleAreaFighter extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleAreaFighter',
      template: `
      <div class="UIBattleAreaFighter-header">
        <div class="UIBattleAreaFighter-header-name js-name"></div>
        <div class="UIBattleAreaFighter-header-lifebar">
          <div class="UIBattleAreaFighter-header-lifebar-progress js-lifebar"></div>
        </div>
        <div class="UIBattleAreaFighter-header-seals js-seals"></div>
      </div>
      <div class="UIBattleAreaFighter-body">
        <div class="UIBattleAreaFighter-body-effectSprite js-effect-sprite"></div>
        <div class="UIBattleAreaFighter-body-characterSprite js-character-sprite"></div>
      </div>`
    });

    this.character = null;
    this.uiEffectSprite = new GWE.UISprite({ className: 'UISprite UIBattleAreaFighter-body-effectSprite' });
    this.uiCharacterSprite = new GWE.UISprite({ className: 'UISprite UIBattleAreaFighter-body-characterSprite' });
    
    this.node.querySelector('.js-effect-sprite').replaceWith(this.uiEffectSprite.node);
    this.node.querySelector('.js-character-sprite').replaceWith(this.uiCharacterSprite.node);
    this.uiEffectSprite.loadFromFileSync('assets/sprites/effects/data.json');
  }

  update(ts) {
    if (this.character) {
      this.node.querySelector('.js-name').textContent = this.character.getName();
      this.node.querySelector('.js-lifebar').style.width = parseInt(this.character.getAttribute('HP') / this.character.getAttribute('HP_MAX') * 100) + '%';
      this.node.querySelector('.js-seals').innerHTML = '';
      for (let seal of this.character.getActiveSeals()) {
        this.node.querySelector('.js-seals').innerHTML += `<img class="UIBattleAreaFighter-header-seals-item" src="${seal.iconFile}">`;
      }
    }
    else {
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-lifebar').style.width = '0%';
      this.node.querySelector('.js-seals').innerHTML = '';
    }

    this.uiEffectSprite.update(ts);
    this.uiCharacterSprite.update(ts);
  }

  getCharacter() {
    return this.character;
  }

  setCharacter(character) {
    GWE.eventManager.unsubscribe(this.character, 'E_EFFECT_INFLICT', this);
    GWE.eventManager.unsubscribe(this.character, 'E_INCREASE_HP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_DECREASE_HP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_INCREASE_MP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_DECREASE_MP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_ADD_FAILED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_ADDED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_REMOVE_FAILED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_REMOVED', this);

    if (character) {
      GWE.eventManager.subscribe(character, 'E_EFFECT_INFLICT', this, this.handleEffectInflict);
      GWE.eventManager.subscribe(character, 'E_INCREASE_HP', this, this.handleCharacterIncreaseHP);
      GWE.eventManager.subscribe(character, 'E_DECREASE_HP', this, this.handleCharacterDecreaseHP);
      GWE.eventManager.subscribe(character, 'E_INCREASE_MP', this, this.handleCharacterIncreaseMP);
      GWE.eventManager.subscribe(character, 'E_DECREASE_MP', this, this.handleCharacterDecreaseMP);
      GWE.eventManager.subscribe(character, 'E_SEAL_ADD_FAILED', this, this.handleCharacterSealAddFailed);
      GWE.eventManager.subscribe(character, 'E_SEAL_ADDED', this, this.handleCharacterSealAdded);
      GWE.eventManager.subscribe(character, 'E_SEAL_REMOVE_FAILED', this, this.handleCharacterSealRemoveFailed);
      GWE.eventManager.subscribe(character, 'E_SEAL_REMOVED', this, this.handleCharacterSealRemoved);
      this.uiCharacterSprite.loadFromFileSync(character.getSpriteFile());
      this.uiCharacterSprite.play('IDLE', true);
      this.character = character;
    }
    else {
      this.character = null;
    }
  }

  isActive() {
    return this.node.classList.contains('u-active');
  }

  setActive(active) {
    this.node.classList.toggle('u-active', active);
  }

  async handleEffectInflict(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }
  
    this.uiEffectSprite.setVisible(true);
    this.uiEffectSprite.play(data.effect.getSpriteAnimationName());
    await GWE.eventManager.wait(this.uiEffectSprite, 'E_FINISHED');
    this.uiEffectSprite.setVisible(false);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterIncreaseHP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, data.amount, '#5ef500', 300);

    if (this.character.getAttribute('HP') > 0) {
      this.uiCharacterSprite.play('IDLE', true);
    }

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterDecreaseHP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await SHAKE(this.node, 300);
    await DRAW_TOAST(this.node, data.amount, '#f50000', 300);
    
    if (this.character.getAttribute('HP') <= 0) {
      this.uiCharacterSprite.play('DEATH');
      await GWE.eventManager.wait(this.uiCharacterSprite, 'E_FINISHED');
    }

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterIncreaseMP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'MP + ' + data.amount, '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterDecreaseMP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'MP - ' + data.amount, '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealAddFailed(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal add failed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealAdded(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal added !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealRemoveFailed(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal remove failed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealRemoved(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal removed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function SHAKE(node, ms) {
  return new Promise(resolve => {
    setTimeout(() => { node.classList.add('u-shake') }, 0);
    setTimeout(() => { node.classList.remove('u-shake'); resolve(); }, ms);
  });
}

function DRAW_TOAST(node, text, color, ms) {
  return new Promise(resolve => {
    let toast = document.createElement('div');
    toast.className = 'UIBattleAreaFighter-body-toast';
    toast.textContent = text;
    toast.style.color = color;
    node.querySelector('.UIBattleAreaFighter-body').appendChild(toast);
    setTimeout(() => { toast.remove(); resolve(); }, ms);
  });
}

module.exports.UIBattleAreaFighter = UIBattleAreaFighter;
},{"../core/hero_character":57,"gwe":23}],77:[function(require,module,exports){
let { GWE } = require('gwe');

class UIBattleHeroes extends GWE.UIListView {
  constructor() {
    super({
      axis: GWE.MenuAxisEnum.X
    });
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIBattleHeroesItem();
    widget.setHero(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIBattleHeroesItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleHeroesItem',
      template: `
      <div class="UIBattleHeroesItem-body">
        <div class="UIBattleHeroesItem-body-name js-name"></div>
        <div class="UIBattleHeroesItem-body-stats">
          <div class="UIBattleHeroesItem-body-stats-item">
            <span class="UIBattleHeroesItem-body-stats-item-name">HP</span>
            <span class="UIBattleHeroesItem-body-stats-item-bar">
              <span class="UIBattleHeroesItem-body-stats-item-bar-value js-hp-value"></span>
              <span class="UIBattleHeroesItem-body-stats-item-bar-progress js-hp-bar"></span>
            </span>
          </div>
          <div class="UIBattleHeroesItem-body-stats-item">
            <span class="UIBattleHeroesItem-body-stats-item-name">MP</span>
            <span class="UIBattleHeroesItem-body-stats-item-bar">
              <span class="UIBattleHeroesItem-body-stats-item-bar-value js-mp-value"></span>
              <span class="UIBattleHeroesItem-body-stats-item-bar-progress js-mp-bar"></span>
            </span>
          </div>
        </div>
      </div>`
    });

    this.hero = null;
  }

  update(ts) {
    if (this.hero) {
      this.setEnabled(this.hero.isReady());
      this.node.querySelector('.js-name').textContent = this.hero.getName();
      this.node.querySelector('.js-hp-value').textContent = this.hero.getAttribute('HP') + '/' + this.hero.getAttribute('HP_MAX');
      this.node.querySelector('.js-hp-bar').style.width = parseInt(this.hero.getAttribute('HP') / this.hero.getAttribute('HP_MAX') * 100) + '%';
      this.node.querySelector('.js-mp-value').textContent = this.hero.getAttribute('MP') + '/' + this.hero.getAttribute('MP_MAX');
      this.node.querySelector('.js-mp-bar').style.width = parseInt(this.hero.getAttribute('MP') / this.hero.getAttribute('MP_MAX') * 100) + '%';
    }
    else {
      this.disable();
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-hp-value').textContent = '--/--';
      this.node.querySelector('.js-hp-bar').style.width = '0%';
      this.node.querySelector('.js-mp-value').textContent = '--/--';
      this.node.querySelector('.js-mp-bar').style.width = '0%';
    }
  }

  getHero() {
    return this.hero;
  }

  setHero(hero) {
    this.hero = hero ? hero : null;
  }
}

module.exports.UIBattleHeroes = UIBattleHeroes;
},{"gwe":23}],78:[function(require,module,exports){
let { GWE } = require('gwe');

class UIBattleStatus extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleStatus',
      template: `
      <div class="UIBattleStatus-numTurns">
        <div class="UIBattleStatus-numTurns-label">Num.Turn : </div>
        <div class="UIBattleStatus-numTurns-value js-num-turns-value"></div>
      </div>
      <div class="UIBattleStatus-pictures js-pictures"></div>`
    });

    this.battle = null;
  }

  update(ts) {
    if (this.battle) {
      this.node.querySelector('.js-num-turns-value').textContent = this.battle.getNumTurns();
      this.node.querySelector('.js-pictures').innerHTML = '';
      for (let character of this.battle.getCharacterQueue()) {
        this.node.querySelector('.js-pictures').innerHTML += `<img class="UIBattleStatus-pictures-item" src="${character.getPictureFile()}"></img>`;
      }
    }
    else {
      this.node.querySelector('.js-num-turns-value').textContent = '0';
      this.node.querySelector('.js-pictures').innerHTML = '';
    }
  }

  setBattle(battle) {
    this.battle = battle ? battle : null;
  }
}

module.exports.UIBattleStatus = UIBattleStatus;
},{"gwe":23}],79:[function(require,module,exports){
let { GWE } = require('gwe');

class UIEffects extends GWE.UIListView {
  constructor() {
    super();
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIEffectsItem();
    widget.setEffect(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIEffectsItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIEffectsItem',
      template: `
      <span class="UIEffectsItem-name js-name"></span>`
    });

    this.effect = null;
  }
  
  update(ts) {
    if (this.effect) {
      this.node.querySelector('.js-name').textContent = this.effect.getName();
    }
    else {
      this.node.querySelector('.js-name').textContent = '--';
    }
  }

  getEffect() {
    return this.effect;
  }

  setEffect(effect) {
    this.effect = effect ? effect : null;
  }
}

module.exports.UIEffects = UIEffects;
},{"gwe":23}],80:[function(require,module,exports){
let { GWE } = require('gwe');

class UIHeroes extends GWE.UIListView {
  constructor() {
    super();
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIHeroesItem();
    widget.setHero(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIHeroesItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIHeroesItem',
      template: `
      <img class="UIHeroesItem-picture js-picture" src="#">
      <div class="UIHeroesItem-body">
        <div class="UIHeroesItem-body-name js-name"></div>
        <div class="UIHeroesItem-body-stats">
          <div class="UIHeroesItem-body-stats-item">
            <span class="UIHeroesItem-body-stats-item-name">HP</span>
            <span class="UIHeroesItem-body-stats-item-separator"></span>
            <span class="UIHeroesItem-body-stats-item-value js-hp-value"></span>
          </div>
          <div class="UIHeroesItem-body-stats-item">
            <span class="UIHeroesItem-body-stats-item-name">MP</span>
            <span class="UIHeroesItem-body-stats-item-separator"></span>
            <span class="UIHeroesItem-body-stats-item-value js-mp-value"></span>
          </div>
        </div>
      </div>`
    });

    this.hero = null;
  }

  update(ts) {
    if (this.hero) {
      this.node.querySelector('.js-picture').src = this.hero.getPictureFile();
      this.node.querySelector('.js-name').textContent = this.hero.getName();
      this.node.querySelector('.js-hp-value').textContent = this.hero.getAttribute('HP') + '/' + this.hero.getAttribute('HP_MAX');
      this.node.querySelector('.js-mp-value').textContent = this.hero.getAttribute('MP') + '/' + this.hero.getAttribute('HP_MAX');
    }
    else {
      this.node.querySelector('.js-picture').src = '#';
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-hp-value').textContent = '--/--';
      this.node.querySelector('.js-mp-value').textContent = '--/--';
    }
  }

  getHero() {
    return this.hero;
  }

  setHero(hero) {
    this.hero = hero ? hero : null;
  }
}

module.exports.UIHeroes = UIHeroes;
},{"gwe":23}],81:[function(require,module,exports){
let { GWE } = require('gwe');

class UIHeroesEquipment extends GWE.UIListView {
  constructor() {
    super();
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIHeroesEquipmentItem();
    widget.setHero(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIHeroesEquipmentItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIHeroesEquipmentItem',
      template: `
      <img class="UIHeroesEquipmentItem-picture js-picture" src="#">
      <div class="UIHeroesEquipmentItem-body">
        <div class="UIHeroesEquipmentItem-body-name js-name"></div>
        <div class="UIHeroesEquipmentItem-body-stats">
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">HP MAX</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-hp-max-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-hp-max-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">MP MAX</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-mp-max-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-mp-max-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">ATK</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-atk-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-atk-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">DEF</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-def-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-def-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">M-ATK</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-magic-atk-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-magic-atk-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">M-DEF</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-magic-def-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-magic-def-value2"></span>
          </div>
          <div class="UIHeroesEquipmentItem-body-stats-item">
            <span class="UIHeroesEquipmentItem-body-stats-item-name">AGI</span>
            <span class="UIHeroesEquipmentItem-body-stats-item-separator"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value1 js-agility-value1"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-arrow"></span>
            <span class="UIHeroesEquipmentItem-body-stats-item-value2 js-agility-value2"></span>
          </div>
        </div>
      </div>`
    });

    this.hero = null;
    this.equipmentItem = null;
  }

  update(ts) {
    if (this.hero) {
      let attributes = this.hero.getAttributes();
      let newAttributes = this.hero.isEquipableItem(this.equipmentItem) ? this.hero.getAttributesWith(this.equipmentItem) : {};
      this.node.querySelector('.js-picture').src = this.hero.getPictureFile();
      this.node.querySelector('.js-name').textContent = this.hero.getName();
      this.displayStat('hp-max', attributes.get('HP_MAX'), newAttributes['HP_MAX']);
      this.displayStat('mp-max', attributes.get('MP_MAX'), newAttributes['MP_MAX']);
      this.displayStat('atk', attributes.get('ATK'), newAttributes['ATK']);
      this.displayStat('def', attributes.get('DEF'), newAttributes['DEF']);
      this.displayStat('magic-atk', attributes.get('MAGIC_ATK'), newAttributes['MAGIC_ATK']);
      this.displayStat('magic-def', attributes.get('MAGIC_DEF'), newAttributes['MAGIC_DEF']);
      this.displayStat('agility', attributes.get('AGILITY'), newAttributes['AGILITY']);
    }
    else {
      this.node.querySelector('.js-picture').src = '#';
      this.node.querySelector('.js-name').textContent = '--';
      this.displayStat('hp-max', '--');
      this.displayStat('mp-max', '--');
      this.displayStat('atk', '--');
      this.displayStat('def', '--');
      this.displayStat('magic-atk', '--');
      this.displayStat('magic-def', '--');
      this.displayStat('agility', '--');
    }
  }

  getHero() {
    return this.hero;
  }

  setHero(hero) {
    this.hero = hero ? hero : null;
  }

  setEquipmentItem(equipmentItem) {
    this.equipmentItem = equipmentItem ? equipmentItem : null;
  }

  displayStat(attribute, value1, value2) {
    this.node.querySelector('.js-' + attribute + '-value1').textContent = value1 ? value1 : '';
    this.node.querySelector('.js-' + attribute + '-value2').textContent = value2 ? value2 : '';
    this.node.querySelector('.js-' + attribute + '-value2').style.display = value2 ? 'block' : 'none';
    this.node.querySelector('.js-' + attribute + '-value2').style.color = (value2 > value1) ? '#00d600' : (value2 < value1) ? '#ff2929' : '#fff';
  }
}

module.exports.UIHeroesEquipment = UIHeroesEquipment;
},{"gwe":23}],82:[function(require,module,exports){
const { GWE } = require("gwe");

class UIInventory extends GWE.UIListView {
  constructor(options = {}) {
    super();
    this.showPrice = options.showPrice ?? true;
    this.showQuantity = options.showQuantity ?? true;
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIInventoryItem();
    widget.setShowPrice(this.showPrice);
    widget.setShowQuantity(this.showQuantity);
    widget.setItem(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIInventoryItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIInventoryItem',
      template: `
      <span class="UIInventoryItem-name js-name"></span>
      <span class="UIInventoryItem-quantity js-quantity"></span>
      <span class="UIInventoryItem-price js-price"></span>`
    });

    this.item = null;
    this.showPrice = true;
    this.showQuantity = true;
  }

  update(ts) {
    if (this.item) {
      this.node.querySelector('.js-name').textContent = this.item.getName();
      this.node.querySelector('.js-price').style.display = this.showPrice ? 'block' : 'none';
      this.node.querySelector('.js-price').textContent = this.item.price;
      this.node.querySelector('.js-quantity').style.display = this.showQuantity ? 'block' : 'none';
      this.node.querySelector('.js-quantity').textContent = this.item.quantity;
    }
    else {
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-price').textContent = '--';
      this.node.querySelector('.js-quantity').textContent = '--';
    }
  }

  getItem() {
    return this.item;
  }

  setItem(item) {
    this.item = item ? item : null;
  }

  setShowPrice(showPrice) {
    this.showPrice = showPrice;
  }

  setShowQuantity(showQuantity) {
    this.showQuantity = showQuantity;
  }
}

module.exports.UIInventory = UIInventory;
},{"gwe":23}],83:[function(require,module,exports){
let { GWE } = require('gwe');

class UIStatus extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIStatus',
      template: `
      <div class="UIStatus-avatar">
        <img class="UIStatus-avatar-picture js-picture" src="#">
        <div class="UIStatus-avatar-name js-name"></div>
      </div>
      <div class="UIStatus-title">STATS</div>
      <div class="UIStatus-section">
        <div class="UIStatus-stats">
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">LV</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-lv-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">XP</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-xp-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">HP</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-hp-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">MP</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-mp-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">ATK</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-atk-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">DEF</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-def-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">M-ATK</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-matk-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">M-DEF</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-mdef-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">AGILITE</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-agility-value"></span>
          </div>
          <div class="UIStatus-stats-item">
            <span class="UIStatus-stats-item-name">ELEMENT</span>
            <span class="UIStatus-stats-item-separator"></span>
            <span class="UIStatus-stats-item-value js-element-value"></span>
          </div>
        </div>
      </div>
      <div class="UIStatus-title">EQUIPEMENTS</div>
      <div class="UIStatus-section">
        <div class="UIStatus-stuffs">
          <div class="UIStatus-stuffs-item">
            <span class="UIStatus-stuffs-item-name">ARME</span>
            <span class="UIStatus-stuffs-item-separator"></span>
            <span class="UIStatus-stuffs-item-value js-weapon-value"></span>
          </div>
          <div class="UIStatus-stuffs-item">
            <span class="UIStatus-stuffs-item-name">CASQUE</span>
            <span class="UIStatus-stuffs-item-separator"></span>
            <span class="UIStatus-stuffs-item-value js-helmet-value"></span>
          </div>
          <div class="UIStatus-stuffs-item">
            <span class="UIStatus-stuffs-item-name">ARMURE</span>
            <span class="UIStatus-stuffs-item-separator"></span>
            <span class="UIStatus-stuffs-item-value js-armor-value"></span>
          </div>
          <div class="UIStatus-stuffs-item">
            <span class="UIStatus-stuffs-item-name">RELIQUE</span>
            <span class="UIStatus-stuffs-item-separator"></span>
            <span class="UIStatus-stuffs-item-value js-relic-value"></span>
          </div>
        </div>
      </div>
      <div class="UIStatus-title">DESCRIPTION</div>
      <div class="UIStatus-section">
        <div class="UIStatus-description js-description"></div>
      </div>`
    });

    this.hero = null;
  }

  update() {
    if (this.hero) {
      let weapon = this.hero.getWeapon();
      let helmet = this.hero.getHelmet();
      let armor = this.hero.getArmor();
      let relic = this.hero.getRelic();
      this.node.querySelector('.js-picture').src = this.hero.getPictureFile();
      this.node.querySelector('.js-name').textContent = this.hero.getName();
      this.node.querySelector('.js-lv-value').textContent = this.hero.getAttribute('LV') + '/' + this.hero.getAttribute('LV_MAX');
      this.node.querySelector('.js-xp-value').textContent = this.hero.getAttribute('XP') + '/' + this.hero.getAttribute('XP_MAX');
      this.node.querySelector('.js-hp-value').textContent = this.hero.getAttribute('HP') + '/' + this.hero.getAttribute('HP_MAX');
      this.node.querySelector('.js-mp-value').textContent = this.hero.getAttribute('MP') + '/' + this.hero.getAttribute('MP_MAX');
      this.node.querySelector('.js-atk-value').textContent = this.hero.getAttribute('ATK');
      this.node.querySelector('.js-def-value').textContent = this.hero.getAttribute('DEF');
      this.node.querySelector('.js-matk-value').textContent = this.hero.getAttribute('MAGIC_ATK');
      this.node.querySelector('.js-mdef-value').textContent = this.hero.getAttribute('MAGIC_DEF');
      this.node.querySelector('.js-agility-value').textContent = this.hero.getAttribute('AGILITY');
      this.node.querySelector('.js-element-value').textContent = this.hero.getAttribute('ELEMENT');
      this.node.querySelector('.js-weapon-value').textContent = weapon ? weapon.getName() : 'Vide';
      this.node.querySelector('.js-helmet-value').textContent = helmet ? helmet.getName() : 'Vide';
      this.node.querySelector('.js-armor-value').textContent = armor ? armor.getName() : 'Vide';
      this.node.querySelector('.js-relic-value').textContent = relic ? relic.getName() : 'Vide';
    }
    else {
      this.node.querySelector('.js-picture').src = '#';
      this.node.querySelector('.js-name').textContent = '';
      this.node.querySelector('.js-lv-value').textContent = '--/--';
      this.node.querySelector('.js-xp-value').textContent = '--/--';
      this.node.querySelector('.js-hp-value').textContent = '--/--';
      this.node.querySelector('.js-mp-value').textContent = '--/--';
      this.node.querySelector('.js-atk-value').textContent = '--';
      this.node.querySelector('.js-def-value').textContent = '--';
      this.node.querySelector('.js-matk-value').textContent = '--';
      this.node.querySelector('.js-mdef-value').textContent = '--';
      this.node.querySelector('.js-agility-value').textContent = '--';
      this.node.querySelector('.js-element-value').textContent = '--';
      this.node.querySelector('.js-weapon-value').textContent = 'Vide';
      this.node.querySelector('.js-helmet-value').textContent = 'Vide';
      this.node.querySelector('.js-armor-value').textContent = 'Vide';
      this.node.querySelector('.js-relic-value').textContent = 'Vide';
    }
  }

  setHero(hero) {
    this.hero = hero ? hero : null;
  }
}

module.exports.UIStatus = UIStatus;
},{"gwe":23}]},{},[47]);
