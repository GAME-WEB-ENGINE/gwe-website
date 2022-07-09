let { GWE } = require('gwe');

class SelectionRect extends GWE.Gfx2Drawable {
  constructor() {
    super();
  }

  paint() {
    const ctx = GWE.gfx2Manager.getContext();
    ctx.fillStyle = 'rgba(225,225,225,0.5)';
    ctx.fillRect(0, 0, 16, 16);
  }
}

module.exports.SelectionRect = SelectionRect;