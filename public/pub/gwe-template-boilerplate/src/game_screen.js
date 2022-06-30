let { GWE } = require('gwe');

let CAMERA_SPEED = 0.1;

class GameScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.isDragging = false;
    this.dragStartPosition = [0, 0];
    this.dragStartRotation = [0, 0];
    this.view = GWE.gfx3Manager.getView(0);
    this.cube = new GWE.Gfx3JAM();
  }

  async onEnter() {
    GWE.gfx3Manager.setShowDebug(true);

    await this.cube.loadFromFile('./assets/models/cube.jam');
    this.cube.setPosition(0, 0, -10);
    this.cube.play('IDLE', true);
    this.cube.setTexture(await GWE.gfx3TextureManager.loadTexture('./assets/models/cube.jpg'));

    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mouseup', () => this.handleMouseUp());
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  update(ts) {
    let cameraMatrix = this.view.getCameraMatrix();
    let move = [0, 0, 0];

    if (GWE.inputManager.isKeyDown('ArrowLeft')) {
      move[0] += cameraMatrix[0] * CAMERA_SPEED * -1;
      move[1] += cameraMatrix[1] * CAMERA_SPEED * -1;
      move[2] += cameraMatrix[2] * CAMERA_SPEED * -1; 
    }

    if (GWE.inputManager.isKeyDown('ArrowRight')) {
      move[0] += cameraMatrix[0] * CAMERA_SPEED * +1;
      move[1] += cameraMatrix[1] * CAMERA_SPEED * +1;
      move[2] += cameraMatrix[2] * CAMERA_SPEED * +1; 
    }

    if (GWE.inputManager.isKeyDown('ArrowUp')) {
      move[0] += cameraMatrix[ 8] * CAMERA_SPEED * -1;
      move[1] += cameraMatrix[ 9] * CAMERA_SPEED * -1;
      move[2] += cameraMatrix[10] * CAMERA_SPEED * -1; 
    }

    if (GWE.inputManager.isKeyDown('ArrowDown')) {
      move[0] += cameraMatrix[ 8] * CAMERA_SPEED * +1;
      move[1] += cameraMatrix[ 9] * CAMERA_SPEED * +1;
      move[2] += cameraMatrix[10] * CAMERA_SPEED * +1;
    }

    this.view.move(move[0], move[1], move[2]);
    this.cube.update(ts);
  }

  draw(viewIndex) {
    this.cube.draw();
    GWE.gfx3Manager.drawDebugGrid(GWE.Utils.MAT4_ROTATE_X(Math.PI * 0.5), 20, 1);
  }

  handleMouseDown(e) {    
    this.isDragging = true;
    this.dragStartPosition[0] = e.clientX;
    this.dragStartPosition[1] = e.clientY;
    this.dragStartRotation[0] = this.view.getRotationX();
    this.dragStartRotation[1] = this.view.getRotationY();
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseMove(e) {
    if (!this.isDragging) {
      return;
    }

    let newRotationX = this.dragStartRotation[0] + ((e.clientY - this.dragStartPosition[1]) * 0.001);
    let newRotationY = this.dragStartRotation[1] + ((e.clientX - this.dragStartPosition[0]) * 0.001);
    this.view.setRotation(newRotationX, newRotationY, 0);
  }
}

module.exports.GameScreen = GameScreen;