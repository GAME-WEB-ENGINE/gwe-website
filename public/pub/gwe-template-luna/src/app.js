window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { BootScreen } = require('./screens/boot_screen');

  let app = new GWE.Application(600, 600, GWE.SizeModeEnum.FIXED);
  GWE.screenManager.requestSetScreen(new BootScreen(app));
  requestAnimationFrame(ts => app.run(ts));
});