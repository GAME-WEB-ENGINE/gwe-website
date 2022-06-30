// -------------------------------------------------------------------------------------------
// EFFECT TARGET CONDITION MAPPING - (targetCard, opts)
// -------------------------------------------------------------------------------------------

let EFFECT_TARGET_CONDITION_MAPPING = {};

EFFECT_TARGET_CONDITION_MAPPING['IS_RACE'] = function (targetCard, opts = { race }) {
  return targetCard.getAttribute('RACE') == opts.race;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_TYPE'] = function (targetCard, opts = { type }) {
  return targetCard.getType() == opts.type;
}

module.exports.EFFECT_TARGET_CONDITION_MAPPING = EFFECT_TARGET_CONDITION_MAPPING;