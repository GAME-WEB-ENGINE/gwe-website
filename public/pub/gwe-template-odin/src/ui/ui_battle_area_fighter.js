let { GWE } = require('gwe');
let { HeroCharacter } = require('../core/hero_character');

class UIBattleAreaFighter extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIBattleAreaFighter',
      template: `
      <div class="UIBattleAreaFighter-header">
        <div class="UIBattleAreaFighter-header-name js-name"></div>
        <div class="UIBattleAreaFighter-header-lifebar">
          <div class="UIBattleAreaFighter-header-lifebar-progress js-lifebar"></div>
        </div>
        <div class="UIBattleAreaFighter-header-seals js-seals"></div>
      </div>
      <div class="UIBattleAreaFighter-body">
        <div class="UIBattleAreaFighter-body-effectSprite js-effect-sprite"></div>
        <div class="UIBattleAreaFighter-body-characterSprite js-character-sprite"></div>
      </div>`
    });

    this.character = null;
    this.uiEffectSprite = new GWE.UISprite({ className: 'UISprite UIBattleAreaFighter-body-effectSprite' });
    this.uiCharacterSprite = new GWE.UISprite({ className: 'UISprite UIBattleAreaFighter-body-characterSprite' });
    
    this.node.querySelector('.js-effect-sprite').replaceWith(this.uiEffectSprite.node);
    this.node.querySelector('.js-character-sprite').replaceWith(this.uiCharacterSprite.node);
    this.uiEffectSprite.loadFromFileSync('assets/sprites/effects/data.json');
  }

  update(ts) {
    if (this.character) {
      this.node.querySelector('.js-name').textContent = this.character.getName();
      this.node.querySelector('.js-lifebar').style.width = parseInt(this.character.getAttribute('HP') / this.character.getAttribute('HP_MAX') * 100) + '%';
      this.node.querySelector('.js-seals').innerHTML = '';
      for (let seal of this.character.getActiveSeals()) {
        this.node.querySelector('.js-seals').innerHTML += `<img class="UIBattleAreaFighter-header-seals-item" src="${seal.iconFile}">`;
      }
    }
    else {
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-lifebar').style.width = '0%';
      this.node.querySelector('.js-seals').innerHTML = '';
    }

    this.uiEffectSprite.update(ts);
    this.uiCharacterSprite.update(ts);
  }

  getCharacter() {
    return this.character;
  }

  setCharacter(character) {
    GWE.eventManager.unsubscribe(this.character, 'E_EFFECT_INFLICT', this);
    GWE.eventManager.unsubscribe(this.character, 'E_INCREASE_HP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_DECREASE_HP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_INCREASE_MP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_DECREASE_MP', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_ADD_FAILED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_ADDED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_REMOVE_FAILED', this);
    GWE.eventManager.unsubscribe(this.character, 'E_SEAL_REMOVED', this);

    if (character) {
      GWE.eventManager.subscribe(character, 'E_EFFECT_INFLICT', this, this.handleEffectInflict);
      GWE.eventManager.subscribe(character, 'E_INCREASE_HP', this, this.handleCharacterIncreaseHP);
      GWE.eventManager.subscribe(character, 'E_DECREASE_HP', this, this.handleCharacterDecreaseHP);
      GWE.eventManager.subscribe(character, 'E_INCREASE_MP', this, this.handleCharacterIncreaseMP);
      GWE.eventManager.subscribe(character, 'E_DECREASE_MP', this, this.handleCharacterDecreaseMP);
      GWE.eventManager.subscribe(character, 'E_SEAL_ADD_FAILED', this, this.handleCharacterSealAddFailed);
      GWE.eventManager.subscribe(character, 'E_SEAL_ADDED', this, this.handleCharacterSealAdded);
      GWE.eventManager.subscribe(character, 'E_SEAL_REMOVE_FAILED', this, this.handleCharacterSealRemoveFailed);
      GWE.eventManager.subscribe(character, 'E_SEAL_REMOVED', this, this.handleCharacterSealRemoved);
      this.uiCharacterSprite.loadFromFileSync(character.getSpriteFile());
      this.uiCharacterSprite.play('IDLE', true);
      this.character = character;
    }
    else {
      this.character = null;
    }
  }

  isActive() {
    return this.node.classList.contains('u-active');
  }

  setActive(active) {
    this.node.classList.toggle('u-active', active);
  }

  async handleEffectInflict(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }
  
    this.uiEffectSprite.setVisible(true);
    this.uiEffectSprite.play(data.effect.getSpriteAnimationName());
    await GWE.eventManager.wait(this.uiEffectSprite, 'E_FINISHED');
    this.uiEffectSprite.setVisible(false);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterIncreaseHP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, data.amount, '#5ef500', 300);

    if (this.character.getAttribute('HP') > 0) {
      this.uiCharacterSprite.play('IDLE', true);
    }

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterDecreaseHP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await SHAKE(this.node, 300);
    await DRAW_TOAST(this.node, data.amount, '#f50000', 300);
    
    if (this.character.getAttribute('HP') <= 0) {
      this.uiCharacterSprite.play('DEATH');
      await GWE.eventManager.wait(this.uiCharacterSprite, 'E_FINISHED');
    }

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterIncreaseMP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'MP + ' + data.amount, '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterDecreaseMP(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'MP - ' + data.amount, '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealAddFailed(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal add failed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealAdded(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal added !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealRemoveFailed(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal remove failed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }

  async handleCharacterSealRemoved(data) {
    if (this.character instanceof HeroCharacter) {
      this.focus();
    }

    await DRAW_TOAST(this.node, 'Seal removed !', '#fff', 300);

    if (this.character instanceof HeroCharacter) {
      this.unfocus();
    }
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function SHAKE(node, ms) {
  return new Promise(resolve => {
    setTimeout(() => { node.classList.add('u-shake') }, 0);
    setTimeout(() => { node.classList.remove('u-shake'); resolve(); }, ms);
  });
}

function DRAW_TOAST(node, text, color, ms) {
  return new Promise(resolve => {
    let toast = document.createElement('div');
    toast.className = 'UIBattleAreaFighter-body-toast';
    toast.textContent = text;
    toast.style.color = color;
    node.querySelector('.UIBattleAreaFighter-body').appendChild(toast);
    setTimeout(() => { toast.remove(); resolve(); }, ms);
  });
}

module.exports.UIBattleAreaFighter = UIBattleAreaFighter;