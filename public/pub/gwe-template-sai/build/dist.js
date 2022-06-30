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
},{"./gfx3/gfx3_manager":15,"./screen/screen_manager":25,"./ui/ui_manager":37}],3:[function(require,module,exports){
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

  /**
   * Retourne la position.
   * @return {array} La position (3 entrées).
   */
  getPosition() {
    return this.position;
  }

  /**
   * Définit la position.
   * @param {array} position - La position (3 entrées).
   */
  setPosition(position) {
    this.position = position;
  }

  /**
   * Ajoute à la position.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   */
  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
  }

  /**
   * Retourne la rotation.
   * @return {array} La rotation (3 entrées).
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * Définit la rotation.
   * @param {array} rotation - La rotation.
   */
  setRotation(rotation) {
    this.rotation = rotation;
  }

  /**
   * Ajoute à la rotation.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   */
  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
  }

  /**
   * Retourne la mise à l'echelle.
   * @return {array} La mise à l'echelle (3 entrées).
   */
  getScale() {
    return this.scale;
  }

  /**
   * Définit la scale.
   * @param {array} scale - La mise à l'echelle.
   */
  setScale(scale) {
    this.scale = scale;
  }

  /**
   * Ajoute à la mise à l'echelle.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
  */
  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
  }

  /**
   * Retourne le nombre de points.
   * @return {number} Le nombre de points.
   */
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
},{"../event/event_manager":6,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],11:[function(require,module,exports){
let { Utils } = require('../helpers');
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
},{"../event/event_manager":6,"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],12:[function(require,module,exports){
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
},{"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],13:[function(require,module,exports){
let { Utils } = require('../helpers');
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
},{"../helpers":22,"./gfx3_drawable":9,"./gfx3_manager":15,"./gfx3_texture_manager":19}],14:[function(require,module,exports){
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

    this.drawable.setPosition(nextPosition);
    this.drawable.setRotation([0, Utils.VEC2_ANGLE([direction[0], direction[2]]), 0]);

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

  /**
   * Retourne la position.
   * @return {array} La position (3 entrées).
   */
  getPosition() {
    return this.position;
  }

  /**
   * Définit la position.
   * @param {array} position - La position (3 entrées).
   */
  setPosition(position) {
    this.position = position;
    this.updateCameraMatrix();
  }

  /**
   * Ajoute à la position.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   */
  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
    this.updateCameraMatrix();
  }

  /**
   * Retourne la rotation.
   * @return {array} La rotation (3 entrées).
   */
  getRotation() {
    return this.rotation;
  }

  /**
   * Définit la rotation.
   * @param {array} rotation - La rotation.
   */
  setRotation(rotation) {
    this.rotation = rotation;
    this.updateCameraMatrix();
  }

  /**
   * Ajoute à la rotation.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   */
  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
    this.updateCameraMatrix();
  }

  /**
   * Retourne la mise à l'echelle.
   * @return {array} La mise à l'echelle (3 entrées).
   */
  getScale() {
    return this.scale;
  }

  /**
   * Définit la scale.
   * @param {array} scale - La mise à l'echelle.
   */
  setScale(scale) {
    this.scale = scale;
    this.updateCameraMatrix();
  }

  /**
   * Ajoute à la mise à l'echelle.
   * @param {number} x - La coordonnée x.
   * @param {number} y - La coordonnée y.
   * @param {number} z - La coordonnée z.
   */
  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
    this.updateCameraMatrix();
  }

  /**
   * Retourne le décalage de l'espace de clip.
   * @return {array} Le décalage de l'espace de clip (2 entrées).
   */
  getClipOffset() {
    return this.clipOffset;
  }

  /**
   * Définit le décalage de l'espace de clip.
   * @param {array} clipOffset - Le décalage de l'espace de clip (2 entrées).
   */
  setClipOffset(clipOffset) {
    this.clipOffset = clipOffset;
  }

  /**
   * Retourne la matrice de clip.
   * @return {array} Matrice de clip.
   */
  getClipMatrix() {
    return Utils.MAT4_INVERT(Utils.MAT4_TRANSLATE(this.clipOffset[0], this.clipOffset[1], 0));
  }

  /**
   * Retourne la matrice de camera.
   * @return {array} Matrice de camera.
   */
  getCameraMatrix() {
    return this.cameraMatrix;
  }

  /**
   * Définit la matrice de caméra.
   * @param {array} cameraMatrix - La matrice de caméra.
   */
  setCameraMatrix(cameraMatrix) {
    this.cameraMatrix = cameraMatrix;
  }

  /**
   * Retourne la matrice de vue (inverse de la matrice caméra).
   * @return {array} Matrice de vue.
   */
  getCameraViewMatrix() {
    return Utils.MAT4_INVERT(this.cameraMatrix);
  }

  /**
   * Retourne le viewport associé à la vue.
   * @return {Gfx3Viewport} Le viewport.
   */
  getViewport() {
    return this.viewport;
  }

  /**
   * Définit le viewport associé à la vue.
   * @param {Gfx3Viewport} viewport - Le viewport.
   */
  setViewport(viewport) {
    this.viewport = viewport;
  }

  /**
   * Retourne la couleur de fond.
   * @return {array} La couleur de fond (4 entrées).
   */
  getBackgroundColor() {
    return this.backgroundColor;
  }

  /**
   * Définit la couleur de fond.
   * @param {number} r - Canal rouge.
   * @param {number} g - Canal vert.
   * @param {number} b - Canal bleu.
   * @param {number} a - Canal alpha (transparence).
   */
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
  gfx3Manager,
  gfx3TextureManager,
  eventManager,
  screenManager,
  soundManager,
  uiManager
};
},{"./application":2,"./array/array_collection":3,"./bounding/bounding_box":4,"./bounding/bounding_rect":5,"./event/event_manager":6,"./event/event_subscriber":7,"./gfx3/gfx3_collisionbox":8,"./gfx3/gfx3_drawable":9,"./gfx3/gfx3_jam":10,"./gfx3/gfx3_jas":11,"./gfx3/gfx3_jsm":12,"./gfx3/gfx3_jss":13,"./gfx3/gfx3_jwm":14,"./gfx3/gfx3_manager":15,"./gfx3/gfx3_mover":16,"./gfx3/gfx3_shaders":17,"./gfx3/gfx3_texture":18,"./gfx3/gfx3_texture_manager":19,"./gfx3/gfx3_view":20,"./gfx3/gfx3_viewport":21,"./helpers":22,"./screen/screen":24,"./screen/screen_manager":25,"./script/script_machine":26,"./sound/sound_manager":27,"./ui/ui_bubble":28,"./ui/ui_description_list":29,"./ui/ui_dialog":30,"./ui/ui_input_range":31,"./ui/ui_input_select":32,"./ui/ui_input_slider":33,"./ui/ui_input_text":34,"./ui/ui_keyboard":35,"./ui/ui_list_view":36,"./ui/ui_manager":37,"./ui/ui_menu":38,"./ui/ui_menu_item_text":39,"./ui/ui_message":40,"./ui/ui_print":41,"./ui/ui_prompt":42,"./ui/ui_sprite":43,"./ui/ui_text":44,"./ui/ui_widget":45}],24:[function(require,module,exports){
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
  onEnter(args) {
    // virtual method called during enter phase !
  }

  /**
   * Fonction appelée lors de la suppression de l'écran dans le gestionnaire.
   * @param {object} args - Données transitoires.
   */
  onExit() {
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
},{}],25:[function(require,module,exports){
/**
 * Singleton représentant un gestionnaire d'écrans.
 */
class ScreenManager {
  /**
   * Créer un gestionnaire d'écrans.
   */
  constructor() {
    this.requests = [];
    this.stack = [];
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

    for (let i = this.stack.length - 1; i >= 0; i--) {
      this.stack[i].update(ts);
      if (this.stack[i].blocking) {
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
    for (let i = this.stack.length - 1; i >= 0; i--) {
      this.stack[i].draw(viewIndex);
      if (this.stack[i].blocking) {
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
      if (this.stack.indexOf(newTopScreen) != -1) {
        throw new Error('ScreenManager::requestPushScreen(): You try to push an existing screen to the stack !');
      }

      let topScreen = this.stack[this.stack.length - 1];
      topScreen.onBringToBack(newTopScreen);

      newTopScreen.onEnter(args);
      this.stack.push(newTopScreen);
    });
  }

  /**
   * Commande l'ajout d'un écran et supprime tous les écrans courants.
   * @param {Screen} newScreen - Ecran à ajouter.
   * @param {object} args - Données transitoires.
   */
  requestSetScreen(newScreen, args = {}) {
    this.requests.push(() => {
      this.stack.forEach((screen) => screen.onExit());
      this.stack = [];
      newScreen.onEnter(args);
      this.stack.push(newScreen);
    });
  }

  /**
   * Commande la suppression du dernier écran.
   */
  requestPopScreen() {
    this.requests.push(() => {
      if (this.stack.length == 0) {
        throw new Error('ScreenManager::requestPopScreen: You try to pop an empty state stack !');
      }

      let topScreen = this.stack[this.stack.length - 1];
      topScreen.onExit();
      this.stack.pop();

      if (this.stack.length > 0) {
        let newTopScreen = this.stack[this.stack.length - 1];
        newTopScreen.onBringToFront(topScreen);
      }
    });
  }
}

module.exports.screenManager = new ScreenManager();
},{}],26:[function(require,module,exports){
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
},{"fs":1}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":38,"./ui_menu_item_text":39,"./ui_widget":45}],29:[function(require,module,exports){
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
},{"./ui_widget":45}],30:[function(require,module,exports){
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
      this.node.querySelector('js-next').style.display = 'block';
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
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
    this.node.querySelector('js-next').style.display = 'none';
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
},{"../event/event_manager":6,"./ui_widget":45}],31:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],32:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":38,"./ui_menu_item_text":39}],33:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],34:[function(require,module,exports){
module.exports.UIInputText = {};
},{}],35:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],36:[function(require,module,exports){
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
},{"../array/array_collection":3,"../event/event_manager":6,"./ui_menu":38}],37:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],38:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],39:[function(require,module,exports){
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
},{"./ui_widget":45}],40:[function(require,module,exports){
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
      this.node.querySelector('js-next').style.display = 'block';
      eventManager.emit(this, 'E_PRINT_FINISHED');
      return;
    }

    if (this.timeElapsed >= this.stepDuration) {
      if (this.currentTextOffset < this.text.length) {
        this.node.querySelector('js-text').textContent = this.text.substring(0, this.currentTextOffset + 1);
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
    this.node.querySelector('js-author').textContent = author;
  }

  setText(text) {
    this.text = text;
    this.currentTextOffset = 0;
    this.isFinished = false;
    this.node.querySelector('js-next').style.display = 'none';
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
},{"../event/event_manager":6,"./ui_widget":45}],41:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":45}],42:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":38,"./ui_menu_item_text":39,"./ui_widget":45}],43:[function(require,module,exports){
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
  constructor() {
    super({
      className: 'UISprite'
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

  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    this.jas = new JAS();
    this.jas.imageFile = json['ImageFile'];

    for (let obj of json['Animations']) {
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
},{"../event/event_manager":6,"./ui_widget":45}],44:[function(require,module,exports){
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
},{"./ui_widget":45}],45:[function(require,module,exports){
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
},{"../event/event_manager":6}],46:[function(require,module,exports){
window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { BootScreen } = require('./screens/boot_screen');

  let app = new GWE.Application(600, 600, GWE.SizeModeEnum.FIXED);
  GWE.screenManager.requestSetScreen(new BootScreen(app));
  requestAnimationFrame(ts => app.run(ts));
});
},{"./screens/boot_screen":67,"gwe":23}],47:[function(require,module,exports){
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
    if (!modifier.isStackable() && this.modifiers.find(m => m.getId() == modifier.getId())) {
      return false;
    }

    this.modifiers.push(modifier);
  }

  removeModifier(modifier) {
    this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
  }

  removeModifierIf(predicate) {
    for (let modifier of this.modifiers) {
      if (predicate(modifier)) {
        this.modifiers.splice(this.modifiers.indexOf(modifier), 1);
      }
    }
  }

  clearModifiers() {
    while (this.modifiers.length) {
      this.modifiers.pop();
    }
  }
}

module.exports.Attributes = Attributes;
},{}],48:[function(require,module,exports){
let { LOCATION } = require('./enums');
let { Attributes } = require('./attributes');

class CardAbstract {
  constructor() {
    this.id = '';
    this.type = '';
    this.name = '';
    this.text = '';
    this.coverFile = '';
    this.attributes; // [ELEMENT]
    this.owner = 0;
    this.controler = 0;
    this.position = '';
    this.location = LOCATION.DECK;
    this.turnCounter = 0;
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.type = data['Type'];
    this.name = data['Name'];
    this.text = data['Text'];
    this.coverFile = data['CoverFile'];
    this.attributes = new Attributes(data['Attributes']);
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

  getText() {
    return this.text;
  }

  getCoverFile() {
    return this.coverFile;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  getOwner() {
    return this.owner;
  }

  setOwner(owner) {
    this.owner = owner;
  }

  getControler() {
    return this.controler;
  }

  setControler(controler) {
    this.controler = controler;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }

  getLocation() {
    return this.location;
  }

  setLocation(location) {
    this.location = location;
  }

  getTurnCounter() {
    return this.turnCounter;
  }

  incTurnCounter() {
    this.turnCounter++;
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  incAttribute(key) {
    this.attributes.set(key, this.attributes.get(key) + 1);
  }

  isSummonable(duel) {
    return false;
  }

  isSetable(duel) {
    return false;
  }

  isCapableAttack(duel) {
    return false;
  }

  isCapableChangePosition(duel) {
    return false;
  }

  isActiveatable(duel) {
    return false;
  }

  isTriggerable(duel, action) {
    return false;
  }
}

module.exports.CardAbstract = CardAbstract;
},{"./attributes":47,"./enums":55}],49:[function(require,module,exports){
let { MonsterCard } = require('./monster_card');
let { SpellCard } = require('./spell_card');

class Deck {
  constructor() {
    this.cards = [];
  }

  async loadFromData(data) {
    for (let obj of data) {
      if (obj['CardTypeName'] == 'MonsterCard') {
        let monsterCard = new MonsterCard();
        await monsterCard.loadFromFile('assets/models/' + obj['CardId'] + '/data.json');
        this.cards.push(monsterCard);
      }
      else if (obj['CardTypeName'] == 'SpellCard') {
        let spellCard = new SpellCard();
        await spellCard.loadFromFile('assets/models/' + obj['CardId'] + '/data.json');
        this.cards.push(spellCard);
      }
    }
  }

  getCards() {
    return this.cards;
  }
}

module.exports.Deck = Deck;
},{"./monster_card":62,"./spell_card":64}],50:[function(require,module,exports){
let { GWE } = require('gwe');
let { LOCATION, PHASE, CARD_POS, EFFECT_TARGET_TYPE, SPELL_CARD_NATURE, CARD_TYPE, HAND_MAX } = require('./enums');
let { HumanDuelist } = require('./duelist');
let { ActivateAction } = require('./duel_actions');
let { Turn } = require('./turn');
let { Phase } = require('./phase');

class Duel {
  constructor() {
    this.duelists = [];
    this.turns = [];
    this.currentTurn = null;
    this.currentDuelistIndex = -1;
    this.opponentDuelistIndex = -1;
  }

  async loadFromData(data) {
    for (let i = 0; i < 2; i++) {
      let duelistId = data['DuelistIds'][i];
      let duelist = new HumanDuelist();
      await duelist.loadFromFile('assets/models/' + duelistId + '/data.json');
      let deck = duelist.getDeck();

      for (let card of deck.getCards()) {
        card.setOwner(i);
        card.setControler(i);
        duelist.pushCard(LOCATION.DECK, card);
      }

      this.duelists.push(duelist);
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  startup() {
    this.operationDraw(0, 4);
    this.operationDraw(1, 4);
    this.operationNewTurn();
  }

  async runAction(action) {
    let spellCards = this.utilsQuery(this.currentDuelistIndex, [[LOCATION.SZONE], [LOCATION.SZONE]], card => card);
    let cards = this.utilsQuery(this.currentDuelistIndex, [[LOCATION.MZONE, LOCATION.SZONE, LOCATION.FZONE], [LOCATION.MZONE, LOCATION.SZONE, LOCATION.FZONE]], card => card);

    // check triggers
    //
    for (let spellCard of spellCards) {
      if (spellCard.isTriggerable(this, action)) {
        await this.runAction(new ActivateAction(this, spellCard));
      }
    }

    // exec action
    //
    if (!action.isNegate()) {
      await action.exec();
    }
    else {
      return;
    }

    // check releases
    //
    for (let spellCard of spellCards) {
      if (spellCard.isReleasable(this)) {
        await this.operationDestroy(spellCard);
      }
    }

    // check & update target cards & status links
    //
    for (let spellCard of spellCards) {
      if (spellCard.getPosition() != CARD_POS.FACEUP) {
        continue;
      }
      if (spellCard.getNature() != SPELL_CARD_NATURE.CONTINUOUS) {
        continue;
      }

      for (let card of cards) {
        for (let effect of spellCard.getEffects()) {
          if (effect.getTargetType() != EFFECT_TARGET_TYPE.FIELD) {
            continue;
          }

          if (effect.hasTargetCard(card) && !effect.isTarget(this, card)) {
            effect.removeTargetCard(card);
            let attributes = card.getAttributes();
            attributes.removeModifierIf(m => m.isLinked() && m.getLinkedEffect() == effect);
          }
          else if (!effect.hasTargetCard(card) && effect.isTarget(this, card)) {
            effect.addTargetCard(card);
            effect.apply(this, spellCard, card);
          }
        }
      }

      for (let effect of spellCard.getEffects()) {
        if (effect.getTargetType() != EFFECT_TARGET_TYPE.SINGLE) {
          continue;
        }

        for (let targetCard of effect.getTargetCards()) {
          if (targetCard == null || !effect.isTargetConditionCheck(targetCard)) {
            await this.operationDestroy(spellCard);
          }
        }
      }
    }

    // check win/lost
    //
    if (this.duelists[0].getAttribute('LIFEPOINTS') == 0) {
      return 'WIN';
    }
    else if (this.duelists[1].getAttribute('LIFEPOINTS') == 0) {
      return 'LOST';
    }

    // check new turn
    //
    let currentPhase = this.currentTurn.getCurrentPhase();
    if (currentPhase.getId() == PHASE.END) {
      return this.operationNewTurn();
    }
  }

  getDuelists() {
    return this.duelists;
  }

  getDuelist(index) {
    return this.duelists[index];
  }

  getCurrentDuelist() {
    return this.duelists[this.currentDuelistIndex];
  }

  getOpponentDuelist() {
    return this.duelists[this.opponentDuelistIndex];
  }

  getCurrentTurn() {
    return this.currentTurn;
  }

  getCurrentDuelistIndex() {
    return this.currentDuelistIndex;
  }

  getOpponentDuelistIndex() {
    return this.opponentDuelistIndex;
  }

  async operationNewTurn() {
    if (this.currentDuelistIndex == -1) {
      this.currentDuelistIndex = 1;
      this.opponentDuelistIndex = 0;
    }
    else if (this.currentDuelistIndex == 0) {
      this.currentDuelistIndex = 1;
      this.opponentDuelistIndex = 0;
    }
    else {
      this.currentDuelistIndex = 0;
      this.opponentDuelistIndex = 1;
    }

    if (this.turns.length < 2) {
      let turn = new Turn();
      turn.addPhase(CREATE_PHASE_DRAW());
      turn.addPhase(CREATE_PHASE_MAIN());
      turn.addPhase(CREATE_PHASE_END());
      turn.setCurrentPhase(turn.getPhases()[0]);
      this.turns.push(turn);
      this.currentTurn = turn;
    }
    else {
      let turn = new Turn();
      turn.addPhase(CREATE_PHASE_DRAW());
      turn.addPhase(CREATE_PHASE_MAIN());
      turn.addPhase(CREATE_PHASE_BATTLE());
      turn.addPhase(CREATE_PHASE_END());
      turn.setCurrentPhase(turn.getPhases()[0]);
      this.turns.push(turn);
      this.currentTurn = turn;
    }

    for (let duelist of this.duelists) {
      duelist.setAttribute('DRAW_COUNT', 0);
      duelist.setAttribute('SUMMON_COUNT', 0);
    }

    for (let card of this.utilsQuery(this.currentDuelistIndex, [[LOCATION.SZONE, LOCATION.MZONE, LOCATION.FZONE], [LOCATION.SZONE, LOCATION.MZONE, LOCATION.FZONE]], card => card)) {
      if (card.getType() == CARD_TYPE.MONSTER) {
        card.setAttribute('ATK_COUNT', 0);
        card.incTurnCounter();
      }
      else if (card.getType() == CARD_TYPE.SPELL && card.getPosition() == CARD_POS.FACEUP) {
        card.incTurnCounter();
      }
    }

    GWE.eventManager.emit(this, 'E_NEW_TURN');
  }

  async operationSelectLocation(range, predicateCard = () => true) {
    let response = {};
    response.state = false;
    response.location = '';
    response.index = 0;
    response.card = null;

    await GWE.eventManager.emit(this, 'E_SELECT_LOCATION', { range: range, predicateCard: predicateCard, response: response, required: false });
    if (!response.state) {
      return null;
    }

    return response;
  }

  async operationSelectRequiredLocation(range, predicateCard = () => true) {
    let response = {};
    response.state = false;
    response.location = '';
    response.index = 0;
    response.card = null;

    await GWE.eventManager.emit(this, 'E_SELECT_LOCATION', { range: range, predicateCard: predicateCard, response: response, required: true });
    if (!response.state) {
      return null;
    }

    return response;
  }

  async operationDraw(duelistIndex, numCards) {
    let handZone = this.duelists[duelistIndex].getZone(LOCATION.HAND);
    if (handZone.length + numCards > HAND_MAX) {
      for (let i = 0; i < handZone.length + numCards - HAND_MAX; i++) {
        let loc = await this.operationSelectLocation([[LOCATION.HAND], 0], card => card);
        this.duelists[duelistIndex].removeCard(LOCATION.HAND, loc.card);
      }
    }

    while (numCards-- > 0) {
      let card = this.duelists[duelistIndex].popCard(LOCATION.DECK);
      this.duelists[duelistIndex].pushCard(LOCATION.HAND, card);
      card.setLocation(LOCATION.HAND);
    }
  }

  async operationRestore(duelistIndex, amount) {
    let attributes = this.duelists[duelistIndex].getAttributes();
    attributes.add('LIFEPOINTS', + amount);
    GWE.eventManager.emit(this.duelists[duelistIndex], 'E_RESTORE', { amount: amount });
  }

  async operationDamage(duelistIndex, amount) {
    let attributes = this.duelists[duelistIndex].getAttributes();
    attributes.add('LIFEPOINTS', - amount);
    GWE.eventManager.emit(this.duelists[duelistIndex], 'E_DAMAGE', { amount: amount });
  }

  async operationSummon(monsterCard, index) {
    this.duelists[monsterCard.getControler()].removeCard(LOCATION.HAND, monsterCard);
    this.duelists[monsterCard.getControler()].insertCard(LOCATION.MZONE, index, monsterCard);
    monsterCard.setPosition(CARD_POS.ATTACK);
    monsterCard.setLocation(LOCATION.MZONE);
  }

  async operationSet(spellCard, index) {
    this.duelists[spellCard.getControler()].removeCard(LOCATION.HAND, spellCard);
    this.duelists[spellCard.getControler()].insertCard(LOCATION.SZONE, index, spellCard);
    spellCard.setPosition(CARD_POS.FACEDOWN);
    spellCard.setLocation(LOCATION.SZONE);
  }

  async operationChangePosition(card, position) {
    card.setPosition(position);
  }

  async operationBattle(attackerCard, targetCard) {
    let targetValue = targetCard.getPosition() == CARD_POS.ATTACK ? targetCard.getAttribute('ATK') : targetCard.getAttribute('DEF');
    let damage = attackerCard.getAttribute('ATK') - targetValue;

    if (damage > 0) {
      this.operationDestroy(targetCard);
      this.operationDamage(targetCard.getControler(), Math.abs(damage));
    }
    else if (damage < 0) {
      this.operationDestroy(attackerCard);
      this.operationDamage(attackerCard.getControler(), Math.abs(damage));
    }
  }

  async operationNextPhase() {
    let phases = this.currentTurn.getPhases();
    let nextPhaseIndex = phases.indexOf(this.currentTurn.getCurrentPhase()) + 1;
    while (phases[nextPhaseIndex].isDisabled() && nextPhaseIndex < phases.length) {
      nextPhaseIndex++;
    }

    this.currentTurn.setCurrentPhase(phases[nextPhaseIndex]);
  }

  async operationChangePhase(phaseId) {
    let phase = this.currentTurn.getPhase(phaseId);
    if (!phase) {
      throw new Error('Duel::operationChangePhase : phase not found !');
    }
    if (phase.isDisabled()) {
      throw new Error('Duel::operationChangePhase : phase is disabled !');
    }

    this.currentTurn.setCurrentPhase(phase);
  }

  async operationIncDuelistAttribute(duelistIndex, attributeKey) {
    this.duelists[duelistIndex].incAttribute(attributeKey);
  }

  async operationAddDuelistModifier(duelistIndex, modifier) {
    let attributes = this.duelists[duelistIndex].getAttributes();
    attributes.addModifier(modifier);
  }

  async operationIncCardAttribute(card, attributeKey) {
    card.incAttribute(attributeKey);
  }

  async operationAddCardModifier(card, modifier) {
    let attributes = card.getAttributes();
    attributes.addModifier(modifier);
  }

  async operationDestroy(card) {
    if (card.getType() == CARD_TYPE.SPELL) {
      for (let effect of card.getEffects()) {
        for (let targetCard of effect.getTargetCards()) {
          let attributes = targetCard.getAttributes();
          attributes.removeModifierIf(m => m.isLinked() && m.getLinkedEffect() == effect);
        }

        for (let duelist of this.duelists) {
          let attributes = duelist.getAttributes();
          attributes.removeModifierIf(m => m.isLinked() && m.getLinkedEffect() == effect);
        }
      }
    }

    this.utilsRemoveCard(card);
    this.duelists[card.getControler()].pushCard(LOCATION.GRAVEYARD, card);
    card.setPosition(CARD_POS.FACEDOWN);
    card.setLocation(LOCATION.GRAVEYARD);
  }

  async operationActivateCardEffect(spellCard, effectIndex) {
    let targetCards = [];
    let effects = spellCard.getEffects();
    let effect = effects[effectIndex];

    if (effect.getTargetType() == EFFECT_TARGET_TYPE.SINGLE) {
      let loc = await this.operationSelectRequiredLocation(effect.getTargetRange(), card => card && effect.isTarget(this, card));
      targetCards.push(loc.card);
    }
    else if (effect.getTargetType() == EFFECT_TARGET_TYPE.FIELD) {
      targetCards = this.utilsQuery(spellCard.getControler(), effect.getTargetRange(), card => card && effect.isTarget(this, card));
    }
    else if (effect.getTargetType() == EFFECT_TARGET_TYPE.NONE) {
      targetCards = [null];
    }

    for (let targetCard of targetCards) {
      effect.apply(this, spellCard, targetCard);
      effect.addTargetCard(targetCard);
    }
  }

  utilsRemoveCard(card) {
    let duelist = this.duelists[card.getOwner()];

    if (card.getLocation() == LOCATION.MZONE || card.getLocation() == LOCATION.SZONE || card.getLocation() == LOCATION.FZONE) {
      let zone = duelist.getZone(card.getLocation());
      let index = zone.indexOf(card);
      duelist.insertCard(card.getLocation(), index, null);
    }
    else {
      duelist.removeCard(card.getLocation(), card);
    }
  }

  utilsQuery(duelistIndex, range, cardPredicate = (card) => true) {
    let cards = [];
    let currentDuelistIndex = duelistIndex;
    let opponentDuelistIndex = duelistIndex == 0 ? 1 : 0;

    for (let i = 0; i < 2; i++) {
      if (range[i] == 0) {
        continue;
      }

      let rangeDuelistIndex = i == 0 ? currentDuelistIndex : opponentDuelistIndex;
      for (let j = 0; j < range[i].length; j++) {
        let zone = this.duelists[rangeDuelistIndex].getZone(range[i][j]);
        cards = cards.concat(zone.filter(cardPredicate));
      }
    }

    return cards;
  }

  handleAI() {
    console.log('handle AI !');
  }
}

module.exports.Duel = Duel;

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CREATE_PHASE_DRAW() {
  return new Phase(PHASE.DRAW, 'Draw Phase', false);
}

function CREATE_PHASE_MAIN() {
  return new Phase(PHASE.MAIN, 'Main Phase', false);
}

function CREATE_PHASE_BATTLE() {
  return new Phase(PHASE.BATTLE, 'Battle Phase', false);
}

function CREATE_PHASE_END() {
  return new Phase(PHASE.END, 'End Phase', false);
}
},{"./duel_actions":51,"./duelist":53,"./enums":55,"./phase":63,"./turn":65,"gwe":23}],51:[function(require,module,exports){
let { CARD_POS, SPELL_CARD_NATURE } = require('./enums');

class Action {
  constructor(duel) {
    this.duel = duel;
    this.negate = false;
  }

  isNegate() {
    return this.negate;
  }

  setNegate(negate) {
    this.negate = negate;
  }

  async exec() {
    return true;
  }
}

class DirectAttackAction extends Action {
  constructor(duel, attackerCard) {
    super(duel);
    this.attackerCard = attackerCard;
  }

  async exec() {
    await this.duel.operationDamage(this.duel.getOpponentDuelistIndex(), this.attackerCard.getAttribute('ATK'));
    await this.duel.operationIncCardAttribute(this.attackerCard, 'ATK_COUNT');
  }
}

class DrawAction extends Action {
  constructor(duel) {
    super(duel);
  }

  async exec() {
    await this.duel.operationDraw(this.duel.getCurrentDuelistIndex(), 1);
    await this.duel.operationIncDuelistAttribute(this.duel.getCurrentDuelistIndex(), 'DRAW_COUNT');
  }
}

class SummonAction extends Action {
  constructor(duel, monsterCard, index) {
    super(duel);
    this.monsterCard = monsterCard;
    this.index = index;
  }

  async exec() {
    await this.duel.operationSummon(this.monsterCard, this.index);
    await this.duel.operationIncDuelistAttribute(this.duel.getCurrentDuelistIndex(), 'SUMMON_COUNT');
  }
}

class SetAction extends Action {
  constructor(duel, spellCard, index) {
    super(duel);
    this.spellCard = spellCard;
    this.index = index;
  }

  async exec() {
    await this.duel.operationSet(this.spellCard, this.index);
  }
}

class ChangePositionAction extends Action {
  constructor(duel, monsterCard) {
    super(duel);
    this.monsterCard = monsterCard;
  }

  async exec() {
    let position = this.monsterCard.getPosition() == CARD_POS.ATTACK ? CARD_POS.DEFENSE : CARD_POS.ATTACK;
    this.duel.operationChangePosition(this.monsterCard, position);
  }
}

class BattleAction extends Action {
  constructor(duel, attackerCard, targetCard) {
    super(duel);
    this.attackerCard = attackerCard;
    this.targetCard = targetCard;
  }

  async exec() {
    await this.duel.operationBattle(this.attackerCard, this.targetCard);
    await this.duel.operationIncCardAttribute(this.attackerCard, 'ATK_COUNT');
  }
}

class NextPhaseAction extends Action {
  constructor(duel) {
    super(duel);
  }

  async exec() {
    await this.duel.operationNextPhase();
  }
}

class ActivateAction extends Action {
  constructor(duel, spellCard) {
    super(duel);
    this.spellCard = spellCard;
  }

  async exec() {
    await this.duel.operationChangePosition(this.spellCard, CARD_POS.FACEUP);

    for (let i = 0; i < this.spellCard.getEffects().length; i++) {
      await this.duel.runAction(new ActivateCardEffectInternalAction(this.duel, this.spellCard, i));
    }

    if (this.spellCard.getNature() == SPELL_CARD_NATURE.NORMAL) {
      await this.duel.operationDestroy(this.spellCard);
    }
  }
}

class ActivateCardEffectInternalAction extends Action {
  constructor(duel, spellCard, effectIndex) {
    super(duel);
    this.spellCard = spellCard;
    this.effectIndex = effectIndex;
  }

  async exec() {
    await this.duel.operationActivateCardEffect(this.spellCard, this.effectIndex);
  }
}

module.exports.DirectAttackAction = DirectAttackAction;
module.exports.DrawAction = DrawAction;
module.exports.SummonAction = SummonAction;
module.exports.SetAction = SetAction;
module.exports.ChangePositionAction = ChangePositionAction;
module.exports.BattleAction = BattleAction;
module.exports.NextPhaseAction = NextPhaseAction;
module.exports.ActivateAction = ActivateAction;
},{"./enums":55}],52:[function(require,module,exports){
let { PHASE, LOCATION } = require('./enums');
let {  DirectAttackAction, DrawAction, SummonAction, SetAction, ChangePositionAction, BattleAction, NextPhaseAction, ActivateAction } = require('./duel_actions');

class Command {
  constructor(duel) {
    this.duel = duel;
  }

  async exec() {
    return true;
  }

  isConditionCheck() {
    return true;
  }
}

class DrawCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    await this.duel.runAction(new DrawAction(this.duel));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.DRAW) {
      return false;
    }

    if (!this.currentDuelist.isCapableDraw()) {
      return false;
    }

    return true;
  }
}

class SummonCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.HAND], 0], card => {
      return card && card.isSummonable()
    });

    if (loc0 == null) {
      return false;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.MZONE], 0], card => {
      return card == null
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new SummonAction(this.duel, loc0.card, loc1.index));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableSummon()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.HAND], 0], card => {
      return card && card.isSummonable()
    });

    if (arr0.length == 0) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], 0], card => {
      return card == null;
    });

    if (arr1.length == 0) {
      return false;
    }

    return true;
  }
}

class SetCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.HAND], 0], card => {
      return card && card.isSetable()
    });

    if (loc0 == null) {
      return false;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.SZONE], 0], card => {
      return card == null
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new SetAction(this.duel, loc0.card, loc1.index));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableSet()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.HAND], 0], card => {
      return card && card.isSetable()
    });

    if (arr0.length == 0) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.SZONE], 0], card => {
      return card == null
    });

    if (arr1.length == 0) {
      return false;
    }

    return true;
  }
}

class ChangePositionCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableChangePosition()
    });

    if (loc0 == null) {
      return false;
    }

    await this.duel.runAction(new ChangePositionAction(this.duel, loc0.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableChangePosition()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableChangePosition()
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

class BattleCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableAttack()
    });

    if (loc0 == null) {
      return false;
    }

    let arr1 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getOpponentDuelistIndex()
    });

    if (arr1.length == 0) {
      await this.duel.runAction(new DirectAttackAction(this.duel, loc0.card));
      return true;
    }

    let loc1 = await this.duel.operationSelectLocation([[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getOpponentDuelistIndex()
    });

    if (loc1 == null) {
      return false;
    }

    await this.duel.runAction(new BattleAction(this.duel, loc0.card, loc1.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.BATTLE) {
      return false;
    }

    if (!this.currentDuelist.isCapableBattle()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.MZONE], [LOCATION.MZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isCapableAttack()
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

class NextPhaseCommand extends Command {
  constructor(duel) {
    super(duel);
  }

  async exec() {
    await this.duel.runAction(new NextPhaseAction(this.duel));
  }

  isConditionCheck() {
    return true;
  }
}

class ActivateCommand extends Command {
  constructor(duel) {
    super(duel);
    this.currentDuelist = this.duel.getCurrentDuelist();
    this.currentTurn = this.duel.getCurrentTurn();
    this.currentPhase = this.currentTurn.getCurrentPhase();
  }

  async exec() {
    let loc0 = await this.duel.operationSelectLocation([[LOCATION.SZONE], [LOCATION.SZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isActiveatable(this.duel)
    });

    if (loc0 == null) {
      return false;
    }

    await this.duel.runAction(new ActivateAction(this.duel, loc0.card));
  }

  isConditionCheck() {
    if (this.currentPhase.getId() != PHASE.MAIN) {
      return false;
    }

    if (!this.currentDuelist.isCapableActivate()) {
      return false;
    }

    let arr0 = this.duel.utilsQuery(this.duel.getCurrentDuelistIndex(), [[LOCATION.SZONE], [LOCATION.SZONE]], card => {
      return card && card.getControler() == this.duel.getCurrentDuelistIndex() && card.isActiveatable(this.duel)
    });

    if (arr0.length == 0) {
      return false;
    }

    return true;
  }
}

module.exports.DrawCommand = DrawCommand;
module.exports.SummonCommand = SummonCommand;
module.exports.SetCommand = SetCommand;
module.exports.ChangePositionCommand = ChangePositionCommand;
module.exports.BattleCommand = BattleCommand;
module.exports.NextPhaseCommand = NextPhaseCommand;
module.exports.ActivateCommand = ActivateCommand;
},{"./duel_actions":51,"./enums":55}],53:[function(require,module,exports){
let { LOCATION } = require('./enums');
let { Deck } = require('./deck');
let { Attributes } = require('./attributes');
let { Zone } = require('./zone');

class DuelistAbstract {
  constructor() {
    this.name = '';
    this.pictureFile = '';
    this.deck;
    this.attributes; // [LIFEPOINTS, DRAW_COUNT, DRAW_COUNT_LIMIT, SUMMON_COUNT, SUMMON_COUNT_LIMIT, STATE_CANNOT_SET, STATE_CANNOT_SUMMON]
    this.zones = [];

    let mzone = new Zone(LOCATION.MZONE);
    mzone.push(null, null, null);
    this.zones.push(mzone);

    let szone = new Zone(LOCATION.SZONE);
    szone.push(null, null, null);
    this.zones.push(szone);

    let fzone = new Zone(LOCATION.FZONE);
    fzone.push(null);
    this.zones.push(fzone);

    this.zones.push(new Zone(LOCATION.DECK));
    this.zones.push(new Zone(LOCATION.GRAVEYARD));
    this.zones.push(new Zone(LOCATION.BANNISHED));
    this.zones.push(new Zone(LOCATION.HAND));
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.pictureFile = data['PictureFile'];
    this.deck = new Deck();
    await this.deck.loadFromData(data['Deck']);
    this.attributes = new Attributes(data['Attributes']);
  }

  getName() {
    return this.name;
  }

  getPictureFile() {
    return this.pictureFile;
  }

  getDeck() {
    return this.deck;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  incAttribute(key) {
    this.attributes.set(key, this.attributes.get(key) + 1);
  }

  getZone(location) {
    return this.zones.find(z => z.getLocation() == location);
  }

  getCard(location, index) {
    let zone = this.zones.find(z => z.getLocation() == location);
    return zone[index];
  }

  insertCard(location, index, card) {
    let zone = this.zones.find(z => z.getLocation() == location);
    zone[index] = card;
  }

  removeCard(location, card) {
    let zone = this.zones.find(z => z.getLocation() == location);
    zone.splice(zone.indexOf(card), 1);
  }

  pushCard(location, card) {
    let zone = this.zones.find(z => z.getLocation() == location);
    zone.push(card);
  }

  popCard(location) {
    let zone = this.zones.find(z => z.getLocation() == location);
    return zone.pop();
  }

  getField() {
    return this.field;
  }

  isCapableDraw() {
    if (this.attributes.get('DRAW_COUNT') >= this.attributes.get('DRAW_COUNT_LIMIT')) {
      return false;
    }

    return true;
  }

  isCapableSummon() {
    if (this.attributes.get('STATE_CANNOT_SUMMON') == 1) {
      return false;
    }
    if (this.attributes.get('SUMMON_COUNT') >= this.attributes.get('SUMMON_COUNT_LIMIT')) {
      return false;
    }

    return true;
  }

  isCapableSet() {
    if (this.attributes.get('STATE_CANNOT_SET') == 1) {
      return false;
    }

    return true;
  }

  isCapableChangePosition() {
    return true;
  }

  isCapableActivate() {
    return true;
  }

  isCapableBattle() {
    return true;
  }
}

class HumanDuelist extends DuelistAbstract {
  constructor() {
    super();
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }
}

class AIDuelist extends DuelistAbstract {
  constructor() {
    super();
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }
}

module.exports.HumanDuelist = HumanDuelist;
module.exports.AIDuelist = AIDuelist;
},{"./attributes":47,"./deck":49,"./enums":55,"./zone":66}],54:[function(require,module,exports){
let { EFFECT_MECHANIC_MAPPING } = require('./mappings/effect_mechanic_mapping');
let { EFFECT_TARGET_CONDITION_MAPPING } = require('./mappings/effect_target_condition_mapping');

class Effect {
  constructor(card) {
    this.card = card;
    this.targetType = '';
    this.targetRange = '';
    this.targetConditionId = '';
    this.targetConditionOpts = {};
    this.mechanicId = '';
    this.mechanicOpts = {};
    this.targetCards = [];
  }

  async loadFromData(data) {
    this.targetType = data['TargetType'];
    this.targetRange = data['TargetRange'];
    this.targetConditionId = data['TargetConditionId'];
    this.targetConditionOpts = data['TargetConditionOpts'];
    this.mechanicId = data['MechanicId'];
    this.mechanicOpts = data['MechanicOpts'];
  }

  getTargetType() {
    return this.targetType;
  }

  getTargetRange() {
    return this.targetRange;
  }

  getTargetCards() {
    return this.targetCards;
  }

  isPresentTarget(duel) {
    let cardArray = duel.utilsQuery(this.card.getControler(), this.targetRange, card => card && this.isTargetConditionCheck(card));
    if (cardArray.length == 0) {
      return false;
    }

    return true;
  }

  isTarget(duel, card) {
    let cardArray = duel.utilsQuery(this.card.getControler(), this.targetRange, card => card && this.isTargetConditionCheck(card));
    if (cardArray.length == 0) {
      return false;
    }

    return cardArray.includes(card);
  }

  isTargetConditionCheck(card) {
    if (this.targetConditionId == '') {
      return true;
    }

    let targetFn = EFFECT_TARGET_CONDITION_MAPPING[this.targetConditionId];
    return targetFn(card, this.targetConditionOpts);
  }

  hasTargetCard(targetCard) {
    return this.targetCards.indexOf(targetCard) != -1;
  }

  addTargetCard(targetCard) {
    this.targetCards.push(targetCard);
  }

  removeTargetCard(targetCard) {
    this.targetCards.splice(this.targetCards.indexOf(targetCard), 1);
  }

  apply(duel, sourceCard, targetCard) {
    let mechanicFn = EFFECT_MECHANIC_MAPPING[this.mechanicId];
    mechanicFn(duel, sourceCard, this, targetCard, this.mechanicOpts);
  }
}

module.exports.Effect = Effect;
},{"./mappings/effect_mechanic_mapping":59,"./mappings/effect_target_condition_mapping":60}],55:[function(require,module,exports){
const HAND_MAX = 6;

let PHASE = {
  DRAW: 'DRAW',
  MAIN: 'MAIN',
  BATTLE: 'BATTLE',
  END: 'END'
};

let LOCATION = {
  ONFIELD: 'ONFIELD',
  FZONE: 'FZONE',
  MZONE: 'MZONE',
  SZONE: 'SZONE',
  GRAVEYARD: 'GRAVEYARD',
  BANNISHED: 'BANNISHED',
  DECK: 'DECK',
  HAND: 'HAND'
};

let CARD_TYPE = {
  MONSTER: 'MONSTER',
  SPELL: 'SPELL'
};

let CARD_POS = {
  ATTACK: 'ATTACK',
  DEFENSE: 'DEFENSE',
  FACEUP: 'FACEUP',
  FACEDOWN: 'FACEDOWN'
};

let CARD_ELEMENT = {
  DARK: 'DARK',
  LIGHT: 'LIGHT',
  EARTH: 'EARTH',
  WIND: 'WIND',
  FIRE: 'FIRE',
  WATER: 'WATER',
  DIVINE: 'DIVINE'
};

let MONSTER_CARD_RACE = {
  AQUA: 'AQUA',
  BEAST: 'BEAST',
  BEAST_WARRIOR: 'BEAST_WARRIOR',
  DINOSAUR: 'DINOSAUR',
  FAIRY: 'FAIRY',
  FIEND: 'FIEND',
  FISH: 'FISH',
  INSECT: 'INSECT',
  MACHINE: 'MACHINE',
  PLANT: 'PLANT',
  PSYCHIC: 'PSYCHIC',
  PYRO: 'PYRO',
  REPTILE: 'REPTILE',
  SEASERPENT: 'SEASERPENT',
  SPELLCASTER: 'SPELLCASTER',
  THUNDER: 'THUNDER',
  WARRIOR: 'WARRIOR',
  WINGEDBEAST: 'WINGEDBEAST',
  ZOMBIE: 'ZOMBIE',
  WYRM: 'WYRM',
  DRAGON: 'DRAGON',
  DIVINEBEAST: 'DIVINEBEAST',
  CREATORGOD: 'CREATORGOD',
  CYBERSE: 'CYBERSE'
};

let SPELL_CARD_MODE = {
  ACTIVATE: 'ACTIVATE',
  TRIGGER: 'TRIGGER'
};

let SPELL_CARD_NATURE = {
  NORMAL: 'NORMAL',
  CONTINUOUS: 'CONTINUOUS'
};

let EFFECT_TARGET_TYPE = {
  SINGLE: 'SINGLE',
  FIELD: 'FIELD',
  NONE: 'NONE'
};

module.exports.HAND_MAX = HAND_MAX;
module.exports.PHASE = PHASE;
module.exports.LOCATION = LOCATION;
module.exports.CARD_TYPE = CARD_TYPE;
module.exports.CARD_POS = CARD_POS;
module.exports.CARD_ELEMENT = CARD_ELEMENT;
module.exports.MONSTER_CARD_RACE = MONSTER_CARD_RACE;
module.exports.SPELL_CARD_MODE = SPELL_CARD_MODE;
module.exports.SPELL_CARD_NATURE = SPELL_CARD_NATURE;
module.exports.EFFECT_TARGET_TYPE = EFFECT_TARGET_TYPE;
},{}],56:[function(require,module,exports){
// -------------------------------------------------------------------------------------------
// CARD ACTIVATE CONDITION MAPPING - (duel, card, opts)
// -------------------------------------------------------------------------------------------

const CARD_ACTIVATE_CONDITION_MAPPING = {};

CARD_ACTIVATE_CONDITION_MAPPING['IS_PRESENT_CARD_WITH_ID'] = function (duel, card, opts = { targetRange, cardId }) {
  let cards = duel.utilsQuery(card.getControler(), opts.targetRange, card => card);
  for (let card of cards) {
    if (card.getId() == opts.cardId) {
      return true;
    }
  }

  return false;
}

CARD_ACTIVATE_CONDITION_MAPPING['IS_PRESENT_CARD_WITH_TYPE'] = function (duel, card, opts = { targetRange, cardType }) {
  let cards = duel.utilsQuery(card.getControler(), opts.targetRange, card => card);
  for (let card of cards) {
    if (card.getType() == opts.cardType) {
      return true;
    }
  }

  return false;
}

module.exports.CARD_ACTIVATE_CONDITION_MAPPING = CARD_ACTIVATE_CONDITION_MAPPING;
},{}],57:[function(require,module,exports){
// -------------------------------------------------------------------------------------------
// CARD RELEASE CONDITION MAPPING - (duel, card, opts)
// -------------------------------------------------------------------------------------------

let CARD_RELEASE_CONDITION_MAPPING = {};

CARD_RELEASE_CONDITION_MAPPING['IS_ENDLESS'] = function (duel, card, opts = {}) {
  return false;
}

module.exports.CARD_RELEASE_CONDITION_MAPPING = CARD_RELEASE_CONDITION_MAPPING;
},{}],58:[function(require,module,exports){
//WARNING
// -------------------------------------------------------------------------------------------
// CARD TRIGGER CONDITION MAPPING - (duel, card, action, opts)
// -------------------------------------------------------------------------------------------

let CARD_TRIGGER_CONDITION_MAPPING = {};

CARD_TRIGGER_CONDITION_MAPPING['IS_EFFECT_CARD_MODIFIER_SET_STATE_FREEZE'] = function (duel, card, action, opts = {}) {
  return (
    action instanceof ActivateEffectInternalAction &&
    action.effect.mechanicId == 'ADD_CARD_MODIFIER' &&
    action.effect.mechanicOpts.modifierData.Type == 'SET' &&
    action.effect.mechanicOpts.modifierData.AttributeKey == 'STATE_FREEZE' &&
    action.effect.mechanicOpts.modifierData.Value == 1
  );
}

module.exports.CARD_TRIGGER_CONDITION_MAPPING = CARD_TRIGGER_CONDITION_MAPPING;
},{}],59:[function(require,module,exports){
let { Modifier } = require('../modifier');

// -------------------------------------------------------------------------------------------
// EFFECT MECHANIC MAPPING - (duel, card, effect, targetCard, opts)
// -------------------------------------------------------------------------------------------

let EFFECT_MECHANIC_MAPPING = {};

EFFECT_MECHANIC_MAPPING['NEW_TURN'] = async function (duel, card, effect, targetCard, opts = {}) {
  await duel.operationNewTurn();
}

EFFECT_MECHANIC_MAPPING['DRAW'] = async function (duel, card, effect, targetCard, opts = { numCards }) {
  await duel.operationDraw(card.getControler(), opts.numCards);
}

EFFECT_MECHANIC_MAPPING['CHANGE_PHASE'] = async function (duel, card, effect, targetCard, opts = { phaseId }) {
  await duel.operationChangePhase(opts.phaseId);
}

EFFECT_MECHANIC_MAPPING['DAMAGE_SELF'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationDamage(card.getControler(), opts.amount);
}

EFFECT_MECHANIC_MAPPING['DAMAGE_OPPONENT'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationDamage(OPPONENT_OF(card.getControler()), opts.amount);
}

EFFECT_MECHANIC_MAPPING['RESTORE_SELF'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationRestore(card.getControler(), opts.amount);
}

EFFECT_MECHANIC_MAPPING['RESTORE_OPPONENT'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationRestore(OPPONENT_OF(card.getControler()), opts.amount);
}

EFFECT_MECHANIC_MAPPING['DESTROY'] = async function (duel, card, effect, targetCard, opts = {}) {
  await duel.operationDestroy(targetCard);
}

EFFECT_MECHANIC_MAPPING['ADD_MODIFIER_TO_SELF'] = async function (duel, card, effect, targetCard, opts = { modifierData }) {
  let modifier = new Modifier();
  await modifier.loadFromData(opts.modifierData);
  modifier.setLinkedEffect(modifier.isLinked() ? effect : null);
  await duel.operationAddDuelistModifier(card.getControler(), modifier);
}

EFFECT_MECHANIC_MAPPING['ADD_CARD_MODIFIER'] = async function (duel, card, effect, targetCard, opts = { modifierData }) {
  let modifier = new Modifier();
  await modifier.loadFromData(opts.modifierData);
  modifier.setLinkedEffect(modifier.isLinked() ? effect : null);
  await duel.operationAddCardModifier(targetCard, modifier);
}

module.exports.EFFECT_MECHANIC_MAPPING = EFFECT_MECHANIC_MAPPING;

const OPPONENT_OF = (duelistIndex) => duelistIndex == 0 ? 1 : 0;
},{"../modifier":61}],60:[function(require,module,exports){
// -------------------------------------------------------------------------------------------
// EFFECT TARGET CONDITION MAPPING - (targetCard, opts)
// -------------------------------------------------------------------------------------------

let EFFECT_TARGET_CONDITION_MAPPING = {};

EFFECT_TARGET_CONDITION_MAPPING['IS_RACE'] = function (targetCard, opts = { race }) {
  return targetCard.getAttribute('RACE') == opts.race;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_TYPE'] = function (targetCard, opts = { type }) {
  return targetCard.getType() == opts.type;
}

module.exports.EFFECT_TARGET_CONDITION_MAPPING = EFFECT_TARGET_CONDITION_MAPPING;
},{}],61:[function(require,module,exports){
class Modifier {
  constructor() {
    this.id = '';
    this.type = ''; // [MUL, ADD, SUB, SET, FIN]
    this.attributeKey = '';
    this.value = 0;
    this.stackable = false;
    this.linked = false;
    this.linkedEffect = null;
  }

  async loadFromData(data) {
    this.id = data['Type'] + '_' + data['AttributeKey'];
    this.type = data['Type'];
    this.attributeKey = data['AttributeKey'];
    this.value = data['Value'];
    this.stackable = data['Stackable'];
    this.linked = data['Linked'];
  }

  getId() {
    return this.id;
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

  isStackable() {
    return this.stackable;
  }

  isLinked() {
    return this.linked;
  }

  getLinkedEffect() {
    return this.linkedEffect;
  }

  setLinkedEffect(linkedEffect) {
    this.linkedEffect = linkedEffect;
  }
}

module.exports.Modifier = Modifier;
},{}],62:[function(require,module,exports){
let { LOCATION, CARD_POS } = require('./enums');
let { CardAbstract } = require('./card_abstract');

class MonsterCard extends CardAbstract {
  constructor() {
    super(); // attributes: [RACE, ATK, DEF, ATK_COUNT, ATK_COUNT_LIMIT, STATE_FREEZE]
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  isSummonable() {
    if (this.location != LOCATION.HAND) {
      return false;
    }

    return true;
  }

  isCapableAttack() {
    if (this.location != LOCATION.MZONE) {
      return false;
    }
    if (this.position != CARD_POS.ATTACK) {
      return false;
    }
    if (this.attributes.get('ATK_COUNT') >= this.attributes.get('ATK_COUNT_LIMIT')) {
      return false;
    }

    return true;
  }

  isCapableChangePosition() {
    if (this.attributes.get('STATE_FREEZE') == 1) {
      return false;
    }

    return true;
  }
}

module.exports.MonsterCard = MonsterCard;
},{"./card_abstract":48,"./enums":55}],63:[function(require,module,exports){
class Phase {
  constructor(id, name, disabled = false) {
    this.id = id;
    this.name = name;
    this.disabled = disabled;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  isDisabled() {
    return this.disabled;
  }

  setDisabled(disabled) {
    this.disabled = disabled;
  }
}

module.exports.Phase = Phase;
},{}],64:[function(require,module,exports){
let { SPELL_CARD_MODE, SPELL_CARD_NATURE, LOCATION, CARD_POS } = require('./enums');
let { CARD_ACTIVATE_CONDITION_MAPPING } = require('./mappings/card_activate_condition_mapping');
let { CARD_TRIGGER_CONDITION_MAPPING } = require('./mappings/card_trigger_condition_mapping');
let { CARD_RELEASE_CONDITION_MAPPING } = require('./mappings/card_release_condition_mapping');
let { CardAbstract } = require('./card_abstract');
let { Effect } = require('./effect');

class SpellCard extends CardAbstract {
  constructor() {
    super();
    this.mode = '';
    this.nature = '';
    this.activateConditionId = '';
    this.activateConditionOpts = {};
    this.triggerConditionId = '';
    this.triggerConditionOpts = {};
    this.releaseConditionId = '';
    this.releaseConditionOpts = {};
    this.effects = [];
  }

  async loadFromData(data) {
    this.mode = data['Mode'];
    this.nature = data['Nature'];

    if (data.hasOwnProperty('ActivateConditionId')) {
      this.activateConditionId = data['ActivateConditionId'];
      this.activateConditionOpts = data['ActivateConditionOpts'];
    }

    if (data.hasOwnProperty('TriggerConditionId')) {
      this.triggerConditionId = data['TriggerConditionId'];
      this.triggerConditionOpts = data['TriggerConditionOpts'];
    }

    if (data.hasOwnProperty('ReleaseConditionId')) {
      this.releaseConditionId = data['ReleaseConditionId'];
      this.releaseConditionOpts = data['ReleaseConditionOpts'];
    }

    for (let obj of data['Effects']) {
      let effect = new Effect(this);
      await effect.loadFromData(obj);
      this.effects.push(effect);
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getMode() {
    return this.mode;
  }

  getNature() {
    return this.nature;
  }

  getEffects() {
    return this.effects;
  }

  isSetable() {
    if (this.location != LOCATION.HAND) {
      return false;
    }

    return true;
  }

  isActiveatable(duel) {
    if (this.mode != SPELL_CARD_MODE.ACTIVATE) {
      return false;
    }
    if (this.location != LOCATION.SZONE) {
      return false;
    }
    if (this.position != CARD_POS.FACEDOWN) {
      return false;
    }

    for (let effect of this.effects) {
      if (!effect.isPresentTarget(duel)) {
        return false;
      }
    }

    return this.isActivateConditionCheck(duel);
  }

  isTriggerable(duel, action) {
    if (this.mode != SPELL_CARD_MODE.TRIGGER) {
      return false;
    }
    if (this.location != LOCATION.SZONE) {
      return false;
    }
    if (this.position != CARD_POS.FACEDOWN) {
      return false;
    }

    for (let effect of this.effects) {
      if (!effect.isPresentTarget(duel)) {
        return false;
      }
    }

    return this.isTriggerConditionCheck(action);
  }

  isReleasable(duel) {
    if (this.nature != SPELL_CARD_NATURE.CONTINUOUS) {
      return false;
    }
    if (this.location != LOCATION.SZONE) {
      return false;
    }
    if (this.position != CARD_POS.FACEUP) {
      return false;
    }

    return this.isReleaseConditionCheck(duel);
  }

  isActivateConditionCheck(duel) {
    if (this.activateConditionId == '') {
      return true;
    }

    let activateConditionFn = CARD_ACTIVATE_CONDITION_MAPPING[this.activateConditionId];
    return activateConditionFn(duel, this, this.activateConditionOpts);
  }

  isTriggerConditionCheck(duel, action) {
    if (this.triggerConditionId == '') {
      return true;
    }

    let triggerConditionFn = CARD_TRIGGER_CONDITION_MAPPING[this.triggerConditionId];
    return triggerConditionFn(duel, this, action, this.triggerConditionOpts);
  }

  isReleaseConditionCheck(duel) {
    if (this.releaseConditionId == '') {
      return true;
    }

    let releaseConditionFn = CARD_RELEASE_CONDITION_MAPPING[this.releaseConditionId];
    return releaseConditionFn(duel, this, this.releaseConditionOpts);
  }
}

module.exports.SpellCard = SpellCard;
},{"./card_abstract":48,"./effect":54,"./enums":55,"./mappings/card_activate_condition_mapping":56,"./mappings/card_release_condition_mapping":57,"./mappings/card_trigger_condition_mapping":58}],65:[function(require,module,exports){
class Turn {
  constructor() {
    this.phases = [];
    this.currentPhase = null;
  }

  getPhases() {
    return this.phases;
  }

  getPhase(id) {
    return this.phases.find(phase => phase.id == id);
  }

  addPhase(phase) {
    this.phases.push(phase);
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  setCurrentPhase(currentPhase) {
    this.currentPhase = currentPhase;
  }
}

module.exports.Turn = Turn;
},{}],66:[function(require,module,exports){
class Zone extends Array {
  constructor(location) {
    super();
    this.location = location;
  }

  getLocation() {
    return this.location;
  }
}

module.exports.Zone = Zone;
},{}],67:[function(require,module,exports){
let { GWE } = require('gwe');
let { GameScreen } = require('./game_screen');

class BootScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.uiMenu = new GWE.UIMenu();
  }

  async onEnter() {
    this.uiMenu.addWidget(new GWE.UIMenuItemText({ text: 'Commencer' }));
    GWE.uiManager.addWidget(this.uiMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)');
    GWE.uiManager.focus(this.uiMenu);

    GWE.eventManager.subscribe(this.uiMenu, 'E_MENU_ITEM_SELECTED', this, this.handleMenuItemSelected);
  }

  async onExit() {
    GWE.uiManager.removeWidget(this.uiMenu);
  }

  handleMenuItemSelected(data) {
    if (data.index == 0) {
      GWE.screenManager.requestSetScreen(new GameScreen(this.app), { duelId: 'duel_0000' });
    }
  }
}

module.exports.BootScreen = BootScreen;
},{"./game_screen":68,"gwe":23}],68:[function(require,module,exports){
let { GWE } = require('gwe');
let { Duel } = require('../core/duel');
let { HumanDuelist } = require('../core/duelist');
let { DrawCommand, SummonCommand, SetCommand, ChangePositionCommand, BattleCommand, NextPhaseCommand, ActivateCommand } = require('../core/duel_commands');
let { UITurn } = require('../ui/ui_turn');
let { UIDuelist } = require('../ui/ui_duelist');
let { UICardDetail } = require('../ui/ui_card_detail');
let { UIBoard } = require('../ui/ui_board');
let { UICardSlot } = require('../ui/ui_card_slot');

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.duel = new Duel();
    this.uiTopBgNode = document.createElement('img');
    this.uiBottomBgNode = document.createElement('img');
    this.uiTurn = new UITurn();
    this.uiDuelists = [];
    this.uiCardDetail = new UICardDetail();
    this.uiBoard = new UIBoard();
    this.uiActionMenu = new GWE.UIMenu();
  }

  async onEnter(args) {
    await this.duel.loadFromFile('assets/models/' + args.duelId + '/data.json');

    this.uiTopBgNode.src = 'assets/textures/bg_top.png';
    GWE.uiManager.addNode(this.uiTopBgNode, 'position:absolute; top:0; right:0; bottom:50%; left:0;');

    this.uiBottomBgNode.src = 'assets/textures/bg_bottom.png';
    GWE.uiManager.addNode(this.uiBottomBgNode, 'position:absolute; top:50%; right:0; bottom:0; left:0;');

    this.uiTurn.setDuel(this.duel);
    GWE.uiManager.addWidget(this.uiTurn, 'position: absolute; top:0; left:0; right:0; line-height:30px; z-index:100');

    this.uiDuelists.push(new UIDuelist());
    this.uiDuelists[0].setDuelist(this.duel.getDuelist(0));
    GWE.uiManager.addWidget(this.uiDuelists[0], 'position:absolute; top:30px; left:0; width:20%');

    this.uiDuelists.push(new UIDuelist());
    this.uiDuelists[1].setDuelist(this.duel.getDuelist(1));
    GWE.uiManager.addWidget(this.uiDuelists[1], 'position:absolute; top:30px; right:0; width:20%');

    GWE.uiManager.addWidget(this.uiCardDetail, 'position: absolute; top:30px; left:20%; width:60%');

    this.uiBoard.setDuel(this.duel);
    GWE.uiManager.addWidget(this.uiBoard, 'position:absolute; top:50%; left:0; right:0; width:100%; height:50%');
    GWE.uiManager.focus(this.uiBoard);

    this.uiActionMenu.setVisible(false);
    GWE.uiManager.addWidget(this.uiActionMenu, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:20;');

    GWE.eventManager.subscribe(this.duel, 'E_NEW_TURN', this, this.handleDuelNewTurn);
    GWE.eventManager.subscribe(this.duel, 'E_SELECT_LOCATION', this, this.handleDuelSelectLocation);
    GWE.eventManager.subscribe(this.uiDuelists[0], 'E_ENTER_PRESSED', this, this.handleDuelistEnterPressed);
    GWE.eventManager.subscribe(this.uiDuelists[0], 'E_SPACE_PRESSED', this, this.handleDuelistSpacePressed);
    GWE.eventManager.subscribe(this.uiDuelists[1], 'E_ENTER_PRESSED', this, this.handleDuelistEnterPressed);
    GWE.eventManager.subscribe(this.uiDuelists[1], 'E_SPACE_PRESSED', this, this.handleDuelistSpacePressed);
    GWE.eventManager.subscribe(this.uiBoard, 'E_SLOT_UNFOCUSED', this, this.handleBoardSlotUnfocused);
    GWE.eventManager.subscribe(this.uiBoard, 'E_SLOT_FOCUSED', this, this.handleBoardSlotFocused);
    GWE.eventManager.subscribe(this.uiActionMenu, 'E_CLOSED', this, this.handleActionMenuClosed);
    GWE.eventManager.subscribe(this.uiActionMenu, 'E_MENU_ITEM_SELECTED', this, this.handleActionMenuItemSelected);

    this.duel.startup();
  }

  async onExit() {
    GWE.uiManager.removeNode(this.uiTopBgNode);
    GWE.uiManager.removeNode(this.uiBottomBgNode);
    GWE.uiManager.removeWidget(this.uiTurn);
    GWE.uiManager.removeWidget(this.uiDuelists[0]);
    GWE.uiManager.removeWidget(this.uiDuelists[1]);
    GWE.uiManager.removeWidget(this.uiCardDetail);
    GWE.uiManager.removeWidget(this.uiBoard);
    GWE.uiManager.removeWidget(this.uiActionMenu);
  }

  handleDuelNewTurn() {
    this.uiDuelists[this.duel.getOpponentDuelistIndex()].hideSelection();
    this.uiDuelists[this.duel.getCurrentDuelistIndex()].showSelection();

    if (this.duel.getCurrentDuelist() instanceof HumanDuelist) {
      GWE.uiManager.focus(this.uiDuelists[this.duel.getCurrentDuelistIndex()]);
    }
  }

  handleDuelSelectLocation({ range, predicateCard, required, response }) {
    return new Promise(resolve => {
      GWE.uiManager.focus(this.uiBoard);

      for (let slot of this.uiBoard.getSlots()) {
        for (let i = 0; i < 2; i++) {
          let duelistIndex = i == 0 ? this.duel.getCurrentDuelistIndex() : this.duel.getOpponentDuelistIndex();
          if (range[i] != 0 && slot.getDuelistIndex() == duelistIndex && range[i].includes(slot.getLocation()) && predicateCard(slot.getCard())) {
            slot.setSelectable(true);
          }
        }
      }

      if (!required) {
        GWE.eventManager.subscribe(this.uiBoard, 'E_ECHAP_PRESSED', this, () => {
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ECHAP_PRESSED', this);
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ENTER_PRESSED', this);
          this.uiBoard.getSlots().forEach(slot => slot.setSelectable(false));
          response.state = false;
          resolve();
        });
      }

      GWE.eventManager.subscribe(this.uiBoard, 'E_ENTER_PRESSED', this, () => {
        let focusedSlot = this.uiBoard.getFocusedSlot();
        if (focusedSlot.isSelectable()) {
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ECHAP_PRESSED', this);
          GWE.eventManager.unsubscribe(this.uiBoard, 'E_ENTER_PRESSED', this);
          this.uiBoard.getSlots().forEach(slot => slot.setSelectable(false));
          GWE.uiManager.unfocus();
          response.state = true;
          response.location = focusedSlot.getLocation();
          response.index = focusedSlot.getIndex();
          response.card = focusedSlot.getCard();
          resolve();
        }
      });
    });
  }

  handleBoardSlotUnfocused() {
    this.uiCardDetail.setCard(null);
  }

  handleBoardSlotFocused(data) {
    if (data.slot instanceof UICardSlot && data.slot.getCard() && data.slot.isHidden() == false) {
      this.uiCardDetail.setCard(data.slot.getCard());
    }
    else {
      this.uiCardDetail.setCard(null);
    }
  }

  handleDuelistEnterPressed() {
    this.uiActionMenu.clear();

    let drawCmd = new DrawCommand(this.duel);
    if (drawCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('DRAW');
      item.setText('Piocher');
      this.uiActionMenu.addWidget(item);
    }

    let summonCmd = new SummonCommand(this.duel);
    if (summonCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('SUMMON');
      item.setText('Invoquer');
      this.uiActionMenu.addWidget(item);
    }

    let setCmd = new SetCommand(this.duel);
    if (setCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('SET');
      item.setText('Poser');
      this.uiActionMenu.addWidget(item);
    }

    let battleCmd = new BattleCommand(this.duel);
    if (battleCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('BATTLE');
      item.setText('Attaquer');
      this.uiActionMenu.addWidget(item);
    }

    let activateCmd = new ActivateCommand(this.duel);
    if (activateCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('ACTIVATE');
      item.setText('Activer');
      this.uiActionMenu.addWidget(item);
    }

    let changePositionCmd = new ChangePositionCommand(this.duel);
    if (changePositionCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('CHANGE_POSITION');
      item.setText('Changer de position');
      this.uiActionMenu.addWidget(item);
    }

    let nextPhaseCmd = new NextPhaseCommand(this.duel);
    if (nextPhaseCmd.isConditionCheck()) {
      let item = new GWE.UIMenuItemText();
      item.setId('NEXT_PHASE');
      item.setText('Phase suivante');
      this.uiActionMenu.addWidget(item);
    }

    this.uiActionMenu.setVisible(true);
    GWE.uiManager.focus(this.uiActionMenu);
  }

  async handleDuelistSpacePressed() {
    GWE.uiManager.focus(this.uiBoard);
    await GWE.eventManager.wait(this.uiBoard, 'E_ECHAP_PRESSED');
    GWE.uiManager.focus(this.uiDuelists[this.duel.getCurrentDuelistIndex()]);
  }

  handleActionMenuClosed() {
    this.uiActionMenu.setVisible(false);
    GWE.uiManager.focus(this.uiDuelists[this.duel.getCurrentDuelistIndex()]);
  }

  async handleActionMenuItemSelected(data) {
    this.uiActionMenu.setVisible(false);

    if (data.widget.getId() == 'DRAW') {
      let cmd = new DrawCommand(this.duel, 1);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'SUMMON') {
      let cmd = new SummonCommand(this.duel);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'SET') {
      let cmd = new SetCommand(this.duel);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'BATTLE') {
      let cmd = new BattleCommand(this.duel);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'ACTIVATE') {
      let cmd = new ActivateCommand(this.duel);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'CHANGE_POSITION') {
      let cmd = new ChangePositionCommand(this.duel);
      await cmd.exec();
    }
    else if (data.widget.getId() == 'NEXT_PHASE') {
      let cmd = new NextPhaseCommand(this.duel);
      await cmd.exec();
    }

    GWE.uiManager.focus(this.uiDuelists[this.duel.getCurrentDuelistIndex()]);
  }
}

module.exports.GameScreen = GameScreen;
},{"../core/duel":50,"../core/duel_commands":52,"../core/duelist":53,"../ui/ui_board":69,"../ui/ui_card_detail":70,"../ui/ui_card_slot":71,"../ui/ui_duelist":72,"../ui/ui_turn":74,"gwe":23}],69:[function(require,module,exports){
const { GWE } = require("gwe");
let { LOCATION } = require('../core/enums');
let { UICardSlot } = require('./ui_card_slot');
let { UIStackSlot } = require('./ui_stack_slot');

class UIBoard extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBoard',
      template: `
      <div class="UIBoard-fields">
        <div class="UIBoard-field" data-duelist-index="0">
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="FZONE" style="top:150px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="GRAVEYARD" style="top:80px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="DECK" style="top:10px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="HAND" style="top:10px; right:10px;"></div>
        </div>
        <div class="UIBoard-field" data-duelist-index="1">
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="FZONE" style="bottom:150px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="GRAVEYARD" style="bottom:80px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="DECK" style="bottom:10px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="HAND" style="bottom:10px; left:10px;"></div>
        </div>
      </div>`
    });

    this.duel = null;
    this.slots = [];
    this.focusedSlot = null;

    let spellSlot00 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 0, false);
    let spellZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[0];
    spellZone00.appendChild(spellSlot00.node);
    this.slots.push(spellSlot00);
  
    let spellSlot01 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 1, false);
    let spellZone01 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[1];
    spellZone01.appendChild(spellSlot01.node);
    this.slots.push(spellSlot01);
  
    let spellSlot02 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 2, false);
    let spellZone02 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[2];
    spellZone02.appendChild(spellSlot02.node);
    this.slots.push(spellSlot02);
  
    let monsterSlot00 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 0, false);
    let monsterZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[0];
    monsterZone00.appendChild(monsterSlot00.node);
    this.slots.push(monsterSlot00);
  
    let monsterSlot01 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 1, false);
    let monsterZone01 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[1];
    monsterZone01.appendChild(monsterSlot01.node);
    this.slots.push(monsterSlot01);
  
    let monsterSlot02 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 2, false);
    let monsterZone02 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[2];
    monsterZone02.appendChild(monsterSlot02.node);
    this.slots.push(monsterSlot02);
  
    let handSlot00 = CREATE_CARD_SLOT(0, LOCATION.HAND, 0, true);
    let handZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="HAND"]`)[0];
    handZone00.appendChild(handSlot00.node);
    this.slots.push(handSlot00);
  
    let handSlot01 = CREATE_CARD_SLOT(0, LOCATION.HAND, 1, true);
    handZone00.appendChild(handSlot01.node);
    this.slots.push(handSlot01);
  
    let handSlot02 = CREATE_CARD_SLOT(0, LOCATION.HAND, 2, true);
    handZone00.appendChild(handSlot02.node);
    this.slots.push(handSlot02);
  
    let handSlot03 = CREATE_CARD_SLOT(0, LOCATION.HAND, 3, true);
    handZone00.appendChild(handSlot03.node);
    this.slots.push(handSlot03);
  
    let handSlot04 = CREATE_CARD_SLOT(0, LOCATION.HAND, 4, true);
    handZone00.appendChild(handSlot04.node);
    this.slots.push(handSlot04);
  
    let handSlot05 = CREATE_CARD_SLOT(0, LOCATION.HAND, 5, true);
    handZone00.appendChild(handSlot05.node);
    this.slots.push(handSlot05);
  
    let fieldSlot00 = CREATE_CARD_SLOT(0, LOCATION.FZONE, 0, false);
    let fieldZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="FZONE"]`)[0];
    fieldZone00.appendChild(fieldSlot00.node);
    this.slots.push(fieldSlot00);
  
    let graveyardSlot00 = CREATE_STACK_SLOT(0, LOCATION.GRAVEYARD, false);
    let graveyardZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="GRAVEYARD"]`)[0];
    graveyardZone00.appendChild(graveyardSlot00.node);
    this.slots.push(graveyardSlot00);
  
    let deckSlot00 = CREATE_STACK_SLOT(0, LOCATION.DECK, true);
    let deckZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="DECK"]`)[0];
    deckZone00.appendChild(deckSlot00.node);
    this.slots.push(deckSlot00);
  
    // ----------------------------------------------------------------------------------------------------------------------------
  
    let spellSlot10 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 0, false);
    let spellZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[0];
    spellZone10.appendChild(spellSlot10.node);
    this.slots.push(spellSlot10);
  
    let spellSlot11 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 1, false);
    let spellZone11 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[1];
    spellZone11.appendChild(spellSlot11.node);
    this.slots.push(spellSlot11);
  
    let spellSlot12 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 2, false);
    let spellZone12 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[2];
    spellZone12.appendChild(spellSlot12.node);
    this.slots.push(spellSlot12);
  
    let monsterSlot10 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 0, false);
    let monsterZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[0];
    monsterZone10.appendChild(monsterSlot10.node);
    this.slots.push(monsterSlot10);
  
    let monsterSlot11 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 1, false);
    let monsterZone11 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[1];
    monsterZone11.appendChild(monsterSlot11.node);
    this.slots.push(monsterSlot11);
  
    let monsterSlot12 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 2, false);
    let monsterZone12 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[2];
    monsterZone12.appendChild(monsterSlot12.node);
    this.slots.push(monsterSlot12);
  
    let handSlot10 = CREATE_CARD_SLOT(1, LOCATION.HAND, 0, false);
    let handZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="HAND"]`)[0];
    handZone10.appendChild(handSlot10.node);
    this.slots.push(handSlot10);
  
    let handSlot11 = CREATE_CARD_SLOT(1, LOCATION.HAND, 1, false);
    handZone10.appendChild(handSlot11.node);
    this.slots.push(handSlot11);
  
    let handSlot12 = CREATE_CARD_SLOT(1, LOCATION.HAND, 2, false);
    handZone10.appendChild(handSlot12.node);
    this.slots.push(handSlot12);
  
    let handSlot13 = CREATE_CARD_SLOT(1, LOCATION.HAND, 3, false);
    handZone10.appendChild(handSlot13.node);
    this.slots.push(handSlot13);
  
    let handSlot14 = CREATE_CARD_SLOT(1, LOCATION.HAND, 4, false);
    handZone10.appendChild(handSlot14.node);
    this.slots.push(handSlot14);
  
    let handSlot15 = CREATE_CARD_SLOT(1, LOCATION.HAND, 5, false);
    handZone10.appendChild(handSlot15.node);
    this.slots.push(handSlot15);
  
    let fieldSlot10 = CREATE_CARD_SLOT(1, LOCATION.FZONE, 0, false);
    let fieldZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="FZONE"]`)[0];
    fieldZone10.appendChild(fieldSlot10.node);
    this.slots.push(fieldSlot10);
  
    let graveyardSlot10 = CREATE_STACK_SLOT(1, LOCATION.GRAVEYARD, false);
    let graveyardZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="GRAVEYARD"]`)[0];
    graveyardZone10.appendChild(graveyardSlot10.node);
    this.slots.push(graveyardSlot10);
  
    let deckSlot10 = CREATE_STACK_SLOT(1, LOCATION.DECK, false);
    let deckZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="DECK"]`)[0];
    deckZone10.appendChild(deckSlot10.node);
    this.slots.push(deckSlot10);

    this.focusedSlot = deckSlot00;
  }

  update() {
    if (this.duel) {
      for (let slot of this.slots) {
        let duelist = this.duel.getDuelist(slot.getDuelistIndex());
        if (slot instanceof UICardSlot) {
          slot.setCard(duelist.getCard(slot.getLocation(), slot.getIndex()));
        }
        else {
          slot.setCards(duelist.getZone(slot.getLocation()));
        }
      }

      for (let slot of this.slots) {
        slot.update();
      }
    }
  }

  delete() {
    for (let slot of this.slots) slot.delete();
    super.delete();
  }

  focus() {
    if (this.focusedSlot) {
      this.focusedSlot.focus();
      GWE.eventManager.emit(this, 'E_SLOT_FOCUSED', { slot: this.focusedSlot });
    }

    super.focus();
  }

  unfocus() {
    if (this.focusedSlot) {
      this.focusedSlot.unfocus();
      GWE.eventManager.emit(this, 'E_SLOT_UNFOCUSED');
    }

    super.unfocus();
  }

  getSlots() {
    return this.slots;
  }

  getFocusedSlot() {
    return this.focusedSlot;
  }

  setDuel(duel) {
    for (let slot of this.slots) {
      if (slot instanceof UICardSlot) slot.setCard(null);
      else if (slot instanceof UIStackSlot) slot.setCards(null);
    }

    this.duel = duel ? duel : null;
  }

  focusSlot(slot, emit = true) {
    if (this.focusedSlot) {
      this.focusedSlot.unfocus();
    }

    slot.focus();
    this.focusedSlot = slot;

    if (emit) {
      GWE.eventManager.emit(this, 'E_SLOT_FOCUSED', { slot: this.focusedSlot });
    }
  }

  unfocusSlot(emit = true) {
    if (!this.focusedSlot) {
      return;
    }

    this.focusedSlot.unfocus();
    this.focusedSlot = null;

    if (emit) {
      GWE.eventManager.emit(this, 'E_SLOT_UNFOCUSED');
    }
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.eventManager.emit(this, 'E_ECHAP_PRESSED');
    }
    else if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'ArrowUp') {
      this.utilsNextFocus('UP');
    }
    else if (e.key == 'ArrowDown') {
      this.utilsNextFocus('DOWN');
    }
    else if (e.key == 'ArrowLeft') {
      this.utilsNextFocus('LEFT');
    }
    else if (e.key == 'ArrowRight') {
      this.utilsNextFocus('RIGHT');
    }
  }

  utilsNextFocus(direction /*UP|RIGHT|DOWN|LEFT*/) {
    let rect = this.focusedSlot.getNode().getBoundingClientRect();
    let centerX = rect.x + (rect.width * 0.5);
    let centerY = rect.y + (rect.height * 0.5);

    // let slots = this.slots.slice();
    let closestSlots = this.slots.sort((a, b) => {
      let rectA = a.getNode().getBoundingClientRect();
      let rectB = b.getNode().getBoundingClientRect();

      let centerAX = rectA.x + (rectA.width * 0.5);
      let centerAY = rectA.y + (rectA.height * 0.5);
      let centerBX = rectB.x + (rectB.width * 0.5);
      let centerBY = rectB.y + (rectB.height * 0.5);

      let deltaAX = centerX - centerAX;
      let deltaAY = centerY - centerAY;
      let deltaBX = centerX - centerBX;
      let deltaBY = centerY - centerBY;

      let deltaA = Math.sqrt((deltaAX * deltaAX) + (deltaAY * deltaAY));
      let deltaB = Math.sqrt((deltaBX * deltaBX) + (deltaBY * deltaBY));
      return deltaA - deltaB;
    });

    if (direction == 'UP') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.bottom <= centerY;
      });
    }
    else if (direction == 'RIGHT') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.left >= centerX;
      });
    }
    else if (direction == 'DOWN') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.top >= centerY;
      });
    }
    else if (direction == 'LEFT') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.right <= centerX;
      });
    }

    if (closestSlots.length == 0) {
      return;
    }

    this.focusSlot(closestSlots[0], true);
  }
}

module.exports.UIBoard = UIBoard;

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CREATE_CARD_SLOT(duelistIndex, location, index, hidden) {
  let slot = new UICardSlot();
  slot.setDuelistIndex(duelistIndex);
  slot.setLocation(location);
  slot.setIndex(index);
  slot.setHidden(hidden);
  return slot;
}

function CREATE_STACK_SLOT(duelistIndex, location, hidden) {
  let slot = new UIStackSlot();
  slot.setDuelistIndex(duelistIndex);
  slot.setLocation(location);
  slot.setHidden(hidden);
  return slot;
}
},{"../core/enums":55,"./ui_card_slot":71,"./ui_stack_slot":73,"gwe":23}],70:[function(require,module,exports){
let { GWE } = require('gwe');
let { CARD_TYPE, CARD_ELEMENT, SPELL_CARD_NATURE, SPELL_CARD_MODE, MONSTER_CARD_RACE } = require('../core/enums');

class UICardDetail extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UICardDetail',
      template: `
      <div class="UICardDetail-title js-title"></div>
      <div class="UICardDetail-body">
        <img class="UICardDetail-body-coverImg js-cover-img">
        <div class="UICardDetail-body-infos js-infos"></div>
      </div>`
    });

    this.card = null;
  }

  update() {
    if (this.card) {
      this.node.querySelector('.js-title').textContent = this.card.getName();
      this.node.querySelector('.js-cover-img').src = this.card.getCoverFile();
      this.node.querySelector('.js-infos').textContent = '';

      if (this.card.getType() == CARD_TYPE.MONSTER) {
        this.node.querySelector('.js-infos').textContent += 'Type: MONSTRE\n';
      }
      else if (this.card.getType() == CARD_TYPE.SPELL) {
        this.node.querySelector('.js-infos').textContent += 'Type: MAGIE\n';
      }

      if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.DARK) {
        this.node.querySelector('.js-infos').textContent += 'Element: TENEBRE\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.LIGHT) {
        this.node.querySelector('.js-infos').textContent += 'Element: LUMIERE\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.EARTH) {
        this.node.querySelector('.js-infos').textContent += 'Element: TERRE\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.WIND) {
        this.node.querySelector('.js-infos').textContent += 'Element: VENT\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.FIRE) {
        this.node.querySelector('.js-infos').textContent += 'Element: FEU\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.WATER) {
        this.node.querySelector('.js-infos').textContent += 'Element: EAU\n';
      }
      else if (this.card.getAttribute('ELEMENT') == CARD_ELEMENT.DIVINE) {
        this.node.querySelector('.js-infos').textContent += 'Element: DIVIN\n';
      }

      if (this.card.getType() == CARD_TYPE.SPELL && this.card.getNature() == SPELL_CARD_NATURE.NORMAL) {
        this.node.querySelector('.js-infos').textContent += 'Nature: NORMAL\n';
      }
      else if (this.card.getType() == CARD_TYPE.SPELL && this.card.getNature() == SPELL_CARD_NATURE.CONTINUOUS) {
        this.node.querySelector('.js-infos').textContent += 'Nature: CONTINUE\n';
      }

      if (this.card.getType() == CARD_TYPE.SPELL && this.card.getMode() == SPELL_CARD_MODE.ACTIVATE) {
        this.node.querySelector('.js-infos').textContent += 'Mode: ACTIVATION\n';
      }
      else if (this.card.getType() == CARD_TYPE.SPELL && this.card.getMode() == SPELL_CARD_MODE.TRIGGER) {
        this.node.querySelector('.js-infos').textContent += 'Mode: PIEGE\n';
      }

      if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.AQUA) {
        this.node.querySelector('.js-infos').textContent += 'Race: AQUA\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.BEAST) {
        this.node.querySelector('.js-infos').textContent += 'Race: BETE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.BEAST_WARRIOR) {
        this.node.querySelector('.js-infos').textContent += 'Race: BETE GUERRIERE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.DINOSAUR) {
        this.node.querySelector('.js-infos').textContent += 'Race: DINOSAURE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.FAIRY) {
        this.node.querySelector('.js-infos').textContent += 'Race: FEE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.FIEND) {
        this.node.querySelector('.js-infos').textContent += 'Race: DEMON\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.FISH) {
        this.node.querySelector('.js-infos').textContent += 'Race: POISSON\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.INSECT) {
        this.node.querySelector('.js-infos').textContent += 'Race: INSECTE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.MACHINE) {
        this.node.querySelector('.js-infos').textContent += 'Race: MACHINE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.PLANT) {
        this.node.querySelector('.js-infos').textContent += 'Race: PLANTE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.PSYCHIC) {
        this.node.querySelector('.js-infos').textContent += 'Race: PSYCHIQUE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.PYRO) {
        this.node.querySelector('.js-infos').textContent += 'Race: PYRO\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.REPTILE) {
        this.node.querySelector('.js-infos').textContent += 'Race: REPTILE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.SEASERPENT) {
        this.node.querySelector('.js-infos').textContent += 'Race: SERPENT DE MER\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.SPELLCASTER) {
        this.node.querySelector('.js-infos').textContent += 'Race: MAGICIEN\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.THUNDER) {
        this.node.querySelector('.js-infos').textContent += 'Race: ECLAIR\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.WARRIOR) {
        this.node.querySelector('.js-infos').textContent += 'Race: GUERRIER\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.WINGEDBEAST) {
        this.node.querySelector('.js-infos').textContent += 'Race: BETE AILEE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.ZOMBIE) {
        this.node.querySelector('.js-infos').textContent += 'Race: ZOMBIE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.WYRM) {
        this.node.querySelector('.js-infos').textContent += 'Race: WYRM\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.DRAGON) {
        this.node.querySelector('.js-infos').textContent += 'Race: DRAGON\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.DIVINEBEAST) {
        this.node.querySelector('.js-infos').textContent += 'Race: DIVINITE\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.CREATORGOD) {
        this.node.querySelector('.js-infos').textContent += 'Race: DIEU CREATEUR\n';
      }
      else if (this.card.getType() == CARD_TYPE.MONSTER && this.card.getAttribute('RACE') == MONSTER_CARD_RACE.CYBERSE) {
        this.node.querySelector('.js-infos').textContent += 'Race: CYBORG\n';
      }

      this.node.querySelector('.js-infos').textContent += 'Description: ' + this.card.getText() + '\n';

      if (this.card.getType() == CARD_TYPE.MONSTER) {
        this.node.querySelector('.js-infos').innerHTML += `
        <div class="UICardDetail-body-infos-stats">
          <div class="UICardDetail-body-infos-stats-item">ATK ${this.card.getAttribute('ATK')}</div>
          <div class="UICardDetail-body-infos-stats-item">DEF ${this.card.getAttribute('DEF')}</div>
        </div>`;
      }
    }
    else {
      this.node.querySelector('.js-title').textContent = '--';
      this.node.querySelector('.js-cover-img').src = '';
      this.node.querySelector('.js-infos').textContent = '';
    }
  }

  setCard(card) {
    this.card = card ? card : null;
  }
}

module.exports.UICardDetail = UICardDetail;
},{"../core/enums":55,"gwe":23}],71:[function(require,module,exports){
let { GWE } = require('gwe');
let { CARD_POS } = require('../core/enums');

class UICardSlot extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UICardSlot',
      template: `
      <div class="UICardSlot-bg js-bg"></div>`
    });

    this.card = null;
    this.duelistIndex = 0;
    this.location = '';
    this.index = 0;
    this.hidden = false;
    this.selectable = false;
  }

  update() {
    if (this.card) {
      this.node.style.transform = `rotate(${this.card.getPosition() == CARD_POS.DEFENSE ? '90deg' : '0deg'})`;
      this.node.querySelector('.js-bg').style.backgroundImage = this.hidden ? 'url(assets/textures/card_back.png)' : 'url(' + this.card.getCoverFile() + ')';
    }
    else {
      this.node.style.transform = 'rotate(0deg)';
      this.node.querySelector('.js-bg').style.backgroundImage = 'url()';
    }
  }

  getCard() {
    return this.card;
  }

  setCard(card) {
    this.card = card ? card : null;
  }

  getDuelistIndex() {
    return this.duelistIndex;
  }

  setDuelistIndex(duelistIndex) {
    this.duelistIndex = duelistIndex;
  }

  getLocation() {
    return this.location;
  }

  setLocation(location) {
    this.location = location;
  }

  getIndex() {
    return this.index;
  }

  setIndex(index) {
    this.index = index;
  }

  isHidden() {
    return this.hidden;
  }

  setHidden(hidden) {
    this.hidden = hidden;
  }

  isSelectable() {
    return this.node.classList.contains('u-selectable');
  }

  setSelectable(selectable) {
    this.node.classList.toggle('u-selectable', selectable);
  }
}

module.exports.UICardSlot = UICardSlot;
},{"../core/enums":55,"gwe":23}],72:[function(require,module,exports){
let { GWE } = require('gwe');

class UIDuelist extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIDuelist',
      template: `
      <div class="UIDuelist-picture js-picture"></div>
      <div class="UIDuelist-infos">
        <div class="UIDuelist-infos-name js-name"></div>
        <div class="UIDuelist-infos-lifepoints js-lifepoints"></div>
      </div>`
    });

    this.duelist = null;
  }

  update() {
    if (this.duelist) {
      this.node.querySelector('.js-picture').style.backgroundImage = `url(${this.duelist.getPictureFile()})`;
      this.node.querySelector('.js-name').textContent = this.duelist.getName();
      this.node.querySelector('.js-lifepoints').textContent = this.duelist.getAttribute('LIFEPOINTS');
    }
    else {
      this.node.querySelector('.js-picture').style.backgroundImage = 'url()';
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-lifepoints').textContent = '0';
    }
  }

  setDuelist(duelist) {
    GWE.eventManager.unsubscribe(this.duelist, 'E_DAMAGE', this);
    GWE.eventManager.unsubscribe(this.duelist, 'E_RESTORE', this);

    if (duelist) {
      GWE.eventManager.subscribe(duelist, 'E_DAMAGE', this, this.handleDuelistDamage);
      GWE.eventManager.subscribe(duelist, 'E_RESTORE', this, this.handleDuelistRestore);
      this.duelist = duelist;
    }
    else {
      this.duelist = null;
    }
  }

  showSelection() {
    this.node.classList.add('u-showSelection');
  }

  hideSelection() {
    this.node.classList.remove('u-showSelection');
  }

  handleDuelistDamage(data) {
    DRAW_TOAST(this.node, '-' + data.amount, '#fff', 1000);
    SHAKE(this.node, 300);
  }

  handleDuelistRestore(data) {
    DRAW_TOAST(this.node, '+' + data.amount, '#fff', 1000);
  }

  onKeyDown(e) {
    if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'Space') {
      GWE.eventManager.emit(this, 'E_SPACE_PRESSED');
    }
  }
}

module.exports.UIDuelist = UIDuelist;

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
    toast.className = 'UIDuelist-toast';
    toast.textContent = text;
    toast.style.color = color;
    node.appendChild(toast);
    setTimeout(() => { toast.remove(); resolve(); }, ms);
  });
}
},{"gwe":23}],73:[function(require,module,exports){
let { GWE } = require('gwe');

class UIStackSlot extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIStackSlot',
      template: `
        <div class="UIStackSlot-bg js-bg"></div>
        <div class="UIStackSlot-numCards js-num-cards"></div>`
    });

    this.cards = [];
    this.duelistIndex = 0;
    this.location = '';
    this.hidden = false;
    this.selectable = false;
  }

  update() {
    if (this.cards.length > 0) {
      let lastCard = this.cards[this.cards.length - 1];
      this.node.querySelector('.js-bg').style.backgroundImage = this.hidden ? 'url(assets/textures/card_back.png)' : 'url(' + lastCard.getCoverFile() + ')';
      this.node.querySelector('.js-num-cards').textContent = this.cards.length;
    }
    else {
      this.node.querySelector('.js-bg').style.backgroundImage = 'url()';
      this.node.querySelector('.js-num-cards').textContent = 0;
    }
  }

  setCards(cards) {
    this.cards = cards ? cards : [];
  }

  getDuelistIndex() {
    return this.duelistIndex;
  }

  setDuelistIndex(duelistIndex) {
    this.duelistIndex = duelistIndex;
  }

  getLocation() {
    return this.location;
  }

  setLocation(location) {
    this.location = location;
  }

  isHidden() {
    return this.hidden;
  }

  setHidden(hidden) {
    this.hidden = hidden;
  }

  isSelectable() {
    return this.node.classList.contains('u-selectable');
  }

  setSelectable(selectable) {
    this.node.classList.toggle('u-selectable', selectable);
  }
}

module.exports.UIStackSlot = UIStackSlot;
},{"gwe":23}],74:[function(require,module,exports){
let { GWE } = require('gwe');

class UITurn extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UITurn'
    });

    this.duel = null;
  }

  update() {
    this.node.innerHTML = '';

    if (this.duel && this.duel.getCurrentTurn()) {
      let currentTurn = this.duel.getCurrentTurn();
      for (let phase of currentTurn.getPhases()) {
        this.node.innerHTML += `<div class="UITurn-phase ${currentTurn.getCurrentPhase() == phase ? 'u-active' : ''}">${phase.getName()}</div>`;
      }
    }
  }

  setDuel(duel) {
    this.duel = duel ? duel : null;
  }
}

module.exports.UITurn = UITurn;
},{"gwe":23}]},{},[46]);
