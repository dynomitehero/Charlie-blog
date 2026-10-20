/* Charlie: Battle for Sockford - 16-Bit HTML5 Engine
 * Studio: DynomiteHero
 * Lead Programmer Engine Implementation
 */

(function() {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Internal retro 16-bit resolution
  const WIDTH = 320;
  const HEIGHT = 240;

  // Game States
  const STATES = { TITLE: 0, PLAYING: 1, GAMEOVER: 2, VICTORY: 3 };
  let currentState = STATES.TITLE;

  // Saved progress / persistent data
  let saveData = {
    socks: 0,
    bones: 0,
    lives: 3,
    score: 0,
    unlockedCostumes: ['Classic Brown'],
    currentCostume: 'Classic Brown',
    hardMode: false
  };

  // Input Handler
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    bark: false,
    jump: false,
    dash: false,
    start: false
  };

  function setKey(code, isPressed) {
    switch(code) {
      case 'ArrowLeft': case 'KeyA': keys.left = isPressed; break;
      case 'ArrowRight': case 'KeyD': keys.right = isPressed; break;
      case 'ArrowUp': case 'KeyW': keys.up = isPressed; break;
      case 'ArrowDown': case 'KeyS': keys.down = isPressed; break;
      case 'KeyZ': case 'KeyJ': keys.bark = isPressed; break;
      case 'KeyX': case 'KeyK': case 'Space': keys.jump = isPressed; break;
      case 'KeyC': case 'KeyL': keys.dash = isPressed; break;
      case 'Enter': keys.start = isPressed; break;
    }
  }

  window.addEventListener('keydown', (e) => { setKey(e.code, true); });
  window.addEventListener('keyup', (e) => { setKey(e.code, false); });

  function triggerKeyAction(keyName) {
    if (currentState === STATES.TITLE) {
      currentState = STATES.PLAYING;
      initLevel();
    } else {
      keys[keyName] = true;
      setTimeout(() => { keys[keyName] = false; }, 150);
    }
  }

  // Mobile / UI Touch Controls
  function bindTouch(id, keyName) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerKeyAction(keyName); });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); triggerKeyAction(keyName); });
    btn.addEventListener('mouseup', (e) => { e.preventDefault(); keys[keyName] = false; });
  }

  bindTouch('btn-left', 'left');
  bindTouch('btn-right', 'right');
  bindTouch('btn-up', 'up');
  bindTouch('btn-down', 'down');
  bindTouch('btn-a', 'bark');
  bindTouch('btn-b', 'jump');
  bindTouch('btn-c', 'dash');

  // Allow clicking on canvas to start/interact
  canvas.addEventListener('click', () => {
    if (currentState === STATES.TITLE) {
      currentState = STATES.PLAYING;
      initLevel();
    }
  });

  // Game World Constants
  const GRAVITY = 0.35;
  const FLOOR_Y = 192;

  // Player Character: Charlie the Spaniel
  const charlie = {
    x: 40,
    y: 150,
    vx: 0,
    vy: 0,
    width: 20,
    height: 18,
    facingLeft: false,
    isGrounded: false,
    isDashing: false,
    dashTimer: 0,
    barkCooldown: 0,
    hp: 4,
    maxHp: 4,
    invulnTimer: 0,
    reset: function() {
      this.x = 40;
      this.y = 150;
      this.vx = 0;
      this.vy = 0;
      this.hp = this.maxHp;
      this.isDashing = false;
      this.dashTimer = 0;
    }
  };

  // Entities & Level Objects
  let projectiles = [];
  let collectibles = [];
  let enemies = [];

  function initLevel() {
    projectiles = [];
    collectibles = [
      { x: 100, y: 160, type: 'sock', collected: false },
      { x: 130, y: 160, type: 'sock', collected: false },
      { x: 160, y: 140, type: 'bone', collected: false },
      { x: 220, y: 160, type: 'sock', collected: false },
      { x: 250, y: 120, type: 'sock', collected: false }
    ];
    enemies = [
      { x: 180, y: 176, vx: -0.5, width: 16, height: 16, hp: 2, name: 'Squirrely' },
      { x: 280, y: 176, vx: -0.8, width: 18, height: 16, hp: 3, name: 'Vacuum Robot' }
    ];
    charlie.reset();
  }

  // Update Game Logic
  function update() {
    if (currentState === STATES.TITLE) {
      if (keys.jump || keys.start || keys.bark) {
        currentState = STATES.PLAYING;
        initLevel();
      }
      return;
    }

    if (currentState === STATES.GAMEOVER || currentState === STATES.VICTORY) {
      if (keys.jump || keys.start) {
        currentState = STATES.TITLE;
      }
      return;
    }

    // --- Player Movement & Mechanics ---
    // Bark Blast Attack
    if (charlie.barkCooldown > 0) charlie.barkCooldown--;
    if (keys.bark && charlie.barkCooldown === 0) {
      projectiles.push({
        x: charlie.facingLeft ? charlie.x - 6 : charlie.x + charlie.width,
        y: charlie.y + 4,
        vx: charlie.facingLeft ? -4 : 4,
        life: 30
      });
      charlie.barkCooldown = 18;
    }

    // Zoomies Dash
    if (charlie.dashTimer > 0) {
      charlie.dashTimer--;
      if (charlie.dashTimer === 0) charlie.isDashing = false;
    }

    if (keys.dash && !charlie.isDashing && charlie.dashTimer === 0) {
      charlie.isDashing = true;
      charlie.dashTimer = 20; // 20 frames of high speed invulnerability
      charlie.vx = charlie.facingLeft ? -5.5 : 5.5;
    }

    // Standard Movement
    if (!charlie.isDashing) {
      if (keys.left) {
        charlie.vx = -2.2;
        charlie.facingLeft = true;
      } else if (keys.right) {
        charlie.vx = 2.2;
        charlie.facingLeft = false;
      } else {
        charlie.vx *= 0.7;
      }

      if (keys.jump && charlie.isGrounded) {
        charlie.vy = -6.8;
        charlie.isGrounded = false;
      }
    }

    // Gravity
    charlie.vy += GRAVITY;
    charlie.x += charlie.vx;
    charlie.y += charlie.vy;

    // Boundary & Floor Collision
    if (charlie.x < 0) charlie.x = 0;
    if (charlie.x + charlie.width > WIDTH) charlie.x = WIDTH - charlie.width;

    if (charlie.y + charlie.height >= FLOOR_Y) {
      charlie.y = FLOOR_Y - charlie.height;
      charlie.vy = 0;
      charlie.isGrounded = true;
    }

    // Invulnerability Timer
    if (charlie.invulnTimer > 0) charlie.invulnTimer--;

    // --- Update Projectiles ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
      let p = projectiles[i];
      p.x += p.vx;
      p.life--;
      if (p.life <= 0 || p.x < 0 || p.x > WIDTH) {
        projectiles.splice(i, 1);
      }
    }

    // --- Update Collectibles ---
    collectibles.forEach(c => {
      if (!c.collected && checkOverlap(charlie, { x: c.x, y: c.y, width: 12, height: 12 })) {
        c.collected = true;
        if (c.type === 'sock') {
          saveData.socks++;
          saveData.score += 100;
          if (saveData.socks >= 100) {
            saveData.socks -= 100;
            saveData.lives++;
          }
        } else if (c.type === 'bone') {
          saveData.bones++;
          saveData.score += 250;
          if (charlie.hp < charlie.maxHp) charlie.hp++;
        }
      }
    });

    // --- Update Enemies ---
    enemies.forEach((e, eIndex) => {
      e.x += e.vx;
      if (e.x < 20 || e.x > 290) e.vx *= -1;

      // Projectile vs Enemy collision
      projectiles.forEach((p, pIndex) => {
        if (checkOverlap({ x: p.x, y: p.y, width: 8, height: 8 }, e)) {
          e.hp--;
          projectiles.splice(pIndex, 1);
          if (e.hp <= 0) {
            saveData.score += 500;
          }
        }
      });

      // Player vs Enemy collision
      if (e.hp > 0 && checkOverlap(charlie, e)) {
        if (charlie.isDashing) {
          e.hp = 0;
          saveData.score += 500;
        } else if (charlie.invulnTimer === 0) {
          charlie.hp--;
          charlie.invulnTimer = 45;
          charlie.vy = -3;
          if (charlie.hp <= 0) {
            saveData.lives--;
            if (saveData.lives <= 0) {
              currentState = STATES.GAMEOVER;
            } else {
              charlie.reset();
            }
          }
        }
      }
    });

    // Clean up dead enemies
    enemies = enemies.filter(e => e.hp > 0);

    // Check Victory
    if (enemies.length === 0 && collectibles.every(c => c.collected)) {
      currentState = STATES.VICTORY;
    }
  }

  function checkOverlap(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  // Render Engine Graphics
  function render() {
    // Clear screen with 16-bit retro sky color
    ctx.fillStyle = '#4080f0';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (currentState === STATES.TITLE) {
      // Title Screen Graphics
      ctx.fillStyle = '#000000';
      ctx.fillRect(10, 10, WIDTH - 20, HEIGHT - 20);

      ctx.fillStyle = '#f0a020';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHARLIE:', WIDTH / 2, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('BATTLE FOR SOCKFORD', WIDTH / 2, 80);

      ctx.fillStyle = '#a0a0a0';
      ctx.font = '10px monospace';
      ctx.fillText('SEGA MEGA DRIVE / GENESIS EDITION', WIDTH / 2, 110);
      ctx.fillText('DynomiteHero Studio', WIDTH / 2, 125);

      ctx.fillStyle = '#f0e040';
      ctx.fillText('CLICK / PRESS JUMP TO PLAY', WIDTH / 2, 175);
      return;
    }

    // Render Ground
    ctx.fillStyle = '#308020';
    ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
    ctx.fillStyle = '#805020';
    ctx.fillRect(0, FLOOR_Y + 4, WIDTH, HEIGHT - FLOOR_Y - 4);

    // Render Collectibles
    collectibles.forEach(c => {
      if (!c.collected) {
        if (c.type === 'sock') {
          ctx.fillStyle = '#f04040';
          ctx.fillRect(c.x, c.y, 8, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(c.x + 2, c.y, 4, 3);
        } else {
          ctx.fillStyle = '#f0f0d0';
          ctx.fillRect(c.x, c.y + 2, 12, 4);
          ctx.fillRect(c.x - 2, c.y, 4, 8);
          ctx.fillRect(c.x + 10, c.y, 4, 8);
        }
      }
    });

    // Render Enemies
    enemies.forEach(e => {
      ctx.fillStyle = e.name === 'Squirrely' ? '#d06020' : '#808090';
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x + 2, e.y + 3, 3, 3);
    });

    // Render Projectiles (Bark Blast)
    ctx.fillStyle = '#f0f040';
    projectiles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Charlie
    if (charlie.invulnTimer % 4 < 2) {
      // Charlie Body (Brown Cocker Spaniel)
      ctx.fillStyle = charlie.isDashing ? '#f0a020' : '#8a5229';
      ctx.fillRect(charlie.x, charlie.y, charlie.width, charlie.height);

      // Floppy Spaniel Ears
      ctx.fillStyle = '#5c3418';
      const earX = charlie.facingLeft ? charlie.x + 14 : charlie.x;
      ctx.fillRect(earX, charlie.y + 2, 6, 12);

      // Eyes & Snout
      ctx.fillStyle = '#000000';
      const eyeX = charlie.facingLeft ? charlie.x + 4 : charlie.x + 12;
      ctx.fillRect(eyeX, charlie.y + 4, 3, 3);
    }

    // Render HUD Header
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, WIDTH, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${'❤️'.repeat(charlie.hp)}`, 6, 12);
    ctx.fillText(`🧦: ${saveData.socks}`, 100, 12);
    ctx.fillText(`🦴: ${saveData.bones}`, 160, 12);
    ctx.fillText(`LIVES: ${saveData.lives}`, 220, 12);

    if (currentState === STATES.GAMEOVER) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#f04040';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('Press Jump to Restart', WIDTH / 2, HEIGHT / 2 + 20);
    } else if (currentState === STATES.VICTORY) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#40f040';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SOCKFORD SAVED!', WIDTH / 2, HEIGHT / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('Charlie is the Prince of Princes!', WIDTH / 2, HEIGHT / 2 + 20);
    }
  }

  // Main Loop
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  loop();
})();
