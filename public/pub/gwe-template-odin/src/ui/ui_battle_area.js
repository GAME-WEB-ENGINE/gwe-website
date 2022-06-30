let { GWE } = require('gwe');
let { UIBattleAreaFighter } = require('./ui_battle_area_fighter');

class UIBattleArea extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleArea',
      template: `
      <div class="UIBattleArea-bg js-bg"></div>
      <div class="UIBattleArea-fighters js-fighters"></div>`
    });

    this.battle = null;
    this.fighters = [];
    this.focusableFighterPredicate = () => true;
    this.focusedFighter = null;
  }

  update(ts) {
    this.node.querySelector('.js-bg').style.backgroundImage = 'url(' + this.battle.getBackgroundImage() + ')';
    for (let fighter of this.fighters) {
      fighter.update(ts);
    }
  }

  delete() {
    for (let fighter of this.fighters) fighter.delete();
    super.delete();
  }

  setBattle(battle) {
    for (let fighter of this.fighters) {
      fighter.delete();
    }

    if (battle) {
      for (let hero of battle.getHeroes()) {
        let fighter = CREATE_HERO_FIGHTER(hero);
        this.node.querySelector('.js-fighters').appendChild(fighter.node);
        this.fighters.push(fighter);
      }

      for (let enemy of battle.getEnemies()) {
        let fighter = CREATE_ENEMY_FIGHTER(enemy, enemy.getPosition());
        this.node.querySelector('.js-fighters').appendChild(fighter.node);
        this.fighters.push(fighter);
      }

      this.battle = battle;
    }
    else {
      this.battle = null;
    }
  }

  getFighters() {
    return this.fighters;
  }

  getFocusedFighter() {
    return this.focusedFighter;
  }

  setFocusableFighterPredicate(focusableFighterPredicate) {
    for (let i = 0; i < this.fighters.length; i++) {
      let fighter =  this.fighters[i];
      if (focusableFighterPredicate(fighter)) {
        this.focusFighter(i, true);
        break;
      }
    }

    this.focusableFighterPredicate = focusableFighterPredicate;
  }

  focusFighter(index, emit = false) {
    let fighter = this.fighters[index];
    if (!fighter) {
      throw new Error('UIBattleArea::focusFighter(): fighter not found !');
    }

    this.unfocusFighter();
    fighter.focus();
    this.focusedFighter = fighter;

    if (emit) {
      GWE.eventManager.emit(this, 'E_FIGHTER_FOCUSED', { fighter: fighter, index: index });
    }
  }

  unfocusFighter(emit = false) {
    if (!this.focusedFighter) {
      return;
    }

    this.focusedFighter.unfocus();
    this.focusedFighter = null;

    if (emit) {
      GWE.eventManager.emit(this, 'E_FIGHTER_UNFOCUSED');
    }
  }

  prevFocus() {
    let focusIndex = this.fighters.indexOf(this.focusedFighter);
    let i = 0;

    while (i < this.fighters.length) {
      focusIndex = focusIndex - 1 < 0 ? this.fighters.length - 1 : focusIndex - 1;
      if (this.focusableFighterPredicate(this.fighters[focusIndex])) {
        this.focusFighter(focusIndex, true);
        break;
      }

      i++;
    }
  }

  nextFocus() {
    let focusIndex = this.fighters.indexOf(this.focusedFighter);
    let i = 0;

    while (i < this.fighters.length) {
      focusIndex = focusIndex + 1 > this.fighters.length - 1 ? 0 : focusIndex + 1;
      if (this.focusableFighterPredicate(this.fighters[focusIndex])) {
        this.focusFighter(focusIndex, true);
        break;
      }

      i++;
    }
  }

  onKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.eventManager.emit(this, 'E_CLOSED');
    }
    else if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'ArrowLeft') {
      this.prevFocus();
    }
    else if (e.key == 'ArrowRight') {
      this.nextFocus();
    }
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function CREATE_HERO_FIGHTER(hero) {
  let fighter = new UIBattleAreaFighter();
  fighter.setVisible(false);
  fighter.setCharacter(hero);
  fighter.node.style.position = 'absolute';
  fighter.node.style.right = '10px';
  fighter.node.style.bottom = '150px';
  fighter.node.style.zIndex = '1';
  return fighter;
}

function CREATE_ENEMY_FIGHTER(enemy, position) {
  let fighter = new UIBattleAreaFighter();
  fighter.setVisible(true);
  fighter.setCharacter(enemy);
  fighter.node.style.position = 'absolute';
  fighter.node.style.left = position[0] + 'px';
  fighter.node.style.top = position[1] + 'px';
  fighter.node.style.zIndex = position[2];
  return fighter;
}

module.exports.UIBattleArea = UIBattleArea;