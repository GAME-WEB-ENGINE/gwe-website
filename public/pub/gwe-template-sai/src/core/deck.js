let { MonsterCard } = require('./monster_card');
let { SpellCard } = require('./spell_card');

class Deck {
  constructor() {
    this.cards = [];
  }

  async loadFromData(data) {
    for (let obj of data) {
      if (obj['CardTypeName'] == 'MonsterCard') {
        let monsterCard = new MonsterCard();
        await monsterCard.loadFromFile('assets/models/' + obj['CardId'] + '/data.json');
        this.cards.push(monsterCard);
      }
      else if (obj['CardTypeName'] == 'SpellCard') {
        let spellCard = new SpellCard();
        await spellCard.loadFromFile('assets/models/' + obj['CardId'] + '/data.json');
        this.cards.push(spellCard);
      }
    }
  }

  getCards() {
    return this.cards;
  }
}

module.exports.Deck = Deck;