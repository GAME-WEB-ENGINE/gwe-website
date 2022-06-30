let EFFECT_TARGET_CONDITION_MAPPING = {};

EFFECT_TARGET_CONDITION_MAPPING['IS_ALL'] = function (fromChar, toChar, opts) {
  return true;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_SELF'] = function (fromChar, toChar, opts) {
  return fromChar == toChar;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALLY'] = function (fromChar, toChar, opts) {
  return fromChar.constructor.name == toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALIVE_ALLY'] = function (fromChar, toChar, opts) {
  return toChar.getAttribute('HP') > 0 && fromChar.constructor.name == toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_OPPONENT'] = function (fromChar, toChar, opts) {
  return fromChar.constructor.name != toChar.constructor.name;
}

EFFECT_TARGET_CONDITION_MAPPING['IS_ALIVE_OPPONENT'] = function (fromChar, toChar, opts) {
  return toChar.getAttribute('HP') > 0 && fromChar.constructor.name != toChar.constructor.name;
}

module.exports.EFFECT_TARGET_CONDITION_MAPPING = EFFECT_TARGET_CONDITION_MAPPING;