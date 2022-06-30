let { GWE } = require('gwe');

class UIBackground extends GWE.UISprite {
  constructor() {
    super({
      className: 'UIBackground'
    });

    this.node.addEventListener('animationend', () => GWE.eventManager.emit(this, 'E_ANIMATION_FINISHED'));
  }
}

module.exports.UIBackground = UIBackground;