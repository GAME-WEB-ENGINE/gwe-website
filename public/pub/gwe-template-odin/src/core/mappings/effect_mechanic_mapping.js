let { Seal } = require('../seal');
let EFFECT_MECHANIC_MAPPING = {};

EFFECT_MECHANIC_MAPPING['RESTORE'] = async function (fromChar, toChar, opts = { amount, element }) {
  await toChar.increaseHP(opts.amount, opts.element);
}

EFFECT_MECHANIC_MAPPING['DAMAGE'] = async function (fromChar, toChar, opts = { amount, element }) {
  await toChar.decreaseHP(opts.amount, opts.element);
}

EFFECT_MECHANIC_MAPPING['INCREASE_MANA'] = async function (fromChar, toChar, opts = { amount }) {
  await toChar.increaseHP(opts.amount);
}

EFFECT_MECHANIC_MAPPING['DECREASE_MANA'] = async function (fromChar, toChar, opts = { amount }) {
  await toChar.decreaseHP(opts.amount);
}

EFFECT_MECHANIC_MAPPING['ADD_SEAL'] = async function (fromChar, toChar, opts = { sealId }) {
  let seal = Seal.createFromFile('assets/models/' + opts.sealId + '/data.json');
  seal.fromChar = fromChar;
  await toChar.addSeal(seal);
}

EFFECT_MECHANIC_MAPPING['REMOVE_SEAL'] = async function (fromChar, toChar, opts = { sealId }) {
  for (let seal of toChar.getActiveSeals()) {
    if (seal.getId() == sealId) {
      await toChar.removeSeal(seal);
    }
  }
}

module.exports.EFFECT_MECHANIC_MAPPING = EFFECT_MECHANIC_MAPPING;