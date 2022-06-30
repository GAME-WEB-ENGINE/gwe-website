let { EFFECT_MECHANIC_MAPPING } = require('./mappings/effect_mechanic_mapping');
let { EFFECT_TARGET_CONDITION_MAPPING } = require('./mappings/effect_target_condition_mapping');

class Effect {
  constructor(card) {
    this.card = card;
    this.targetType = '';
    this.targetRange = '';
    this.targetConditionId = '';
    this.targetConditionOpts = {};
    this.mechanicId = '';
    this.mechanicOpts = {};
    this.targetCards = [];
  }

  async loadFromData(data) {
    this.targetType = data['TargetType'];
    this.targetRange = data['TargetRange'];
    this.targetConditionId = data['TargetConditionId'];
    this.targetConditionOpts = data['TargetConditionOpts'];
    this.mechanicId = data['MechanicId'];
    this.mechanicOpts = data['MechanicOpts'];
  }

  getTargetType() {
    return this.targetType;
  }

  getTargetRange() {
    return this.targetRange;
  }

  getTargetCards() {
    return this.targetCards;
  }

  isPresentTarget(duel) {
    let cardArray = duel.utilsQuery(this.card.getControler(), this.targetRange, card => card && this.isTargetConditionCheck(card));
    if (cardArray.length == 0) {
      return false;
    }

    return true;
  }

  isTarget(duel, card) {
    let cardArray = duel.utilsQuery(this.card.getControler(), this.targetRange, card => card && this.isTargetConditionCheck(card));
    if (cardArray.length == 0) {
      return false;
    }

    return cardArray.includes(card);
  }

  isTargetConditionCheck(card) {
    if (this.targetConditionId == '') {
      return true;
    }

    let targetFn = EFFECT_TARGET_CONDITION_MAPPING[this.targetConditionId];
    return targetFn(card, this.targetConditionOpts);
  }

  hasTargetCard(targetCard) {
    return this.targetCards.indexOf(targetCard) != -1;
  }

  addTargetCard(targetCard) {
    this.targetCards.push(targetCard);
  }

  removeTargetCard(targetCard) {
    this.targetCards.splice(this.targetCards.indexOf(targetCard), 1);
  }

  apply(duel, sourceCard, targetCard) {
    let mechanicFn = EFFECT_MECHANIC_MAPPING[this.mechanicId];
    mechanicFn(duel, sourceCard, this, targetCard, this.mechanicOpts);
  }
}

module.exports.Effect = Effect;