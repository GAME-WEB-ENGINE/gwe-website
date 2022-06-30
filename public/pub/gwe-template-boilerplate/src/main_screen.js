let { GWE } = require('gwe');
let { GameScreen } = require('./game_screen');

class MainScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.uiMenu = new GWE.UIMenu();
  }

  async onEnter() {
    this.uiMenu.addWidget(new GWE.UIMenuItemText({text: 'Jeu'}));
    this.uiMenu.addWidget(new GWE.UIMenuItemText({text: 'Paramètres'}));
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

module.exports.MainScreen = MainScreen;