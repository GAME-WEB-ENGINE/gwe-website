let ENEMY_PATTERN_CONDITION_MAPPING = {};

ENEMY_PATTERN_CONDITION_MAPPING['SELF_HAS_LOWER_HP'] = function (battle, enemy, opts) {
  let r = (enemy.getAttribute('HP') / enemy.getAttribute('HP_MAX')) * 100;
  return r < opts.number;
}

ENEMY_PATTERN_CONDITION_MAPPING['ALLY_HAS_LOWER_HP'] = function (battle, enemy, opts) {
  for (let char of battle.getEnemies()) {
    let r = (char.getAttribute('HP') / char.getAttribute('HP_MAX')) * 100;
    if (char != enemy && r != 0 && r < opts.number) return true;
  }

  return false;
}

module.exports.ENEMY_PATTERN_CONDITION_MAPPING = ENEMY_PATTERN_CONDITION_MAPPING;