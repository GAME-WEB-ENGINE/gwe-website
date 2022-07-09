window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { MainScreen } = require('./main_screen');

  let app = new GWE.Application(600, 600, GWE.SizeModeEnum.FIXED, GWE.RenderingModeEnum.CANVAS_2D);
  GWE.screenManager.requestSetScreen(new MainScreen(app));
  requestAnimationFrame(ts => app.run(ts));
});