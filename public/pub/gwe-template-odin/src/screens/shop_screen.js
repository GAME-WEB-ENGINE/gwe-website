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