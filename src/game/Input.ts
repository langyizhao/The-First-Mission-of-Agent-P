export class InputHandler {
  keys: { [key: string]: boolean } = {};

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
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
