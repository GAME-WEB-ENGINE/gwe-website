(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
let { screenManager } = require('./screen/screen_manager');
let { gfx2Manager } = require('./gfx2/gfx2_manager');
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

let RenderingModeEnum = {
  CANVAS_3D: 0,
  CANVAS_2D: 1
};

/**
 * Classe représentant l'application.
 */
class Application {
  /**
   * Créer une application gwe.
   */
  constructor(resolutionWidth, resolutionHeight, sizeMode = SizeModeEnum.FIT, renderingMode = RenderingModeEnum.CANVAS_3D) {
    this.container = null;
    this.timeStep = 0;
    this.timeStamp = 0;
    this.resolutionWidth = resolutionWidth;
    this.resolutionHeight = resolutionHeight;
    this.sizeMode = sizeMode;
    this.renderingMode = renderingMode;

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

    if (this.renderingMode == RenderingModeEnum.CANVAS_2D) {
      gfx2Manager.update(this.timeStep);
    }
    else if (this.renderingMode == RenderingModeEnum.CANVAS_3D) {
      gfx3Manager.update(this.timeStep);
    }
    
    uiManager.update(this.timeStep);
    screenManager.update(this.timeStep);

    if (this.renderingMode == RenderingModeEnum.CANVAS_2D) {
      gfx2Manager.clear();
      screenManager.draw(0);
    }
    else if (this.renderingMode == RenderingModeEnum.CANVAS_3D) {
      for (let i = 0; i < gfx3Manager.getNumViews(); i++) {
        gfx3Manager.clear(i);
        screenManager.draw(i);
      }
    }

    requestAnimationFrame(timeStamp => this.run(timeStamp));
  }
}

module.exports.SizeModeEnum = SizeModeEnum;
module.exports.RenderingModeEnum = RenderingModeEnum;
module.exports.Application = Application;
},{"./gfx2/gfx2_manager":10,"./gfx3/gfx3_manager":21,"./screen/screen_manager":32,"./ui/ui_manager":44}],3:[function(require,module,exports){
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
},{"../helpers":28}],5:[function(require,module,exports){
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
},{"../helpers":28}],6:[function(require,module,exports){
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
let { gfx2Manager } = require('./gfx2_manager');

class Gfx2Drawable {
  constructor() {
    this.position = [0, 0];
    this.rotation = 0;
    this.offset = [0, 0];
    this.visible = true;
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

  setPosition(x, y) {
    this.position = [x, y];
  }

  getRotation() {
    return this.rotation;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  getOffset() {
    return this.offset;
  }

  getOffsetX() {
    return this.offset[0];
  }

  getOffsetY() {
    return this.offset[1];
  }

  setOffset(x, y) {
    this.offset = [x, y];
  }

  isVisible() {
    return this.visible;
  }

  setVisible(visible) {
    this.visible = visible;
  }

  update(ts) {
    // virtual method called during update phase !
  }

  draw(ts) {
    if (!this.visible) {
      return;
    }

    let ctx = gfx2Manager.getContext();

    ctx.save();
    ctx.translate(-this.offset[0], -this.offset[1]);
    ctx.translate(this.position[0], this.position[1]);
    ctx.rotate(this.rotation);
    this.paint(ts);
    ctx.restore();
  }

  paint(ts) {
    // virtual method called during draw phase !
  }
}

module.exports.Gfx2Drawable = Gfx2Drawable;
},{"./gfx2_manager":10}],9:[function(require,module,exports){
let { eventManager } = require('../event/event_manager');
let { Gfx2Drawable } = require('./gfx2_drawable');
let { gfx2Manager } = require('./gfx2_manager');
let { gfx2TextureManager } = require('./gfx2_texture_manager');

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

class Gfx2JAS extends Gfx2Drawable {
  constructor() {
    super();
    this.jas = new JAS();
    this.texture = gfx2TextureManager.getDefaultTexture();
    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.isLooped = false;
    this.frameProgress = 0;
  }

  getTexture() {
    return this.texture;
  }

  setTexture(texture) {
    this.texture = texture;
  }

  update(ts) {
    let currentAnimation = this.jas.animations.find(a => a.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

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

  paint(ts) {
    let currentAnimation = this.jas.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let ctx = gfx2Manager.getContext();
    let currentFrame = currentAnimation.frames[this.currentAnimationFrameIndex];
    ctx.drawImage(this.texture, currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height, 0, 0, currentFrame.width, currentFrame.height);
  }

  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    const animation = this.jas.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('Gfx2JAS::play: animation not found.');
    }

    this.currentAnimationName = animationName;
    this.currentAnimationFrameIndex = 0;
    this.isLooped = isLooped;
    this.frameProgress = 0;
  }

  async loadFromFile(path) {
    const response = await fetch(path);
    const json = await response.json();

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
    this.currentAnimationFrameIndex = 0;
    this.frameProgress = 0;
  }
}

module.exports.Gfx2JAS = Gfx2JAS;
},{"../event/event_manager":6,"./gfx2_drawable":8,"./gfx2_manager":10,"./gfx2_texture_manager":13}],10:[function(require,module,exports){
class Gfx2Manager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.cameraPosition = [0, 0];

    this.canvas = document.getElementById('CANVAS_2D');
    if (!this.canvas) {
      throw new Error('Gfx2Manager::Gfx2Manager: CANVAS_2D not found');
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Gfx2Manager::Gfx2Manager: Your browser not support 2D');
    }
  }

  update(ts) {
    if (this.canvas.width != this.canvas.clientWidth || this.canvas.height != this.canvas.clientHeight) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
    }
  }

  clear() {
    this.ctx.restore();
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);    
    this.ctx.translate(-this.cameraPosition[0] + this.canvas.width * 0.5, -this.cameraPosition[1] + this.canvas.height * 0.5);
  }

  moveCamera(x, y) {
    this.cameraPosition[0] += x;
    this.cameraPosition[1] += y;
  }

  findCanvasFromClientPosition(clientX, clientY) {
    let rect = this.canvas.getBoundingClientRect();
    let x = clientX - rect.x;
    let y = clientY - rect.y;
    return [x, y];
  }

  findWorldFromClientPosition(clientX, clientY) {
    let rect = this.canvas.getBoundingClientRect();
    let x = (clientX - rect.x) + this.cameraPosition[0] - this.canvas.width * 0.5;
    let y = (clientY - rect.y) + this.cameraPosition[1] - this.canvas.height * 0.5;
    return [x, y];
  }

  getWidth() {
    return this.canvas.clientWidth;
  }

  getHeight() {
    return this.canvas.clientHeight;
  }

  getContext() {
    return this.ctx;
  }

  setCameraPosition(x, y) {
    this.cameraPosition[0] = x;
    this.cameraPosition[1] = y;
  }

  getCameraPosition() {
    return this.cameraPosition;
  }

  getCameraPositionX() {
    return this.cameraPosition[0];
  }

  getCameraPositionY() {
    return this.cameraPosition[1];
  }
}

module.exports.gfx2Manager = new Gfx2Manager();
},{}],11:[function(require,module,exports){
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

    for (let obj of json['Layers']) {
      let tileLayer = new Gfx2TileLayer();
      await tileLayer.loadFromData(obj);
      this.tileLayers.push(tileLayer);
    }

    await this.tileset.loadFromData(json['Tileset']);
  }

  getWidth() {
    return this.columns * this.tileWidth;
  }

  getHeight() {
    return this.rows * this.tileHeight;
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

  getTileLayers() {
    return this.tileLayers;
  }

  getTileLayer(index) {
    return this.tileLayers[index];
  }

  getTileset() {
    return this.tileset;
  }
}

class Gfx2TileLayer {
  constructor() {
    this.name = '';
    this.grid = [];
    this.rows = 0;
    this.columns = 0;
    this.visible = true;
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.grid = data['Grid'];
    this.rows = data['Rows'];
    this.columns = data['Columns'];
    this.visible = data['Visible'];
  }

  getLocationAt(index) {
    let y = Math.floor(index / this.columns);
    let x = index % this.columns;
    return [x, y];
  }

  getTileCount() {
    return this.grid.length;
  }

  getTile(index) {
    return this.grid[index];
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

  setVisible(visible) {
    this.visible = visible;
  }
}

class Gfx2Tileset {
  constructor() {
    this.textureWidth = 0;
    this.textureHeight = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.columns = 0;
    this.texture = gfx2TextureManager.getDefaultTexture();
  }

  async loadFromData(data) {
    this.textureHeight = parseInt(data['TextureHeight']);
    this.textureWidth = parseInt(data['TextureWidth']);
    this.tileWidth = parseInt(data['TileWidth']);
    this.tileHeight = parseInt(data['TileHeight']);
    this.columns = parseInt(data['Columns']);
    this.texture = await gfx2TextureManager.loadTexture(data['TextureFile']);
  }

  getTilePosition(tileId) {
    let x = ((tileId - 1) % this.columns) * this.tileWidth;
    let y = Math.floor((tileId - 1) / this.columns) * this.tileHeight;
    return [x, y];
  }

  getTexture() {
    return this.texture;
  }

  getColumn() {
    return this.columns;
  }

  getTileHeight() {
    return this.tileHeight;
  }

  getTileWidth() {
    return this.tileWidth;
  }

  getTextureHeight() {
    return this.textureHeight;
  }

  getTextureWidth() {
    return this.textureWidth;
  }
}

module.exports.Gfx2Map = Gfx2Map;
},{"./gfx2_texture_manager":13}],12:[function(require,module,exports){
let { Gfx2Drawable } = require('./gfx2_drawable');
let { gfx2Manager } = require('./gfx2_manager');

class Gfx2MapLayer extends Gfx2Drawable {
  constructor(map, layerIndex) {
    super();
    this.map = map;
    this.layerIndex = layerIndex;
  }

  paint(ts) {
    let ctx = gfx2Manager.getContext();
    let layer = this.map.getTileLayer(this.layerIndex);
    let tileset = this.map.getTileset();

    if (!layer) {
      return;
    }
    if (!layer.isVisible()) {
      return;
    }

    for (let i = 0; i < layer.getTileCount(); i++) {
      let texTilePosition = tileset.getTilePosition(layer.getTile(i));
      let texTileWidth = tileset.getTileWidth();
      let texTileHeight = tileset.getTileHeight();
      let location = layer.getLocationAt(i);
      let x = Math.round(location[0] * this.map.getTileWidth());
      let y = Math.round(location[1] * this.map.getTileHeight());
      ctx.drawImage(tileset.getTexture(), texTilePosition[0], texTilePosition[1], texTileWidth, texTileHeight, x, y, this.map.getTileWidth(), this.map.getTileHeight());
    }
  }
}

module.exports.Gfx2MapLayer = Gfx2MapLayer;
},{"./gfx2_drawable":8,"./gfx2_manager":10}],13:[function(require,module,exports){
class Gfx2TextureManager {
  constructor() {
    this.textures = {};
  }

  async loadTexture(path) {
    return new Promise(resolve => {
      if (this.textures[path]) {
        return resolve(this.textures[path]);
      }

      let image = new Image();
      image.src = path;
      image.addEventListener('load', () => {
        this.textures[path] = image;
        resolve(image);
      });
    });
  }

  deleteTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx2TextureManager::deleteTexture(): The texture file doesn\'t exist, cannot delete !');
    }

    this.textures[path] = null;
    delete this.textures[path];
  }

  getTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx2TextureManager::getTexture(): The texture file doesn\'t exist, cannot get !');
    }

    return this.textures[path];
  }

  getDefaultTexture() {
    let image = new Image();
    image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    return image;
  }

  releaseTextures() {
    for (let path in this.textures) {
      this.textures[path] = null;
      delete this.textures[path];
    }
  }
}

module.exports.gfx2TextureManager = new Gfx2TextureManager();
},{}],14:[function(require,module,exports){
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
},{"./gfx3_drawable":15,"./gfx3_manager":21}],15:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"../helpers":28}],16:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"../event/event_manager":6,"./gfx3_drawable":15,"./gfx3_manager":21,"./gfx3_texture_manager":25}],17:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"../event/event_manager":6,"../helpers":28,"./gfx3_drawable":15,"./gfx3_manager":21,"./gfx3_texture_manager":25}],18:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"./gfx3_drawable":15,"./gfx3_manager":21,"./gfx3_texture_manager":25}],19:[function(require,module,exports){
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
},{"../bounding/bounding_box":4,"../helpers":28,"./gfx3_drawable":15,"./gfx3_manager":21,"./gfx3_texture_manager":25}],20:[function(require,module,exports){
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
},{"../helpers":28,"./gfx3_drawable":15,"./gfx3_manager":21}],21:[function(require,module,exports){
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

    this.canvas = document.getElementById('CANVAS_3D');
    if (!this.canvas) {
      throw new Error('Gfx3Manager::Gfx3Manager: CANVAS_3D not found');
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
},{"../helpers":28,"./gfx3_shaders":23,"./gfx3_view":26}],22:[function(require,module,exports){
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
},{"../event/event_manager":6,"../helpers":28,"./gfx3_drawable":15,"./gfx3_manager":21}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{"./gfx3_manager":21,"./gfx3_texture":24}],26:[function(require,module,exports){
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
},{"../helpers":28,"./gfx3_viewport":27}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
let { Application } = require('./application');
let { ArrayCollection } = require('./array/array_collection');
let { BoundingBox } = require('./bounding/bounding_box');
let { BoundingRect } = require('./bounding/bounding_rect');
let { EventSubscriber } = require('./event/event_subscriber');
let { Gfx2Drawable } = require('./gfx2/gfx2_drawable');
let { Gfx2JAS } = require('./gfx2/gfx2_jas');
let { Gfx2MapLayer } = require('./gfx2/gfx2_map_layer');
let { Gfx2Map } = require('./gfx2/gfx2_map');
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
let { SizeModeEnum, RenderingModeEnum } = require('./application');
let { ProjectionModeEnum } = require('./gfx3/gfx3_view');
let { MenuFocusEnum } = require('./ui/ui_menu');
let { MenuAxisEnum } = require('./ui/ui_menu');

let { inputManager } = require('./input/input_manager');
let { gfx2Manager } = require('./gfx2/gfx2_manager');
let { gfx2TextureManager } = require('./gfx2/gfx2_texture_manager');
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
  Gfx2Drawable,
  Gfx2JAS,
  Gfx2MapLayer,
  Gfx2Map,
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
  RenderingModeEnum,
  ProjectionModeEnum,
  MenuFocusEnum,
  MenuAxisEnum,

  inputManager,
  gfx2Manager,
  gfx2TextureManager,
  gfx3Manager,
  gfx3TextureManager,
  eventManager,
  screenManager,
  soundManager,
  uiManager
};
},{"./application":2,"./array/array_collection":3,"./bounding/bounding_box":4,"./bounding/bounding_rect":5,"./event/event_manager":6,"./event/event_subscriber":7,"./gfx2/gfx2_drawable":8,"./gfx2/gfx2_jas":9,"./gfx2/gfx2_manager":10,"./gfx2/gfx2_map":11,"./gfx2/gfx2_map_layer":12,"./gfx2/gfx2_texture_manager":13,"./gfx3/gfx3_collisionbox":14,"./gfx3/gfx3_drawable":15,"./gfx3/gfx3_jam":16,"./gfx3/gfx3_jas":17,"./gfx3/gfx3_jsm":18,"./gfx3/gfx3_jss":19,"./gfx3/gfx3_jwm":20,"./gfx3/gfx3_manager":21,"./gfx3/gfx3_mover":22,"./gfx3/gfx3_shaders":23,"./gfx3/gfx3_texture":24,"./gfx3/gfx3_texture_manager":25,"./gfx3/gfx3_view":26,"./gfx3/gfx3_viewport":27,"./helpers":28,"./input/input_manager":30,"./screen/screen":31,"./screen/screen_manager":32,"./script/script_machine":33,"./sound/sound_manager":34,"./ui/ui_bubble":35,"./ui/ui_description_list":36,"./ui/ui_dialog":37,"./ui/ui_input_range":38,"./ui/ui_input_select":39,"./ui/ui_input_slider":40,"./ui/ui_input_text":41,"./ui/ui_keyboard":42,"./ui/ui_list_view":43,"./ui/ui_manager":44,"./ui/ui_menu":45,"./ui/ui_menu_item_text":46,"./ui/ui_message":47,"./ui/ui_print":48,"./ui/ui_prompt":49,"./ui/ui_sprite":50,"./ui/ui_text":51,"./ui/ui_widget":52}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
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
},{"fs":1}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":45,"./ui_menu_item_text":46,"./ui_widget":52}],36:[function(require,module,exports){
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
},{"./ui_widget":52}],37:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],38:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],39:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":45,"./ui_menu_item_text":46}],40:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],41:[function(require,module,exports){
module.exports.UIInputText = {};
},{}],42:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],43:[function(require,module,exports){
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
},{"../array/array_collection":3,"../event/event_manager":6,"./ui_menu":45}],44:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],45:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],46:[function(require,module,exports){
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
},{"./ui_widget":52}],47:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],48:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_widget":52}],49:[function(require,module,exports){
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
},{"../event/event_manager":6,"./ui_menu":45,"./ui_menu_item_text":46,"./ui_widget":52}],50:[function(require,module,exports){
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
    this.loadFromData(JSON.parse(request.responseText));
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
},{"../event/event_manager":6,"./ui_widget":52}],51:[function(require,module,exports){
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
},{"./ui_widget":52}],52:[function(require,module,exports){
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
},{"../event/event_manager":6}],53:[function(require,module,exports){
window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { BootScreen } = require('./screens/boot_screen');

  let app = new GWE.Application(600, 600, GWE.SizeModeEnum.FIXED);
  GWE.screenManager.requestSetScreen(new BootScreen(app));
  requestAnimationFrame(ts => app.run(ts));
});
},{"./screens/boot_screen":61,"gwe":29}],54:[function(require,module,exports){
let { GWE } = require('gwe');

class CameraFollow {
  constructor() {
    this.targetDrawable = null;
    this.minClipOffset = [0, 0];
    this.maxClipOffset = [0, 0];
    this.view = GWE.gfx3Manager.getView(0);

    this.view.setProjectionMode(GWE.ProjectionModeEnum.ORTHOGRAPHIC);
    this.view.setOrthographicSize(8.4);
    this.view.setOrthographicDepth(100);
    this.view.setCameraMatrix([1.0000, 0.0000, -0.0000, 0.0000, -0.0000, 0.0000, -1.0000, 0.0000, -0.0000, 1.0000,  0.0000, 0.0000, -0.0000, 8.4545,  0.0000, 1.0000]);
    GWE.gfx3Manager.setShowDebug(true);
  }

  async loadFromData(data) {
    this.minClipOffset[0] = data['MinClipOffsetX'];
    this.minClipOffset[1] = data['MinClipOffsetY'];
    this.maxClipOffset[0] = data['MaxClipOffsetX'];
    this.maxClipOffset[1] = data['MaxClipOffsetY'];
  }

  update(ts) {
    if (!this.targetDrawable) {
      return;
    }

    let clipOffset = this.view.getClipOffset();
    let targetPosition = this.targetDrawable.getPosition();
    let targetScreenPosition = GWE.gfx3Manager.getScreenPosition(0, targetPosition[0], targetPosition[1], targetPosition[2]);

    this.view.setClipOffset(
      GWE.Utils.CLAMP(targetScreenPosition[0] + clipOffset[0], this.minClipOffset[0], this.maxClipOffset[0]),
      GWE.Utils.CLAMP(targetScreenPosition[1] + clipOffset[1], this.minClipOffset[1], this.maxClipOffset[1])
    );
  }

  setTargetDrawable(targetDrawable) {
    this.targetDrawable = targetDrawable;
  }
}

module.exports.CameraFollow = CameraFollow;
},{"gwe":29}],55:[function(require,module,exports){
let { GWE } = require('gwe');
let { DIRECTION, DIRECTION_TO_VEC3 } = require('../enums');

class Controller extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.controllable = true;
    this.jas = new GWE.Gfx3JAS();
    this.moving = false;
    this.direction = DIRECTION.FORWARD;
    this.radius = 0;
    this.speed = 3;

    this.jas.setRotation(1.57, 0, 0);
    this.jas.setPixelsPerUnit(32);
  }

  async loadFromData(data) {
    await this.jas.loadFromFile(data['JASFile']);
    this.jas.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jas.setOffset(data['OffsetX'], data['OffsetY']);
    this.radius = data['Radius'];
  }

  update(ts) {
    if (this.controllable) {
      if (GWE.inputManager.isKeyDown('ArrowLeft')) {
        this.moving = true;
        this.direction = DIRECTION.LEFT;
      }
      else if (GWE.inputManager.isKeyDown('ArrowRight')) {
        this.moving = true;
        this.direction = DIRECTION.RIGHT;
      }
      else if (GWE.inputManager.isKeyDown('ArrowUp')) {
        this.moving = true;
        this.direction = DIRECTION.FORWARD;
      }
      else if (GWE.inputManager.isKeyDown('ArrowDown')) {
        this.moving = true;
        this.direction = DIRECTION.BACKWARD;
      }
      else {
        this.moving = false;
      }

      if (this.moving) {
        let prevPositionX = this.position[0];
        this.position[0] += DIRECTION_TO_VEC3[this.direction][0] * this.speed * (ts / 1000);
        let prevPositionZ = this.position[2];
        this.position[2] += DIRECTION_TO_VEC3[this.direction][2] * this.speed * (ts / 1000);
        GWE.eventManager.emit(this, 'E_MOVED', { prevPositionX, prevPositionZ });
      }
    }

    this.jas.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jas.play(this.moving ? 'RUN_' + this.direction : 'IDLE_' + this.direction, true, true);
    this.jas.update(ts);
  }

  draw(viewIndex) {
    this.jas.draw(viewIndex);
  }

  handleKeyDownOnce(e) {
    if (!this.controllable) {
      return;
    }

    if (e.key == 'Enter') {
      let handPositionX = this.position[0] + DIRECTION_TO_VEC3[this.direction][0] * this.radius + 0.5;
      let handPositionZ = this.position[2] + DIRECTION_TO_VEC3[this.direction][2] * this.radius + 0.5;
      GWE.eventManager.emit(this, 'E_ACTION_PUSHED', { handPositionX, handPositionZ });
    }
  }

  setDirection(direction) {
    this.direction = direction;
  }

  setControllable(controllable) {
    this.controllable = controllable;
  }

  getRadius() {
    return this.radius;
  }
}

module.exports.Controller = Controller;
},{"../enums":60,"gwe":29}],56:[function(require,module,exports){
let { GWE } = require('gwe');

class Model extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.jas = new GWE.Gfx3JAS();
    this.radius = 0;
    this.onActionBlockId = '';

    this.jas.setRotation(1.57, 0, 0);
    this.jas.setPixelsPerUnit(32);
  }

  async loadFromData(data) {
    await this.jas.loadFromFile(data['JASFile']);
    this.jas.setTexture(await GWE.gfx3TextureManager.loadTexture(data['TextureFile']));
    this.jas.setOffset(data['OffsetX'], data['OffsetY']);
    this.jas.setPosition(data['PositionX'], data['PositionY'], data['PositionZ']);
    this.jas.play('IDLE_FORWARD', true);
    
    this.radius = data['Radius'];
    this.onActionBlockId = data['OnActionBlockId'];
  }

  update(ts) {
    this.jas.setPosition(this.position[0], this.position[1], this.position[2]);
    this.jas.update(ts);
  }

  draw(viewIndex) {
    this.jas.draw(viewIndex);
  }

  getRadius() {
    return this.radius;
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }
}

module.exports.Model = Model;
},{"gwe":29}],57:[function(require,module,exports){
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
      if (GWE.Utils.VEC3_DISTANCE(model.getPosition(), [handPositionX, 0, handPositionZ]) <= model.getRadius()) {
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
        this.controller.setPosition(prevPositionX, this.controller.getPositionY(), prevPositionZ);
        return;
      }
    }

    let p0Elevation = this.walkmesh.getElevationAt(position[0], position[2]);
    let p1Elevation = this.walkmesh.getElevationAt(position[0] - radius, position[2]);
    let p2Elevation = this.walkmesh.getElevationAt(position[0] + radius, position[2]);
    if (p0Elevation == Infinity || p1Elevation == Infinity || p2Elevation == Infinity) {
      this.controller.setPosition(prevPositionX, this.controller.getPositionY(), prevPositionZ);
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
},{"./camera_follow":54,"./controller":55,"./model":56,"./spawn":58,"./trigger":59,"gwe":29}],58:[function(require,module,exports){
let { GWE } = require('gwe');
let { DIRECTION } = require('../enums');

class Spawn extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.name = '';
    this.direction = DIRECTION.FORWARD;
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.direction = data['Direction'];
  }

  draw(viewIndex) {
    GWE.gfx3Manager.drawDebugSphere(this.getModelMatrix(), 0.2, 2, [1, 0, 1]);
  }

  getName() {
    return this.name;
  }

  getDirection() {
    return this.direction;
  }
}

module.exports.Spawn = Spawn;
},{"../enums":60,"gwe":29}],59:[function(require,module,exports){
let { GWE } = require('gwe');

class Trigger extends GWE.Gfx3Drawable {
  constructor() {
    super();
    this.radius = 0;
    this.onEnterBlockId = '';
    this.onLeaveBlockId = '';
    this.onActionBlockId = '';
  }

  async loadFromData(data) {
    this.position[0] = data['PositionX'];
    this.position[1] = data['PositionY'];
    this.position[2] = data['PositionZ'];
    this.radius = data['Radius'];
    this.onEnterBlockId = data['OnEnterBlockId'];
    this.onLeaveBlockId = data['OnLeaveBlockId'];
    this.onActionBlockId = data['OnActionBlockId'];
  }

  draw(viewIndex) {
    GWE.gfx3Manager.drawDebugSphere(this.getModelMatrix(), this.radius, 2, [1, 0, 1]);
  }

  getRadius() {
    return this.radius;
  }

  getOnEnterBlockId() {
    return this.onEnterBlockId;
  }

  getOnLeaveBlockId() {
    return this.onLeaveBlockId;
  }

  getOnActionBlockId() {
    return this.onActionBlockId;
  }
}

module.exports.Trigger = Trigger;
},{"gwe":29}],60:[function(require,module,exports){
let { GWE } = require('gwe');

let DIRECTION = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD'
};

let DIRECTION_TO_VEC3 = {
  LEFT: GWE.Utils.VEC3_LEFT,
  RIGHT: GWE.Utils.VEC3_RIGHT,
  FORWARD: GWE.Utils.VEC3_FORWARD,
  BACKWARD: GWE.Utils.VEC3_BACKWARD
};

module.exports.DIRECTION = DIRECTION;
module.exports.DIRECTION_TO_VEC3 = DIRECTION_TO_VEC3;
},{"gwe":29}],61:[function(require,module,exports){
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
      GWE.screenManager.requestSetScreen(new GameScreen(this.app));
    }
  }
}

module.exports.BootScreen = BootScreen;
},{"./game_screen":62,"gwe":29}],62:[function(require,module,exports){
let { GWE } = require('gwe');
let { Room } = require('../entities/room');

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.room = new Room();
    this.handleKeyDownOnceCb = (e) => this.handleKeyDownOnce(e);
  }

  async onEnter() {
    await this.room.loadFromFile('./assets/rooms/sample00/data.room', 'Spawn0000');
    document.addEventListener('keydown', this.handleKeyDownOnceCb);
  }

  async onExit() {
    document.removeEventListener('keydown', this.handleKeyDownOnceCb);
  }

  update(ts) {
    this.room.update(ts);
  }

  draw(viewIndex) {
    this.room.draw(viewIndex);
  }

  handleKeyDownOnce(e) {
    if (e.repeat) {
      return;
    }

    this.room.handleKeyDownOnce(e);
  }
}

module.exports.GameScreen = GameScreen;
},{"../entities/room":57,"gwe":29}]},{},[53]);
