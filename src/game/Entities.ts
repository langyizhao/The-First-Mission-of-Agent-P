import { Game } from './Game';

export type Direction = 'up' | 'down' | 'left' | 'right';

export class Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  hp: number;
  maxHp: number;
  speed: number = 0;
  facing: Direction = 'down';
  toRemove: boolean = false;

  constructor(x: number, y: number, w: number, h: number, color: string, hp: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.hp = hp;
    this.maxHp = hp;
  }

  update(dt: number, game: Game) {
    // Override in subclasses
  }

  draw(ctx: CanvasRenderingContext2D, time: number, game?: Game) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    
    // Draw HP bar if HP < maxHp
    if (this.hp < this.maxHp && this.hp > 0) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y - 8, this.w, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(this.x, this.y - 8, this.w * (this.hp / this.maxHp), 4);
    }
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.toRemove = true;
    }
  }

  intersects(other: Entity) {
    return this.x < other.x + other.w &&
           this.x + this.w > other.x &&
           this.y < other.y + other.h &&
           this.y + this.h > other.y;
  }
}

export class Player extends Entity {
  lastShot: number = 0;
  isMoving: boolean = false;
  moveTimer: number = 0;
  invulnerableTimer: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 32, 48, '#3b82f6', 10);
    this.speed = 180;
  }

  update(dt: number, game: Game) {
    let dx = 0;
    let dy = 0;

    let moved = false;

    if (game.input.isDirectionDown('left')) { dx -= 1; this.facing = 'left'; moved = true; }
    if (game.input.isDirectionDown('right')) { dx += 1; this.facing = 'right'; moved = true; }
    if (game.input.isDirectionDown('up')) { dy -= 1; this.facing = 'up'; moved = true; }
    if (game.input.isDirectionDown('down')) { dy += 1; this.facing = 'down'; moved = true; }

    this.isMoving = moved;
    if (this.isMoving) {
        this.moveTimer += dt;
    } else {
        this.moveTimer = 0;
    }

    if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= dt;
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    // Move X
    if (dx !== 0) {
      this.x += dx * this.speed * dt;
      if (game.checkWallCollision(this)) {
        this.x -= dx * this.speed * dt; // Revert
      }
    }
    // Move Y
    if (dy !== 0) {
      this.y += dy * this.speed * dt;
      if (game.checkWallCollision(this)) {
        this.y -= dy * this.speed * dt; // Revert
      }
    }

    // Shooting
    if (game.input.isDown('Space') && game.time - this.lastShot > 500) {
      this.lastShot = game.time;
      game.spawnProjectile(this.x + this.w / 2, this.y + this.h / 2, this.facing, true);
    }
  }

  draw(ctx: CanvasRenderingContext2D, time: number, game?: Game) {
    if (this.invulnerableTimer > 0 && Math.floor(time / 100) % 2 === 0) {
        // Blink logic - don't draw player this frame
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.restore();
        
        // ensure HP bar is still drawn over the "invisible" player
        if (this.hp < this.maxHp && this.hp > 0) {
          ctx.fillStyle = 'red';
          ctx.fillRect(this.x, this.y - 8, this.w, 4);
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(this.x, this.y - 8, this.w * (this.hp / this.maxHp), 4);
        }
        return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    const bop = this.isMoving ? Math.sin(this.moveTimer * 15) * 4 : 0;
    
    const playerLoaded = game?.sprites?.isLoaded('player');
    const playerImg = game?.sprites?.getImage('player');

    if (playerLoaded && playerImg && playerImg.width > 0) {
      // Maintain actual aspect ratio of the image
      const targetSize = Math.max(this.w, this.h) * 2.5;
      let dw = targetSize;
      let dh = targetSize;
      if (playerImg.width > playerImg.height) {
          dh = targetSize * (playerImg.height / playerImg.width);
      } else {
          dw = targetSize * (playerImg.width / playerImg.height);
      }
      
      const dx = -(dw - this.w) / 2;
      const dy = -(dh - this.h) / 2;
      ctx.drawImage(playerImg, 0, 0, playerImg.width, playerImg.height, dx, dy + bop, dw, dh);
    } else {
      // Body fallback
      ctx.fillStyle = this.color;
      ctx.fillRect(0, bop, this.w, this.h - bop);

      // Direction indicator (Eyes)
      ctx.fillStyle = '#1e3a8a';
      const eyeSize = 6;
      if (this.facing === 'down') {
          ctx.fillRect(4, bop + 8, eyeSize, eyeSize);
          ctx.fillRect(this.w - 4 - eyeSize, bop + 8, eyeSize, eyeSize);
      } else if (this.facing === 'up') {
      } else if (this.facing === 'left') {
          ctx.fillRect(2, bop + 8, eyeSize, eyeSize);
      } else if (this.facing === 'right') {
          ctx.fillRect(this.w - 2 - eyeSize, bop + 8, eyeSize, eyeSize);
      }
    }

    ctx.restore();
    
    // Draw HP bar manually instead of super.draw to prevent solid color block redraw
    if (this.hp < this.maxHp && this.hp > 0) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y - 8, this.w, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(this.x, this.y - 8, this.w * (this.hp / this.maxHp), 4);
    }
  }
}

export class Enemy extends Entity {
    updateMovement(dt: number, game: Game, dx: number, dy: number) {
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }

        if (dx !== 0) {
            this.x += dx * this.speed * dt;
            if (game.checkWallCollision(this)) {
                this.x -= dx * this.speed * dt;
            }
        }
        if (dy !== 0) {
            this.y += dy * this.speed * dt;
            if (game.checkWallCollision(this)) {
                this.y -= dy * this.speed * dt;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, time: number, game?: Game) {
        const enemyLoaded = game?.sprites?.isLoaded('enemy');
        const enemyImg = game?.sprites?.getImage('enemy');

        if (enemyLoaded && enemyImg && enemyImg.width > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Maintain actual aspect ratio of the image
            const targetSize = Math.max(this.w, this.h) * 2.5;
            let dw = targetSize;
            let dh = targetSize;
            if (enemyImg.width > enemyImg.height) {
                dh = targetSize * (enemyImg.height / enemyImg.width);
            } else {
                dw = targetSize * (enemyImg.width / enemyImg.height);
            }
            
            const dx = -(dw - this.w) / 2;
            const dy = -(dh - this.h) / 2;
            ctx.drawImage(enemyImg, 0, 0, enemyImg.width, enemyImg.height, dx, dy, dw, dh);
            
            ctx.restore();
            
            // Draw HP Custom
            if (this.hp < this.maxHp && this.hp > 0) {
                ctx.fillStyle = 'red';
                ctx.fillRect(this.x, this.y - 8, this.w, 4);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(this.x, this.y - 8, this.w * (this.hp / this.maxHp), 4);
            }
        } else {
            super.draw(ctx, time, game);
        }
    }
}

export class SlowEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 40, 40, '#ef4444', 3);
    this.speed = 40; // Slow speed
  }

  update(dt: number, game: Game) {
    const dx = game.player.x - this.x;
    const dy = game.player.y - this.y;
    this.updateMovement(dt, game, dx, dy);
  }
}

export class FastEnemy extends Enemy {
  constructor(x: number, y: number) {
    super(x, y, 24, 24, '#f59e0b', 1);
    this.speed = 220; // Faster than player
  }

  update(dt: number, game: Game) {
    // Chase logic
    const dx = game.player.x - this.x;
    const dy = game.player.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 400 && dist > 2) {
      this.updateMovement(dt, game, dx, dy);
    }
  }
}

export class HeavyEnemy extends Enemy {
  startX: number;
  dir: number = 1;
  lastShot: number = 0;

  constructor(x: number, y: number) {
    super(x, y, 48, 48, '#7f1d1d', 5);
    this.speed = 60; // Slow
    this.startX = x;
  }

  update(dt: number, game: Game) {
    // Patrol logic
    const prevX = this.x;
    this.updateMovement(dt, game, this.dir, 0);
    
    // If stuck against a wall or reached patrol limit, reverse direction
    if (this.x === prevX || Math.abs(this.x - this.startX) > 150) {
        this.dir *= -1;
        // bump slightly to prevent re-triggering constantly
        this.x += this.dir * 2;
    }

    // Ranged attack logic
    const dx = game.player.x - this.x;
    const dy = game.player.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 350 && game.time - this.lastShot > 1500) {
        this.lastShot = game.time;
        
        let facing: Direction = 'down';
        if (Math.abs(dx) > Math.abs(dy)) {
            facing = dx > 0 ? 'right' : 'left';
        } else {
            facing = dy > 0 ? 'down' : 'up';
        }

        game.spawnProjectile(this.x + this.w / 2, this.y + this.h / 2, facing, false);
    }
  }
}

export class Briefcase extends Entity {
  constructor(x: number, y: number) {
    super(x, y, 48, 48, '#facc15', 1);
  }

  update(dt: number, game: Game) {
    if (this.intersects(game.player)) {
      this.toRemove = true;
      game.gameState = 'won';
      game.stateTime = 0;
      game.input.keys = {};
    }
  }

  draw(ctx: CanvasRenderingContext2D, time: number, game?: Game) {
    const loaded = game?.sprites?.isLoaded('briefcase');
    const img = game?.sprites?.getImage('briefcase');

    if (loaded && img && img.width > 0) {
      ctx.drawImage(img, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}

export class Projectile extends Entity {
  vx: number = 0;
  vy: number = 0;
  isPlayerOwned: boolean;

  constructor(x: number, y: number, facing: Direction, isPlayerOwned: boolean) {
    super(x - 5, y - 5, 10, 10, isPlayerOwned ? '#06b6d4' : '#ef4444', 1); // cyan or red
    this.speed = 400;
    this.isPlayerOwned = isPlayerOwned;

    if (facing === 'up') this.vy = -this.speed;
    else if (facing === 'down') this.vy = this.speed;
    else if (facing === 'left') this.vx = -this.speed;
    else if (facing === 'right') this.vx = this.speed;
  }

  update(dt: number, game: Game) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Check Wall Collision
    if (game.checkWallCollision(this)) {
      this.toRemove = true;
      return;
    }

    // Check hit
    if (this.isPlayerOwned) {
        for (const enemy of game.enemies) {
            if (this.intersects(enemy)) {
                enemy.takeDamage(1);
                this.toRemove = true;
                return;
            }
        }
    } else {
        if (this.intersects(game.player)) {
            // Apply invulnerable system here as well to bullets
            if (game.player.invulnerableTimer <= 0) {
              game.player.takeDamage(1);
              game.player.invulnerableTimer = 1.0;
            }
            this.toRemove = true;
        }
    }
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.w/2, this.y + this.h/2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }
}
