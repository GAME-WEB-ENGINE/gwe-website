let { Modifier } = require('../modifier');

// -------------------------------------------------------------------------------------------
// EFFECT MECHANIC MAPPING - (duel, card, effect, targetCard, opts)
// -------------------------------------------------------------------------------------------

let EFFECT_MECHANIC_MAPPING = {};

EFFECT_MECHANIC_MAPPING['NEW_TURN'] = async function (duel, card, effect, targetCard, opts = {}) {
  await duel.operationNewTurn();
}

EFFECT_MECHANIC_MAPPING['DRAW'] = async function (duel, card, effect, targetCard, opts = { numCards }) {
  await duel.operationDraw(card.getControler(), opts.numCards);
}

EFFECT_MECHANIC_MAPPING['CHANGE_PHASE'] = async function (duel, card, effect, targetCard, opts = { phaseId }) {
  await duel.operationChangePhase(opts.phaseId);
}

EFFECT_MECHANIC_MAPPING['DAMAGE_SELF'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationDamage(card.getControler(), opts.amount);
}

EFFECT_MECHANIC_MAPPING['DAMAGE_OPPONENT'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationDamage(OPPONENT_OF(card.getControler()), opts.amount);
}

EFFECT_MECHANIC_MAPPING['RESTORE_SELF'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationRestore(card.getControler(), opts.amount);
}

EFFECT_MECHANIC_MAPPING['RESTORE_OPPONENT'] = async function (duel, card, effect, targetCard, opts = { amount }) {
  await duel.operationRestore(OPPONENT_OF(card.getControler()), opts.amount);
}

EFFECT_MECHANIC_MAPPING['DESTROY'] = async function (duel, card, effect, targetCard, opts = {}) {
  await duel.operationDestroy(targetCard);
}

EFFECT_MECHANIC_MAPPING['ADD_MODIFIER_TO_SELF'] = async function (duel, card, effect, targetCard, opts = { modifierData }) {
  let modifier = new Modifier();
  await modifier.loadFromData(opts.modifierData);
  modifier.setLinkedEffect(modifier.isLinked() ? effect : null);
  await duel.operationAddDuelistModifier(card.getControler(), modifier);
}

EFFECT_MECHANIC_MAPPING['ADD_CARD_MODIFIER'] = async function (duel, card, effect, targetCard, opts = { modifierData }) {
  let modifier = new Modifier();
  await modifier.loadFromData(opts.modifierData);
  modifier.setLinkedEffect(modifier.isLinked() ? effect : null);
  await duel.operationAddCardModifier(targetCard, modifier);
}

module.exports.EFFECT_MECHANIC_MAPPING = EFFECT_MECHANIC_MAPPING;

const OPPONENT_OF = (duelistIndex) => duelistIndex == 0 ? 1 : 0;