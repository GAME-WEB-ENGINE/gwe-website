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