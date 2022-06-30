let ENEMY_PATTERN_TARGET_SORT_MAPPING = {};

ENEMY_PATTERN_TARGET_SORT_MAPPING['LOWEST_HP'] = function (a, b) {
  return a.getAttribute('HP') - b.getAttribute('HP');
}

ENEMY_PATTERN_TARGET_SORT_MAPPING['HIGHEST_HP'] = function (a, b) {
  return b.getAttribute('HP') - a.getAttribute('HP');
}

module.exports.ENEMY_PATTERN_TARGET_SORT_MAPPING = ENEMY_PATTERN_TARGET_SORT_MAPPING;