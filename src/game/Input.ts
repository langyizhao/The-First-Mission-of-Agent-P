export class InputHandler {
  keys: { [key: string]: boolean } = {};
  keyBuffer: string = '';

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key && e.key.length === 1) {
        this.keyBuffer += e.key.toUpperCase();
        if (this.keyBuffer.length > 20) {
          this.keyBuffer = this.keyBuffer.slice(-20);
        }
      }
      // Prevent default scrolling for Space and arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  isDown(code: string) {
    return !!this.keys[code];
  }

  isDirectionDown(dir: 'up' | 'down' | 'left' | 'right') {
    switch (dir) {
      case 'up': return this.isDown('ArrowUp') || this.isDown('KeyW');
      case 'down': return this.isDown('ArrowDown') || this.isDown('KeyS');
      case 'left': return this.isDown('ArrowLeft') || this.isDown('KeyA');
      case 'right': return this.isDown('ArrowRight') || this.isDown('KeyD');
    }
  }
}
