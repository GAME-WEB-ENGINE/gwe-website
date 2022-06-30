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