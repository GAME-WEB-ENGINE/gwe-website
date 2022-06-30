let { GWE } = require('gwe');

class UIEffects extends GWE.UIListView {
  constructor() {
    super();
  }

  addItem(item, enabled = true, index = -1) {
    let widget = new UIEffectsItem();
    widget.setEffect(item);
    this.addWidget(widget, enabled, index);
  }
}

class UIEffectsItem extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIEffectsItem',
      template: `
      <span class="UIEffectsItem-name js-name"></span>`
    });

    this.effect = null;
  }
  
  update(ts) {
    if (this.effect) {
      this.node.querySelector('.js-name').textContent = this.effect.getName();
    }
    else {
      this.node.querySelector('.js-name').textContent = '--';
    }
  }

  getEffect() {
    return this.effect;
  }

  setEffect(effect) {
    this.effect = effect ? effect : null;
  }
}

module.exports.UIEffects = UIEffects;