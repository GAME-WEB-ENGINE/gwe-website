let { CharacterAbstract } = require('./character_abstract');
let { Effect } = require('./effect');
let { ENEMY_PATTERN_CONDITION_MAPPING } = require('./mappings/enemy_pattern_condition_mapping');
let { ENEMY_PATTERN_TARGET_SORT_MAPPING } = require('./mappings/enemy_pattern_target_sort_mapping');

class EnemyCharacter extends CharacterAbstract {
  constructor() {
    super();
    this.gils = 0;
    this.patterns = [];
    this.position = [0, 0, 0];
  }

  async loadFromData(data) {
    this.gils = data['Gils'];

    for (let obj of data['Patterns']) {
      let pattern = new EnemyPattern();
      await pattern.loadFromData(obj);
      this.patterns.push(pattern);
    }

    await super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getGils() {
    return this.gils;
  }

  getPatterns() {
    return this.patterns;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }
}

class EnemyPattern {
  constructor() {
    this.name = '';
    this.effect = null;
    this.priority = 0;
    this.conditionId = '';
    this.conditionOpts = {};
    this.targetSortId = '';
    this.targetSortOpts = {};
  }

  async loadFromData(data) {
    this.name = data['Name'];
    this.effect = new Effect();
    await this.effect.loadFromFile('assets/models/' + data['EffectId'] + '/data.json');
    this.priority = data['Priority'];
    this.conditionId = data['ConditionId'];
    this.conditionOpts = data['ConditionOpts'];
    this.targetSortId = data['TargetSortId'];
    this.targetSortOpts = data['TargetSortOpts'];
  }

  isConditionCheck(battle, enemy) {
    let conditionFn = ENEMY_PATTERN_CONDITION_MAPPING[this.conditionId];
    return conditionFn(battle, enemy, this.conditionOpts);
  }

  targetSort(a, b) {
    let targetSortFn = ENEMY_PATTERN_TARGET_SORT_MAPPING[this.targetSortId];
    return targetSortFn(a, b);
  }
}

module.exports.EnemyCharacter = EnemyCharacter;
module.exports.EnemyPattern = EnemyPattern;