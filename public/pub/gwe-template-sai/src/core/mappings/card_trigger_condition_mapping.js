//WARNING
// -------------------------------------------------------------------------------------------
// CARD TRIGGER CONDITION MAPPING - (duel, card, action, opts)
// -------------------------------------------------------------------------------------------

let CARD_TRIGGER_CONDITION_MAPPING = {};

CARD_TRIGGER_CONDITION_MAPPING['IS_EFFECT_CARD_MODIFIER_SET_STATE_FREEZE'] = function (duel, card, action, opts = {}) {
  return (
    action instanceof ActivateEffectInternalAction &&
    action.effect.mechanicId == 'ADD_CARD_MODIFIER' &&
    action.effect.mechanicOpts.modifierData.Type == 'SET' &&
    action.effect.mechanicOpts.modifierData.AttributeKey == 'STATE_FREEZE' &&
    action.effect.mechanicOpts.modifierData.Value == 1
  );
}

module.exports.CARD_TRIGGER_CONDITION_MAPPING = CARD_TRIGGER_CONDITION_MAPPING;