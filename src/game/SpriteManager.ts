export class SpriteManager {
  images: { [key: string]: HTMLImageElement } = {};
  loaded: { [key: string]: boolean } = {};

  loadImage(name: string, src: string) {
    const img = new Image();
    img.onload = () => {
      this.loaded[name] = true;
    };
    img.onerror = () => {
      console.error(`[SpriteManager] Failed to load image: ${src}`);
      this.loaded[name] = false;
    };
    img.src = src;
    this.images[name] = img;
  }

  isLoaded(name: string) {
    return this.loaded[name] === true;
  }

  getImage(name: string) {
    return this.images[name];
  }
}
