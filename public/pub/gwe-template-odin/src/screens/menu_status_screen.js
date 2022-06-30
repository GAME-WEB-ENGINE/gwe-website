let { GWE } = require('gwe');
let { UIStatus } = require('../ui/ui_status');

class MenuStatusScreen extends GWE.Screen {
  constructor(app, hero) {
    super(app);
    this.hero = hero;
    this.uiTitle = new GWE.UIText();
    this.uiStatus = new UIStatus();
    this.handleKeyDownCb = (e) => this.handleKeyDown(e);
  }

  async onEnter() {
    this.uiTitle.setText('Status');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:0; width:100%; height:50px');

    this.uiStatus.setHero(this.hero);
    GWE.uiManager.addWidget(this.uiStatus, 'position:absolute; top:50px; left:0; bottom:0; width:100%');

    document.addEventListener('keydown', this.handleKeyDownCb);
  }

  onExit() {
    document.removeEventListener('keydown', this.handleKeyDownCb);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiStatus);
  }

  handleKeyDown(e) {
    if (e.key == 'Escape') {
      GWE.screenManager.requestPopScreen();
    }
  }
}

module.exports.MenuStatusScreen = MenuStatusScreen;