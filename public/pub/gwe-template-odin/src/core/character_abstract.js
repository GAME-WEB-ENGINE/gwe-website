let { GWE } = require('gwe');
let { Attributes } = require('./attributes');
let { Effect } = require('./effect');
let { ELEMENT } = require('./enums');

class CharacterAbstract {
  constructor() {
    this.id = '';
    this.type = '';
    this.name = '';
    this.description = '';
    this.pictureFile = '';
    this.spriteFile = '';
    this.attributes; // [LV, LV_MAX, XP, XP_MAX, HP, HP_MAX, MP, MP_MAX, ATK, DEF, MAGIC_ATK, MAGIC_DEF, AGILITY, ELEMENT]
    this.attackEffects = [];
    this.magicEffects = [];
    this.activeSeals = [];
    this.ready = false;
  }

  async loadFromData(data) {
    this.id = data['Id'];
    this.type = data['Type'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.pictureFile = data['PictureFile'];
    this.spriteFile = data['SpriteFile'];
    this.attributes = new Attributes(data['Attributes']);

    for (let effectId of data['AttackEffectIds']) {
      let effect = new Effect();
      await effect.loadFromFile('assets/models/' + effectId + '/data.json');
      this.attackEffects.push(effect);
    }

    for (let effectId of data['MagicEffectIds']) {
      let effect = new Effect();
      await effect.loadFromFile('assets/models/' + effectId + '/data.json');
      this.magicEffects.push(effect);
    }
  }

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPictureFile() {
    return this.pictureFile;
  }

  getSpriteFile() {
    return this.spriteFile;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  getAttackEffects() {
    return this.attackEffects;
  }

  getMagicEffects() {
    return this.magicEffects;
  }

  getActiveSeals() {
    return this.activeSeals;
  }

  setReady(ready) {
    this.ready = ready;
  }

  isReady() {
    return this.ready;
  }

  async addSeal(seal) {
    if (!seal.stackable && this.activeSeals.find(s => s.id == seal.id)) {
      return GWE.eventManager.emit(this, 'E_SEAL_ADD_FAILED');
    }

    this.attributes.addModifiers(seal.modifiers);
    this.activeSeals.push(seal);
    await GWE.eventManager.emit(this, 'E_SEAL_ADDED');
  }

  async removeSeal(seal) {
    if (!this.activeSeals.find(s => s == seal)) {
      return GWE.eventManager.emit(this, 'E_SEAL_REMOVE_FAILED');
    }

    this.attributes.removeModifiers(seal.modifiers);
    this.activeSeals.splice(this.activeSeals.indexOf(seal), 1);
    await GWE.eventManager.emit(this, 'E_SEAL_REMOVED');
  }

  async increaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_HP', { amount: amount });
  }

  async decreaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_HP', { amount: amount });
  }

  async increaseMP(amount) {
    this.attributes.add('MP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_MP', { amount: amount });
  }

  async decreaseMP(amount) {
    this.attributes.add('MP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_MP', { amount: amount });
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function GET_ELEMENTAL_OPPOSITION_FACTOR(attackElement, defendElement) {
  if (
    (attackElement == ELEMENT.RED && defendElement == ELEMENT.BLUE) ||
    (attackElement == ELEMENT.BLUE && defendElement == ELEMENT.RED) ||
    (attackElement == ELEMENT.BLACK && defendElement == ELEMENT.WHITE) ||
    (attackElement == ELEMENT.WHITE && defendElement == ELEMENT.BLACK)) {
    return 2;
  }

  return 1;
}

module.exports.CharacterAbstract = CharacterAbstract;