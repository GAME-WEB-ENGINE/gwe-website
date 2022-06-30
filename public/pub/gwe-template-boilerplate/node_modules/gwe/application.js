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