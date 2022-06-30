let { GWE } = require('gwe');

class CameraFollow {
  constructor() {
    this.targetDrawable = null;
    this.minClipOffset = [0, 0];
    this.maxClipOffset = [0, 0];
    this.view = GWE.gfx3Manager.getView(0);

    this.view.setProjectionMode(GWE.ProjectionModeEnum.PERSPECTIVE);
    GWE.gfx3Manager.setShowDebug(true);
  }

  async loadFromData(data) {
    this.minClipOffset[0] = data['MinClipOffsetX'];
    this.minClipOffset[1] = data['MinClipOffsetY'];
    this.maxClipOffset[0] = data['MaxClipOffsetX'];
    this.maxClipOffset[1] = data['MaxClipOffsetY'];
    this.view.setCameraMatrix(data['Matrix']);
    this.view.setPerspectiveFovy(GWE.Utils.DEG_TO_RAD(parseInt(data['Fovy'])));
  }

  update(ts) {
    if (!this.targetDrawable) {
      return;
    }

    let clipOffset = this.view.getClipOffset();
    let worldPosition = this.targetDrawable.getPosition();
    let screenPosition = GWE.gfx3Manager.getScreenPosition(0, worldPosition[0], worldPosition[1], worldPosition[2]);

    this.view.setClipOffset(
      GWE.Utils.CLAMP(screenPosition[0] + clipOffset[0], this.minClipOffset[0], this.maxClipOffset[0]),
      GWE.Utils.CLAMP(screenPosition[1] + clipOffset[1], this.minClipOffset[1], this.maxClipOffset[1])
    );
  }

  setTargetDrawable(targetDrawable) {
    this.targetDrawable = targetDrawable;
  }
}

module.exports.CameraFollow = CameraFollow;