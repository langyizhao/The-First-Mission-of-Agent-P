import { InputHandler } from './Input';
import { Player, Enemy, StationaryEnemy, FastEnemy, HeavyEnemy, Projectile, Entity, Direction } from './Entities';
import { SpriteManager } from './SpriteManager';

export class Game {
  input: InputHandler;
  player: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  time: number = 0;
  sprites: SpriteManager;
  
  tileSize: number = 50;
  mapWidth: number = 16;
  mapHeight: number = 12;
  
  // 1 = wall, 0 = floor
  map: number[][] = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  constructor() {
    this.input = new InputHandler();
    this.player = new Player(100, 100);
    this.sprites = new SpriteManager();
    // Instruct the game to load the tilesheets
    this.sprites.loadImage('tileset', '/Environment.jpeg');
    this.sprites.loadImage('player', '/player.png');
    this.sprites.loadImage('enemy', '/enemy.png');
    this.initLevel();
  }

  initLevel() {
    this.enemies = [];
    this.projectiles = [];
    
    // Spawn basic enemy
    this.enemies.push(new StationaryEnemy(400, 100));
    this.enemies.push(new StationaryEnemy(100, 400));
    
    // Spawn fast enemy
    this.enemies.push(new FastEnemy(600, 500));
    this.enemies.push(new FastEnemy(600, 100));
    
    // Spawn heavy enemy
    this.enemies.push(new HeavyEnemy(300, 450));
  }

  update(dt: number) {
    this.time += dt * 1000;
    
    this.player.update(dt, this);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        enemy.update(dt, this);
        if (enemy.toRemove) {
            this.enemies.splice(i, 1);
        }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        proj.update(dt, this);
        if (proj.toRemove) {
            this.projectiles.splice(i, 1);
        }
    }
    
    // Win/Loss Condition
    if (this.player.toRemove) {
        // Simple respawn
        this.player = new Player(100, 100);
        this.initLevel();
    }
    
    if (this.enemies.length === 0) {
        // Win! Respawn for now
        this.player.x = 100;
        this.player.y = 100;
        this.player.hp = this.player.maxHp;
        this.initLevel();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const tilesetLoaded = this.sprites.isLoaded('tileset');
    const tilesetImg = this.sprites.getImage('tileset');
    
    // Draw Map
    for (let r = 0; r < this.mapHeight; r++) {
      for (let c = 0; c < this.mapWidth; c++) {
        const tile = this.map[r][c];
        const cx = c * this.tileSize;
        const cy = r * this.tileSize;
        
        if (tilesetLoaded && tilesetImg && tilesetImg.width > 0) {
            // Slice roughly a 1/6th square from the environment sheet as it looks like a large grid
            const sliceW = Math.floor(tilesetImg.width / 6);
            const sliceH = Math.floor(tilesetImg.height / 6);
            ctx.globalAlpha = tile === 0 ? 0.3 : 1.0; // Dim the floor slightly
            ctx.drawImage(tilesetImg, 0, 0, sliceW, sliceH, cx, cy, this.tileSize, this.tileSize);
            ctx.globalAlpha = 1.0;
        } else {
            // Fallback
            if (tile === 1) {
                ctx.fillStyle = '#374151'; // Wall (dark gray)
            } else {
                ctx.fillStyle = '#1f2937'; // Floor (darker gray)
            }
            
            ctx.fillRect(cx, cy, this.tileSize, this.tileSize);
            
            // Grid lines optional
            ctx.strokeStyle = '#111827';
            ctx.strokeRect(cx, cy, this.tileSize, this.tileSize);
        }
      }
    }

    // Draw Entities
    for (const enemy of this.enemies) {
        enemy.draw(ctx, this.time, this);
    }

    for (const proj of this.projectiles) {
        proj.draw(ctx, this.time);
    }

    this.player.draw(ctx, this.time, this);
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 20, 30);
    ctx.fillText(`Enemies: ${this.enemies.length}`, 20, 60);
  }

  checkWallCollision(entity: Entity): boolean {
    const left = Math.floor(entity.x / this.tileSize);
    const right = Math.floor((entity.x + entity.w - 0.1) / this.tileSize);
    const top = Math.floor(entity.y / this.tileSize);
    const bottom = Math.floor((entity.y + entity.h - 0.1) / this.tileSize);

    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        if (this.map[r] && this.map[r][c] === 1) {
          return true;
        }
      }
    }
    return false;
  }

  spawnProjectile(x: number, y: number, facing: Direction, isPlayerOwned: boolean) {
    this.projectiles.push(new Projectile(x, y, facing, isPlayerOwned));
  }
}
