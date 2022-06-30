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