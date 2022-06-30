// -------------------------------------------------------------------------------------------
// CARD RELEASE CONDITION MAPPING - (duel, card, opts)
// -------------------------------------------------------------------------------------------

let CARD_RELEASE_CONDITION_MAPPING = {};

CARD_RELEASE_CONDITION_MAPPING['IS_ENDLESS'] = function (duel, card, opts = {}) {
  return false;
}

module.exports.CARD_RELEASE_CONDITION_MAPPING = CARD_RELEASE_CONDITION_MAPPING;