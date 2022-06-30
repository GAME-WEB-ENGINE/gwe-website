window.addEventListener('load', async () => {
  let { GWE } = require('gwe');
  let { BootScreen } = require('./screens/boot_screen');
  let { gameManager } = require('./game_manager');
  
  await gameManager.loadFromFile('./assets/player.json');
  GWE.screenManager.requestSetScreen(new BootScreen(gameManager));
  requestAnimationFrame(ts => gameManager.run(ts));
});