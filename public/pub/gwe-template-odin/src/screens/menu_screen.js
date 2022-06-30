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