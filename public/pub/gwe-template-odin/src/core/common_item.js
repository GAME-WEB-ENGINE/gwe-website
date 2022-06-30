let { ItemAbstract } = require('./item_abstract');
let { Effect } = require('./effect');

class CommonItem extends ItemAbstract {
  constructor() {
    super();
    this.effect = null;
  }

  async loadFromData(data) {
    if (data.hasOwnProperty('Effect')) {
      this.effect = new Effect();
      await this.effect.loadFromData(data['Effect']);
    }

    super.loadFromData(data);
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  hasEffect() {
    return this.effect ? true : false;
  }

  getEffect() {
    return this.effect;
  }

  isTarget(fromChar, toChar) {
    return this.effect && this.effect.isTargetConditionCheck(fromChar, toChar);
  }

  apply(fromChar, toChar) {
    this.effect.apply(fromChar, toChar);
  }
}

module.exports.CommonItem = CommonItem;