let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class UIInputRange extends UIWidget {
  constructor() {
    super({
      className: 'UIInputRange',
      template: `
      <div class="UIInputRange-prevIcon"><</div>
      <div class="UIInputRange-value js-value">0</div>
      <div class="UIInputRange-nextIcon">></div>`
    });

    this.value = 0;
    this.min = 0;
    this.max = 0;
    this.step = 1;
  }

  setValue(value) {
    if (value == this.value) {
      return;
    }

    this.node.querySelector('.js-value').textContent = value;
    this.value = value;
  }

  setMin(min) {
    this.min = min;
  }

  setMax(max) {
    this.max = max;
  }

  setStep(step) {
    this.step = step;
  }

  onKeyDown(e) {
    if (e.key == 'ArrowLeft' && this.value - this.step >= this.min) {
      this.value -= this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }
    else if (e.key == 'ArrowRight' && this.value + this.step <= this.max) {
      this.value += this.step;
      eventManager.emit(this, 'E_VALUE_CHANGED', { value: this.value });
    }

    this.node.querySelector('.js-value').textContent = this.value;
  }
}

module.exports.UIInputRange = UIInputRange;