let { eventManager } = require('../event/event_manager');
let { UIWidget } = require('./ui_widget');

class JAS {
  constructor() {
    this.imageFile = '';
    this.animations = [];
  }
}

class JASFrame {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class JASAnimation {
  constructor() {
    this.name = '';
    this.frames = [];
    this.frameDuration = 0;
  }
}

class UISprite extends UIWidget {
  constructor(options = {}) {
    super({
      className: options.className ?? 'UISprite'
    });

    this.jas = new JAS();
    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.isLooped = false;
    this.timeElapsed = 0;
  }

  update(ts) {
    let currentAnimation = this.jas.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let currentFrame = currentAnimation.frames[this.currentAnimationFrameIndex];

    this.node.style.backgroundPositionX = -currentFrame.x + 'px';
    this.node.style.backgroundPositionY = -currentFrame.y + 'px';
    this.node.style.width = currentFrame.width + 'px';
    this.node.style.height = currentFrame.height + 'px';

    if (this.timeElapsed >= currentAnimation.frameDuration) {
      if (this.currentAnimationFrameIndex == currentAnimation.frames.length - 1) {
        eventManager.emit(this, 'E_FINISHED');
        this.currentAnimationFrameIndex = this.isLooped ? 0 : currentAnimation.frames.length - 1;
        this.timeElapsed = 0;
      }
      else {
        this.currentAnimationFrameIndex = this.currentAnimationFrameIndex + 1;
        this.timeElapsed = 0;
      }
    }
    else {
      this.timeElapsed += ts;
    }
  }

  loadFromData(data) {
    this.jas = new JAS();
    this.jas.imageFile = data['ImageFile'];

    for (let obj of data['Animations']) {
      let animation = new JASAnimation();
      animation.name = obj['Name'];
      animation.frames = [];
      animation.frameDuration = parseInt(obj['FrameDuration']);

      for (let objFrame of obj['Frames']) {
        let frame = new JASFrame();
        frame.x = objFrame['X'];
        frame.y = objFrame['Y'];
        frame.width = objFrame['Width'];
        frame.height = objFrame['Height'];
        animation.frames.push(frame);
      }

      this.jas.animations.push(animation);
    }

    this.node.style.backgroundImage = 'url("' + this.jas.imageFile + '")';
    this.currentAnimationName = '';
    this.currentAnimationIndex = 0;
    this.timeElapsed = 0;
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    this.loadFromData(await response.json());
  }

  loadFromFileSync(path) {
    let request = new XMLHttpRequest();
    request.open('GET', path, false);
    request.send(null);
    this.loadFromData(JSON.parse(this.responseText));
  }

  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    let animation = this.jas.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('UISprite::play: animation not found.');
    }

    this.currentAnimationName = animationName;
    this.currentAnimationFrameIndex = 0;
    this.isLooped = isLooped;
    this.timeElapsed = 0;
  }
}

module.exports.UISprite = UISprite;