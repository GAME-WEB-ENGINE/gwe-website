// -------------------------------------------------------------------------------------------
// CARD ACTIVATE CONDITION MAPPING - (duel, card, opts)
// -------------------------------------------------------------------------------------------

const CARD_ACTIVATE_CONDITION_MAPPING = {};

CARD_ACTIVATE_CONDITION_MAPPING['IS_PRESENT_CARD_WITH_ID'] = function (duel, card, opts = { targetRange, cardId }) {
  let cards = duel.utilsQuery(card.getControler(), opts.targetRange, card => card);
  for (let card of cards) {
    if (card.getId() == opts.cardId) {
      return true;
    }
  }

  return false;
}

CARD_ACTIVATE_CONDITION_MAPPING['IS_PRESENT_CARD_WITH_TYPE'] = function (duel, card, opts = { targetRange, cardType }) {
  let cards = duel.utilsQuery(card.getControler(), opts.targetRange, card => card);
  for (let card of cards) {
    if (card.getType() == opts.cardType) {
      return true;
    }
  }

  return false;
}

module.exports.CARD_ACTIVATE_CONDITION_MAPPING = CARD_ACTIVATE_CONDITION_MAPPING;