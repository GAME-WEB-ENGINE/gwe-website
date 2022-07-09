class Gfx2TextureManager {
  constructor() {
    this.textures = {};
  }

  async loadTexture(path) {
    return new Promise(resolve => {
      if (this.textures[path]) {
        return resolve(this.textures[path]);
      }

      let image = new Image();
      image.src = path;
      image.addEventListener('load', () => {
        this.textures[path] = image;
        resolve(image);
      });
    });
  }

  deleteTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx2TextureManager::deleteTexture(): The texture file doesn\'t exist, cannot delete !');
    }

    this.textures[path] = null;
    delete this.textures[path];
  }

  getTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx2TextureManager::getTexture(): The texture file doesn\'t exist, cannot get !');
    }

    return this.textures[path];
  }

  getDefaultTexture() {
    let image = new Image();
    image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    return image;
  }

  releaseTextures() {
    for (let path in this.textures) {
      this.textures[path] = null;
      delete this.textures[path];
    }
  }
}

module.exports.gfx2TextureManager = new Gfx2TextureManager();