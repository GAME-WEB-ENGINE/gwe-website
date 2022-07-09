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