let { GWE } = require('gwe');

class CameraFollow {
  constructor() {
    this.targetDrawable = null;
    this.minClipOffset = [0, 0];
    this.maxClipOffset = [0, 0];
    this.view = GWE.gfx3Manager.getView(0);

    this.view.setProjectionMode(GWE.ProjectionModeEnum.ORTHOGRAPHIC);
    this.view.setOrthographicSize(8.4);
    this.view.setOrthographicDepth(100);
    this.view.setCameraMatrix([1.0000, 0.0000, -0.0000, 0.0000, -0.0000, 0.0000, -1.0000, 0.0000, -0.0000, 1.0000,  0.0000, 0.0000, -0.0000, 8.4545,  0.0000, 1.0000]);
    GWE.gfx3Manager.setShowDebug(true);
  }

  async loadFromData(data) {
    this.minClipOffset[0] = data['MinClipOffsetX'];
    this.minClipOffset[1] = data['MinClipOffsetY'];
    this.maxClipOffset[0] = data['MaxClipOffsetX'];
    this.maxClipOffset[1] = data['MaxClipOffsetY'];
  }

  update(ts) {
    if (!this.targetDrawable) {
      return;
    }

    let clipOffset = this.view.getClipOffset();
    let targetPosition = this.targetDrawable.getPosition();
    let targetScreenPosition = GWE.gfx3Manager.getScreenPosition(0, targetPosition[0], targetPosition[1], targetPosition[2]);

    this.view.setClipOffset(
      GWE.Utils.CLAMP(targetScreenPosition[0] + clipOffset[0], this.minClipOffset[0], this.maxClipOffset[0]),
      GWE.Utils.CLAMP(targetScreenPosition[1] + clipOffset[1], this.minClipOffset[1], this.maxClipOffset[1])
    );
  }

  setTargetDrawable(targetDrawable) {
    this.targetDrawable = targetDrawable;
  }
}

module.exports.CameraFollow = CameraFollow;