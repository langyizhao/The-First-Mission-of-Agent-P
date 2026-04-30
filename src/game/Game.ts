import { InputHandler } from './Input';
import { Player, Enemy, SlowEnemy, FastEnemy, HeavyEnemy, Projectile, Entity, Direction, Briefcase } from './Entities';
import { SpriteManager } from './SpriteManager';

import { envImageB64, playerImageB64, enemyImageB64, briefcaseImageB64 } from './assetsBase64';

export class Game {
  input: InputHandler;
  player: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  briefcase: Briefcase | null = null;
  time: number = 0;
  sprites: SpriteManager;
  gameState: 'playing' | 'failed' | 'won' = 'playing';
  stateTime: number = 0;
  
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
    this.sprites.loadImage('tileset', envImageB64);
    this.sprites.loadImage('player', playerImageB64);
    this.sprites.loadImage('enemy', enemyImageB64);
    this.sprites.loadImage('briefcase', briefcaseImageB64);
    this.initLevel();
  }

  initLevel() {
    this.enemies = [];
    this.projectiles = [];
    this.briefcase = null;
    
    // Spawn basic enemy
    this.enemies.push(new SlowEnemy(500, 100)); // right side
    this.enemies.push(new SlowEnemy(150, 400)); // left side, but not exactly under player
    
    // Spawn fast enemy
    this.enemies.push(new FastEnemy(600, 500));
    this.enemies.push(new FastEnemy(600, 100));
    
    // Spawn heavy enemy
    this.enemies.push(new HeavyEnemy(300, 450));
  }

  update(dt: number) {
    this.time += dt * 1000;
    
    if (this.gameState === 'failed' || this.gameState === 'won') {
        this.stateTime += dt * 1000;
        if (this.stateTime > 1000) { // wait 1s before allowing restart
            const anyKeyPressed = Object.values(this.input.keys).some(v => v);
            if (anyKeyPressed) {
                this.gameState = 'playing';
                this.stateTime = 0;
                this.player = new Player(100, 100);
                this.initLevel();
            }
        }
        return;
    }

    this.player.update(dt, this);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        enemy.update(dt, this);
        
        // Touch collision with player
        if (enemy.intersects(this.player)) {
            if (this.player.invulnerableTimer <= 0) {
                this.player.takeDamage(1);
                this.player.invulnerableTimer = 1.0;
            }
        }
        
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
    if (this.player.toRemove && this.gameState === 'playing') {
        this.gameState = 'failed';
        this.stateTime = 0;
        // Reset keys so holding a key doesn't trigger instant restart after timer
        this.input.keys = {};
    }
    
    // Cheat code: GUIDE
    if (this.input.keyBuffer.includes('GUIDE')) {
        this.enemies = [];
        this.input.keyBuffer = this.input.keyBuffer.replace('GUIDE', '');
    }

    if (this.enemies.length === 0 && !this.briefcase) {
        // Spawn briefcase at marked location (higher, between upper blocks)
        this.briefcase = new Briefcase(this.mapWidth * this.tileSize / 2 - 24, 4 * this.tileSize - 24);
    }

    if (this.briefcase) {
        this.briefcase.update(dt, this);
        if (this.briefcase.toRemove) {
            this.briefcase = null;
        }
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

    if (this.briefcase) {
        this.briefcase.draw(ctx, this.time, this);
    }

    this.player.draw(ctx, this.time, this);
    
    // UI
    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 20, 30);
    ctx.fillText(`Enemies: ${this.enemies.length}`, 20, 60);

    if (this.gameState === 'failed') {
        const cw = this.mapWidth * this.tileSize;
        const ch = this.mapHeight * this.tileSize;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#ef4444';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION FAILED', cw / 2, ch / 2);
        ctx.fillStyle = 'white';
        ctx.font = '20px monospace';
        ctx.fillText('Press any key to restart', cw / 2, ch / 2 + 40);
        ctx.textAlign = 'left';
    } else if (this.gameState === 'won') {
        const cw = this.mapWidth * this.tileSize;
        const ch = this.mapHeight * this.tileSize;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#10b981'; // green for won
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MISSION ACCOMPLISHED', cw / 2, ch / 2);
        ctx.fillStyle = 'white';
        ctx.font = '20px monospace';
        ctx.fillText('Press any key to replay', cw / 2, ch / 2 + 40);
        ctx.textAlign = 'left';
    }
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
