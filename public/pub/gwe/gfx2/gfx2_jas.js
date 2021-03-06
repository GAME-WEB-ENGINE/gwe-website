let { eventManager } = require('../event/event_manager');
let { Gfx2Drawable } = require('./gfx2_drawable');
let { gfx2Manager } = require('./gfx2_manager');
let { gfx2TextureManager } = require('./gfx2_texture_manager');

class JAS {
  constructor() {
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

class Gfx2JAS extends Gfx2Drawable {
  constructor() {
    super();
    this.jas = new JAS();
    this.texture = gfx2TextureManager.getDefaultTexture();
    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.isLooped = false;
    this.frameProgress = 0;
  }

  getTexture() {
    return this.texture;
  }

  setTexture(texture) {
    this.texture = texture;
  }

  update(ts) {
    let currentAnimation = this.jas.animations.find(a => a.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    if (this.frameProgress >= currentAnimation.frameDuration) {
      if (this.currentAnimationFrameIndex == currentAnimation.frames.length - 1) {
        eventManager.emit(this, 'E_FINISHED');
        this.currentAnimationFrameIndex = this.isLooped ? 0 : currentAnimation.frames.length - 1;
        this.frameProgress = 0;
      }
      else {
        this.currentAnimationFrameIndex = this.currentAnimationFrameIndex + 1;
        this.frameProgress = 0;
      }
    }
    else {
      this.frameProgress += ts;
    }
  }

  paint(ts) {
    let currentAnimation = this.jas.animations.find(animation => animation.name == this.currentAnimationName);
    if (!currentAnimation) {
      return;
    }

    let ctx = gfx2Manager.getContext();
    let currentFrame = currentAnimation.frames[this.currentAnimationFrameIndex];

    ctx.drawImage(
      this.texture,
      currentFrame.x,
      currentFrame.y,
      currentFrame.width,
      currentFrame.height,
      0,
      0,
      currentFrame.width,
      currentFrame.height
    );
  }

  play(animationName, isLooped = false, preventSameAnimation = false) {
    if (preventSameAnimation && animationName == this.currentAnimationName) {
      return;
    }

    let animation = this.jas.animations.find(animation => animation.name == animationName);
    if (!animation) {
      throw new Error('Gfx2JAS::play: animation not found.');
    }

    this.currentAnimationName = animationName;
    this.currentAnimationFrameIndex = 0;
    this.isLooped = isLooped;
    this.frameProgress = 0;
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    this.jas = new JAS();

    for (let obj of json['Animations']) {
      let animation = new JASAnimation();
      animation.name = obj['Name'];
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

    this.currentAnimationName = '';
    this.currentAnimationFrameIndex = 0;
    this.frameProgress = 0;
  }
}

module.exports.Gfx2JAS = Gfx2JAS;