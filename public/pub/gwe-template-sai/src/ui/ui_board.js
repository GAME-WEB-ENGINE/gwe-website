const { GWE } = require("gwe");
let { LOCATION } = require('../core/enums');
let { UICardSlot } = require('./ui_card_slot');
let { UIStackSlot } = require('./ui_stack_slot');

class UIBoard extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBoard',
      template: `
      <div class="UIBoard-fields">
        <div class="UIBoard-field" data-duelist-index="0">
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="MZONE" style="top:80px; left:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="SZONE" style="top:10px; left:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="FZONE" style="top:150px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="GRAVEYARD" style="top:80px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="DECK" style="top:10px; left:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="0" data-location="HAND" style="top:10px; right:10px;"></div>
        </div>
        <div class="UIBoard-field" data-duelist-index="1">
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="MZONE" style="bottom:80px; right:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:127px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:177px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="SZONE" style="bottom:10px; right:227px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="FZONE" style="bottom:150px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="GRAVEYARD" style="bottom:80px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="DECK" style="bottom:10px; right:10px;"></div>
          <div class="UIBoard-field-zone js-zone" data-duelist-index="1" data-location="HAND" style="bottom:10px; left:10px;"></div>
        </div>
      </div>`
    });

    this.duel = null;
    this.slots = [];
    this.focusedSlot = null;

    let spellSlot00 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 0, false);
    let spellZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[0];
    spellZone00.appendChild(spellSlot00.node);
    this.slots.push(spellSlot00);
  
    let spellSlot01 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 1, false);
    let spellZone01 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[1];
    spellZone01.appendChild(spellSlot01.node);
    this.slots.push(spellSlot01);
  
    let spellSlot02 = CREATE_CARD_SLOT(0, LOCATION.SZONE, 2, false);
    let spellZone02 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="SZONE"]`)[2];
    spellZone02.appendChild(spellSlot02.node);
    this.slots.push(spellSlot02);
  
    let monsterSlot00 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 0, false);
    let monsterZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[0];
    monsterZone00.appendChild(monsterSlot00.node);
    this.slots.push(monsterSlot00);
  
    let monsterSlot01 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 1, false);
    let monsterZone01 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[1];
    monsterZone01.appendChild(monsterSlot01.node);
    this.slots.push(monsterSlot01);
  
    let monsterSlot02 = CREATE_CARD_SLOT(0, LOCATION.MZONE, 2, false);
    let monsterZone02 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="MZONE"]`)[2];
    monsterZone02.appendChild(monsterSlot02.node);
    this.slots.push(monsterSlot02);
  
    let handSlot00 = CREATE_CARD_SLOT(0, LOCATION.HAND, 0, true);
    let handZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="HAND"]`)[0];
    handZone00.appendChild(handSlot00.node);
    this.slots.push(handSlot00);
  
    let handSlot01 = CREATE_CARD_SLOT(0, LOCATION.HAND, 1, true);
    handZone00.appendChild(handSlot01.node);
    this.slots.push(handSlot01);
  
    let handSlot02 = CREATE_CARD_SLOT(0, LOCATION.HAND, 2, true);
    handZone00.appendChild(handSlot02.node);
    this.slots.push(handSlot02);
  
    let handSlot03 = CREATE_CARD_SLOT(0, LOCATION.HAND, 3, true);
    handZone00.appendChild(handSlot03.node);
    this.slots.push(handSlot03);
  
    let handSlot04 = CREATE_CARD_SLOT(0, LOCATION.HAND, 4, true);
    handZone00.appendChild(handSlot04.node);
    this.slots.push(handSlot04);
  
    let handSlot05 = CREATE_CARD_SLOT(0, LOCATION.HAND, 5, true);
    handZone00.appendChild(handSlot05.node);
    this.slots.push(handSlot05);
  
    let fieldSlot00 = CREATE_CARD_SLOT(0, LOCATION.FZONE, 0, false);
    let fieldZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="FZONE"]`)[0];
    fieldZone00.appendChild(fieldSlot00.node);
    this.slots.push(fieldSlot00);
  
    let graveyardSlot00 = CREATE_STACK_SLOT(0, LOCATION.GRAVEYARD, false);
    let graveyardZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="GRAVEYARD"]`)[0];
    graveyardZone00.appendChild(graveyardSlot00.node);
    this.slots.push(graveyardSlot00);
  
    let deckSlot00 = CREATE_STACK_SLOT(0, LOCATION.DECK, true);
    let deckZone00 = this.node.querySelectorAll(`.js-zone[data-duelist-index="0"][data-location="DECK"]`)[0];
    deckZone00.appendChild(deckSlot00.node);
    this.slots.push(deckSlot00);
  
    // ----------------------------------------------------------------------------------------------------------------------------
  
    let spellSlot10 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 0, false);
    let spellZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[0];
    spellZone10.appendChild(spellSlot10.node);
    this.slots.push(spellSlot10);
  
    let spellSlot11 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 1, false);
    let spellZone11 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[1];
    spellZone11.appendChild(spellSlot11.node);
    this.slots.push(spellSlot11);
  
    let spellSlot12 = CREATE_CARD_SLOT(1, LOCATION.SZONE, 2, false);
    let spellZone12 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="SZONE"]`)[2];
    spellZone12.appendChild(spellSlot12.node);
    this.slots.push(spellSlot12);
  
    let monsterSlot10 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 0, false);
    let monsterZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[0];
    monsterZone10.appendChild(monsterSlot10.node);
    this.slots.push(monsterSlot10);
  
    let monsterSlot11 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 1, false);
    let monsterZone11 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[1];
    monsterZone11.appendChild(monsterSlot11.node);
    this.slots.push(monsterSlot11);
  
    let monsterSlot12 = CREATE_CARD_SLOT(1, LOCATION.MZONE, 2, false);
    let monsterZone12 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="MZONE"]`)[2];
    monsterZone12.appendChild(monsterSlot12.node);
    this.slots.push(monsterSlot12);
  
    let handSlot10 = CREATE_CARD_SLOT(1, LOCATION.HAND, 0, false);
    let handZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="HAND"]`)[0];
    handZone10.appendChild(handSlot10.node);
    this.slots.push(handSlot10);
  
    let handSlot11 = CREATE_CARD_SLOT(1, LOCATION.HAND, 1, false);
    handZone10.appendChild(handSlot11.node);
    this.slots.push(handSlot11);
  
    let handSlot12 = CREATE_CARD_SLOT(1, LOCATION.HAND, 2, false);
    handZone10.appendChild(handSlot12.node);
    this.slots.push(handSlot12);
  
    let handSlot13 = CREATE_CARD_SLOT(1, LOCATION.HAND, 3, false);
    handZone10.appendChild(handSlot13.node);
    this.slots.push(handSlot13);
  
    let handSlot14 = CREATE_CARD_SLOT(1, LOCATION.HAND, 4, false);
    handZone10.appendChild(handSlot14.node);
    this.slots.push(handSlot14);
  
    let handSlot15 = CREATE_CARD_SLOT(1, LOCATION.HAND, 5, false);
    handZone10.appendChild(handSlot15.node);
    this.slots.push(handSlot15);
  
    let fieldSlot10 = CREATE_CARD_SLOT(1, LOCATION.FZONE, 0, false);
    let fieldZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="FZONE"]`)[0];
    fieldZone10.appendChild(fieldSlot10.node);
    this.slots.push(fieldSlot10);
  
    let graveyardSlot10 = CREATE_STACK_SLOT(1, LOCATION.GRAVEYARD, false);
    let graveyardZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="GRAVEYARD"]`)[0];
    graveyardZone10.appendChild(graveyardSlot10.node);
    this.slots.push(graveyardSlot10);
  
    let deckSlot10 = CREATE_STACK_SLOT(1, LOCATION.DECK, false);
    let deckZone10 = this.node.querySelectorAll(`.js-zone[data-duelist-index="1"][data-location="DECK"]`)[0];
    deckZone10.appendChild(deckSlot10.node);
    this.slots.push(deckSlot10);

    this.focusedSlot = deckSlot00;
  }

  update() {
    if (this.duel) {
      for (let slot of this.slots) {
        let duelist = this.duel.getDuelist(slot.getDuelistIndex());
        if (slot instanceof UICardSlot) {
          slot.setCard(duelist.getCard(slot.getLocation(), slot.getIndex()));
        }
        else {
          slot.setCards(duelist.getZone(slot.getLocation()));
        }
      }

      for (let slot of this.slots) {
        slot.update();
      }
    }
  }

  delete() {
    for (let slot of this.slots) slot.delete();
    super.delete();
  }

  focus() {
    if (this.focusedSlot) {
      this.focusedSlot.focus();
      GWE.eventManager.emit(this, 'E_SLOT_FOCUSED', { slot: this.focusedSlot });
    }

    super.focus();
  }

  unfocus() {
    if (this.focusedSlot) {
      this.focusedSlot.unfocus();
      GWE.eventManager.emit(this, 'E_SLOT_UNFOCUSED');
    }

    super.unfocus();
  }

  getSlots() {
    return this.slots;
  }

  getFocusedSlot() {
    return this.focusedSlot;
  }

  setDuel(duel) {
    for (let slot of this.slots) {
      if (slot instanceof UICardSlot) slot.setCard(null);
      else if (slot instanceof UIStackSlot) slot.setCards(null);
    }

    this.duel = duel ? duel : null;
  }

  focusSlot(slot, emit = true) {
    if (this.focusedSlot) {
      this.focusedSlot.unfocus();
    }

    slot.focus();
    this.focusedSlot = slot;

    if (emit) {
      GWE.eventManager.emit(this, 'E_SLOT_FOCUSED', { slot: this.focusedSlot });
    }
  }

  unfocusSlot(emit = true) {
    if (!this.focusedSlot) {
      return;
    }

    this.focusedSlot.unfocus();
    this.focusedSlot = null;

    if (emit) {
      GWE.eventManager.emit(this, 'E_SLOT_UNFOCUSED');
    }
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.eventManager.emit(this, 'E_ECHAP_PRESSED');
    }
    else if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'ArrowUp') {
      this.utilsNextFocus('UP');
    }
    else if (e.key == 'ArrowDown') {
      this.utilsNextFocus('DOWN');
    }
    else if (e.key == 'ArrowLeft') {
      this.utilsNextFocus('LEFT');
    }
    else if (e.key == 'ArrowRight') {
      this.utilsNextFocus('RIGHT');
    }
  }

  utilsNextFocus(direction /*UP|RIGHT|DOWN|LEFT*/) {
    let rect = this.focusedSlot.getNode().getBoundingClientRect();
    let centerX = rect.x + (rect.width * 0.5);
    let centerY = rect.y + (rect.height * 0.5);

    // let slots = this.slots.slice();
    let closestSlots = this.slots.sort((a, b) => {
      let rectA = a.getNode().getBoundingClientRect();
      let rectB = b.getNode().getBoundingClientRect();

      let centerAX = rectA.x + (rectA.width * 0.5);
      let centerAY = rectA.y + (rectA.height * 0.5);
      let centerBX = rectB.x + (rectB.width * 0.5);
      let centerBY = rectB.y + (rectB.height * 0.5);

      let deltaAX = centerX - centerAX;
      let deltaAY = centerY - centerAY;
      let deltaBX = centerX - centerBX;
      let deltaBY = centerY - centerBY;

      let deltaA = Math.sqrt((deltaAX * deltaAX) + (deltaAY * deltaAY));
      let deltaB = Math.sqrt((deltaBX * deltaBX) + (deltaBY * deltaBY));
      return deltaA - deltaB;
    });

    if (direction == 'UP') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.bottom <= centerY;
      });
    }
    else if (direction == 'RIGHT') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.left >= centerX;
      });
    }
    else if (direction == 'DOWN') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.top >= centerY;
      });
    }
    else if (direction == 'LEFT') {
      closestSlots = closestSlots.filter(slot => {
        let rect = slot.getNode().getBoundingClientRect();
        return rect.right <= centerX;
      });
    }

    if (closestSlots.length == 0) {
      return;
    }

    this.focusSlot(closestSlots[0], true);
  }
}

module.exports.UIBoard = UIBoard;

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CREATE_CARD_SLOT(duelistIndex, location, index, hidden) {
  let slot = new UICardSlot();
  slot.setDuelistIndex(duelistIndex);
  slot.setLocation(location);
  slot.setIndex(index);
  slot.setHidden(hidden);
  return slot;
}

function CREATE_STACK_SLOT(duelistIndex, location, hidden) {
  let slot = new UIStackSlot();
  slot.setDuelistIndex(duelistIndex);
  slot.setLocation(location);
  slot.setHidden(hidden);
  return slot;
}