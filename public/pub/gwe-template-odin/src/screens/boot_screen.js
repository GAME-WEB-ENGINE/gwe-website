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