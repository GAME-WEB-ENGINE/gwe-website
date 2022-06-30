let { GWE } = require('gwe');
let { HeroCharacter } = require('./hero_character');
let { Inventory } = require('./inventory');

class Player {
  constructor() {
    this.gils = 0;
    this.inventory = null;
    this.heroes = [];
  }

  async loadFromData(data) {
    this.gils = data['Gils'];
    this.inventory = new Inventory();
    this.inventory.loadFromData(data['Inventory']);

    for (let obj of data['Heroes']) {
      let hero = new HeroCharacter();
      hero.loadFromData(obj);
      this.heroes.push(hero);
    }
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    await this.loadFromData(await response.json());
  }

  getGils() {
    return this.gils;
  }

  increaseGils(amount) {
    this.gils += amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  decreaseGils(amount) {
    if (this.gils - amount < 0) {
      throw new Error('Player::decreaseGils(): gils cannot be negative !');
    }

    this.gils -= amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  getInventory() {
    return this.inventory;
  }

  getHeroes() {
    return this.heroes;
  }
}

module.exports.Player = Player;