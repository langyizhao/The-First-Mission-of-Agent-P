export class SpriteManager {
  images: { [key: string]: HTMLImageElement } = {};
  loaded: { [key: string]: boolean } = {};

  loadImage(name: string, src: string) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.loaded[name] = true;
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      this.loaded[name] = false;
    };
    this.images[name] = img;
  }

  isLoaded(name: string) {
    return this.loaded[name] === true;
  }

  getImage(name: string) {
    return this.images[name];
  }
}
