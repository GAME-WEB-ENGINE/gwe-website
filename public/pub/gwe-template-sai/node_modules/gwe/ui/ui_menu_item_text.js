let { UIWidget } = require('./ui_widget');

class UIMenuItemText extends UIWidget {
  constructor(options = {}) {
    super({
      className: 'UIMenuItemText'
    });

    this.node.textContent = options.text ?? '';
  }

  setText(text) {
    this.node.textContent = text;
  }
}

module.exports.UIMenuItemText = UIMenuItemText;