let { GWE } = require('gwe');

class UIDuelist extends GWE.UIWidget {
  constructor() {
    super({
      className: 'UIDuelist',
      template: `
      <div class="UIDuelist-picture js-picture"></div>
      <div class="UIDuelist-infos">
        <div class="UIDuelist-infos-name js-name"></div>
        <div class="UIDuelist-infos-lifepoints js-lifepoints"></div>
      </div>`
    });

    this.duelist = null;
  }

  update() {
    if (this.duelist) {
      this.node.querySelector('.js-picture').style.backgroundImage = `url(${this.duelist.getPictureFile()})`;
      this.node.querySelector('.js-name').textContent = this.duelist.getName();
      this.node.querySelector('.js-lifepoints').textContent = this.duelist.getAttribute('LIFEPOINTS');
    }
    else {
      this.node.querySelector('.js-picture').style.backgroundImage = 'url()';
      this.node.querySelector('.js-name').textContent = '--';
      this.node.querySelector('.js-lifepoints').textContent = '0';
    }
  }

  setDuelist(duelist) {
    GWE.eventManager.unsubscribe(this.duelist, 'E_DAMAGE', this);
    GWE.eventManager.unsubscribe(this.duelist, 'E_RESTORE', this);

    if (duelist) {
      GWE.eventManager.subscribe(duelist, 'E_DAMAGE', this, this.handleDuelistDamage);
      GWE.eventManager.subscribe(duelist, 'E_RESTORE', this, this.handleDuelistRestore);
      this.duelist = duelist;
    }
    else {
      this.duelist = null;
    }
  }

  showSelection() {
    this.node.classList.add('u-showSelection');
  }

  hideSelection() {
    this.node.classList.remove('u-showSelection');
  }

  handleDuelistDamage(data) {
    DRAW_TOAST(this.node, '-' + data.amount, '#fff', 1000);
    SHAKE(this.node, 300);
  }

  handleDuelistRestore(data) {
    DRAW_TOAST(this.node, '+' + data.amount, '#fff', 1000);
  }

  onKeyDown(e) {
    if (e.key == 'Enter') {
      GWE.eventManager.emit(this, 'E_ENTER_PRESSED');
    }
    else if (e.key == 'Space') {
      GWE.eventManager.emit(this, 'E_SPACE_PRESSED');
    }
  }
}

module.exports.UIDuelist = UIDuelist;

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
    toast.className = 'UIDuelist-toast';
    toast.textContent = text;
    toast.style.color = color;
    node.appendChild(toast);
    setTimeout(() => { toast.remove(); resolve(); }, ms);
  });
}