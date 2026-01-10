/* ===== LANDING PAGE - BOUNCING LOGO ===== */
const logoCanvas = document.getElementById("logo-canvas");
const logoCtx = logoCanvas.getContext("2d");
const playBtn = document.getElementById("play-btn");
const landingPage = document.getElementById("landing-page");
const gamePage = document.getElementById("game-page");
const winScreen = document.getElementById("win-screen");
const restartBtn = document.getElementById("restart-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const mobileControls = document.getElementById("mobile-controls");

// Detect if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/* ===== SOUND SYSTEM ===== */
const sounds = {
  shoot: new Audio('/sounds/shoot.wav'),
  explosion: new Audio('/sounds/explosion.wav'),
  fastinvader1: new Audio('/sounds/fastinvader1.wav'),
  fastinvader2: new Audio('/sounds/fastinvader2.wav'),
  fastinvader3: new Audio('/sounds/fastinvader3.wav'),
  fastinvader4: new Audio('/sounds/fastinvader4.wav'),
  invaderhit1: new Audio('/sounds/invaderhit1.wav'),
  invaderhit3: new Audio('/sounds/invaderhit3.wav'),
  invaderkilled: new Audio('/sounds/invaderkilled.wav')
};

// Set volume to prevent clipping
Object.values(sounds).forEach(sound => {
  sound.volume = 0.5;
});

let lastInvaderMoveSound = 0;
let currentInvaderSoundIdx = 0;

// Play invader movement sound (cycle through 4 sounds)
function playInvaderMoveSound() {
  const now = Date.now();
  if (now - lastInvaderMoveSound > 400) { // 400ms between sounds
    const soundName = ['fastinvader1', 'fastinvader2', 'fastinvader3', 'fastinvader4'][currentInvaderSoundIdx];
    const sound = sounds[soundName];
    sound.currentTime = 0;
    sound.play().catch(() => {}); // Ignore play errors
    currentInvaderSoundIdx = (currentInvaderSoundIdx + 1) % 4;
    lastInvaderMoveSound = now;
  }
}

// Play shoot sound (prevent overlap)
function playShootSound() {
  sounds.shoot.currentTime = 0;
  sounds.shoot.play().catch(() => {});
}

// Play enemy hit sound
function playEnemyHitSound() {
  const hitSound = Math.random() > 0.5 ? sounds.invaderhit1 : sounds.invaderhit3;
  hitSound.currentTime = 0;
  hitSound.play().catch(() => {});
}

// Play enemy killed sound
function playEnemyKilledSound() {
  sounds.invaderkilled.currentTime = 0;
  sounds.invaderkilled.play().catch(() => {});
}

// Play explosion sound
function playExplosionSound() {
  sounds.explosion.currentTime = 0;
  sounds.explosion.play().catch(() => {});
}

// Load DVD image for bouncing logo
const dvdImage = new Image();
dvdImage.src = "Images/dvd.png";
dvdImage.onload = () => {
  // Image loaded, ready to draw
};

// Load player sprite image
const playerImage = new Image();
playerImage.src = "Images/fire1.png";
playerImage.onload = () => {
  // Image loaded, ready to draw player
};

// Load enemy sprite image
const enemyImage = new Image();
enemyImage.src = "Images/enimy.png";
enemyImage.onload = () => {
  // Image loaded, ready to draw enemies
};

// Fullscreen logo canvas setup
function resizeLogoCanvas() {
  logoCanvas.width = window.innerWidth;
  logoCanvas.height = window.innerHeight;
}
resizeLogoCanvas();
window.addEventListener("resize", resizeLogoCanvas);

// Bouncing logo animation (DVD image)
const logo = {
  x: logoCanvas.width / 2 - 100,
  y: logoCanvas.height / 2 - 100,
  vx: 4,
  vy: 4,
  width: 200,
  height: 200
};

function drawPixelatedLogo(x, y, size) {
  // Draw the DVD image instead of pixelated logo
  if (dvdImage.complete && dvdImage.naturalWidth > 0) {
    logoCtx.drawImage(dvdImage, x, y, size, size);
  }
}

function animateBouncingLogo() {
  logoCtx.fillStyle = "#000";
  logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
  
  // Bounce off walls
  if (logo.x + logo.vx <= 0 || logo.x + logo.width + logo.vx >= logoCanvas.width) {
    logo.vx = -logo.vx;
  }
  if (logo.y + logo.vy <= 0 || logo.y + logo.height + logo.vy >= logoCanvas.height) {
    logo.vy = -logo.vy;
  }
  
  logo.x += logo.vx;
  logo.y += logo.vy;
  
  drawPixelatedLogo(logo.x, logo.y, logo.width);
  
  if (landingPage && !landingPage.classList.contains("hidden")) {
    requestAnimationFrame(animateBouncingLogo);
  }
}

animateBouncingLogo();

/* ===== GAME LOGIC ===== */
const gameCanvas = document.getElementById("game-canvas");
const gameCtx = gameCanvas.getContext("2d");
const livesDisplay = document.getElementById("lives-display");
const scoreDisplay = document.getElementById("score-display");

// Fullscreen canvas setup
function resizeGameCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
}
resizeGameCanvas();
window.addEventListener("resize", resizeGameCanvas);

// Mouse position tracking
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight - 100;
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Touch controls for mobile
document.addEventListener("touchmove", (e) => {
  if (gameState.isRunning && !gameState.isOver && !gameState.isWon) {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    e.preventDefault();
  }
}, { passive: false });

// Fullscreen handler
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Color palette
const colorArray = ["#124e78", "#f0f0c9", "#f2bb05", "#d74e09", "#6e0e0a"];

// Game state
let gameState = {
  isRunning: false,
  isOver: false,
  isWon: false,
  isScene: false,
  score: 0,
  lives: 3,
  level: 1,
  enemiesDefeated: 0,
  totalEnemies: 0
};

// ===== DYNAMIC SCALING BASED ON SCREEN SIZE =====
// Calculate size multiplier based on viewport dimensions
// Smaller screens get smaller UI elements; larger screens get standard sizes
function getScreenScaleFactor() {
  const width = Math.max(window.innerWidth, 320);
  const height = Math.max(window.innerHeight, 500);
  
  // Base breakpoints for progressive scaling
  const minWidth = 320;   // smallest mobile
  const maxWidth = 1920;  // largest desktop
  
  // Clamp viewport width to range, then calculate normalized factor (0 to 1)
  const normalizedWidth = Math.max(0, Math.min(1, (width - minWidth) / (maxWidth - minWidth)));
  
  // Size factor: small screens (0.4x), large screens (1.0x)
  // Only affects visual element sizes, NOT game speed
  const sizeFactor = 0.4 + normalizedWidth * 0.6;
  
  return { sizeFactor, width, height };
}

// Get current screen scale
let screenScale = getScreenScaleFactor();

// Update scale on window resize
window.addEventListener('resize', () => {
  screenScale = getScreenScaleFactor();
});

// Auto-fire controls
let spaceHeld = false;
let lastShotTime = 0;
// Player auto-fire rate (lower = faster firing)
const FIRE_RATE_MS = 280; // milliseconds between auto-shots (much slower)

// Player (slightly larger)
const player = {
  x: 0,
  y: 0,
  width: 40,
  height: 50,
  dx: 6,
  color: "#f0f0c9",
  lasers: [],
  bulletSpeed: 6,
  maxLasers: 4
};

// Scale player size based on screen size
function scalePlayerSize() {
  player.width = Math.max(20, Math.round(40 * screenScale.sizeFactor));
  player.height = Math.max(25, Math.round(50 * screenScale.sizeFactor));
}

scalePlayerSize();

// Re-scale on window resize
window.addEventListener('resize', () => {
  scalePlayerSize();
});

// Enemies array
let enemies = [];
let defensiveBlocks = [];
const sceneBtn = document.getElementById("scene-btn");

// Enemy formations for ENVO letters - 10-12 ENEMIES TOTAL
function createENVOFormation() {
  enemies = [];
  gameState.enemiesDefeated = 0;

  // Letter pixel patterns - simplified (3 rows x 3 cols) for easier gameplay
  const patterns = {
    E: [
      "111",
      "100",
      "111"
    ],
    N: [
      "101",
      "111",
      "101"
    ],
    V: [
      "101",
      "101",
      "010"
    ],
    O: [
      "111",
      "101",
      "111"
    ]
  };

  const letterOrder = [
    { name: "E", color: "#124e78" },
    { name: "N", color: "#f0f0c9" },
    { name: "V", color: "#f2bb05" },
    { name: "O", color: "#d74e09" }
  ];

  // Scale enemy size based on screen size
  const cellSize = Math.round(42 * screenScale.sizeFactor); // scale from 21 (small) to 42 (large)
  const spacing = 24; // increased gap between enemy pixels for more space
  // start lower on screen so enemies come from mid-area
  const startY = 140;
  let enemyId = 0;
  // Position letters evenly across the canvas (calculate per-letter width)
  const letterWidths = letterOrder.map(lo => {
    const p = patterns[lo.name];
    const cols = p[0].length;
    return cols * cellSize + (cols - 1) * spacing;
  });

  const totalLetterWidth = letterWidths.reduce((a, b) => a + b, 0) + spacing * (letterOrder.length - 1);
  let baseX = Math.max(40, (gameCanvas.width - totalLetterWidth) / 2);

  for (let L = 0; L < letterOrder.length; L++) {
    const letter = letterOrder[L].name;
    const color = letterOrder[L].color;
    const pattern = patterns[letter];
    const cols = pattern[0].length;

    const letterOffsetX = baseX + letterWidths.slice(0, L).reduce((a, b) => a + b, 0) + L * spacing;

    for (let row = 0; row < pattern.length; row++) {
      const rowStr = pattern[row];
      for (let col = 0; col < rowStr.length; col++) {
        if (rowStr[col] === "1") {
          const ex = letterOffsetX + col * (cellSize + spacing);
          const ey = startY + row * (cellSize + spacing);
          enemies.push({
            id: enemyId++,
            x: ex,
            y: ey,
            width: cellSize,
            height: cellSize,
            vx: enemy_vx,
            // render these formation enemies as small UFOs for style
            isUFO: true,
            color: color,
            letter: null,
            isAlive: true,
            lasers: [],
            // base shot chance (higher -> more often they fire)
            shotChance: 0.004,
            isDead: false,
            deadTime: 0
          });
        }
      }
    }
  }

  gameState.totalEnemies = enemies.length;
}

// Create defensive blocks with letters E, N, V, O
function createDefensiveBlocks() {
  defensiveBlocks = [];
  // Scale block sizes based on screen size
  const blockWidth = Math.max(110, Math.round(220 * screenScale.sizeFactor));
  const blockHeight = Math.max(45, Math.round(90 * screenScale.sizeFactor));
  const gap = Math.max(20, Math.round(40 * screenScale.sizeFactor));
  const letters = ["E", "N", "V", "O"];
  const colors = ["#124e78", "#f0f0c9", "#f2bb05", "#d74e09"];

  const totalWidth = (blockWidth * letters.length) + (gap * (letters.length - 1));
  let startX = (gameCanvas.width - totalWidth) / 2;
  // positioned slightly higher to accommodate larger blocks
  const y = gameCanvas.height - 200;

  for (let i = 0; i < letters.length; i++) {
    defensiveBlocks.push({
      x: startX + i * (blockWidth + gap),
      y: y,
      width: blockWidth,
      height: blockHeight,
      letter: letters[i],
      color: colors[i],
      health: 5
    });
  }
}

// Draw pixelated letter on block
function drawLetterBlock(x, y, width, height, letter, color, health) {
  gameCtx.save();
  // outer rounded base
  gameCtx.fillStyle = color;
  gameCtx.strokeStyle = "#111";
  gameCtx.lineWidth = 2;
  roundRect(gameCtx, x, y, width, height, 10);
  gameCtx.fill();
  gameCtx.stroke();

  // pixel grid overlay to simulate gradual breakdown
  const cols = Math.max(6, Math.floor(width / 14));
  const rows = Math.max(3, Math.floor(height / 14));
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);

  const healthRatio = Math.max(0, Math.min(1, (typeof health === 'number' ? health : 5) / 5));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = (Math.floor(x) * 73 + Math.floor(y) * 97 + r * 13 + c * 17) % 100;
      const drawProb = seed / 100;
      // draw fewer pixels when health is low
      if (drawProb < healthRatio) {
        const px = x + c * cellW + 1;
        const py = y + r * cellH + 1;
        // darker shade for inner pixels
        gameCtx.fillStyle = shadeColor(color, -20 - Math.floor((1 - healthRatio) * 60));
        gameCtx.fillRect(px, py, Math.max(4, cellW - 2), Math.max(4, cellH - 2));
      }
    }
  }

  // draw small letter label
  gameCtx.fillStyle = "#000";
  gameCtx.font = "bold 18px 'Press Start 2P'";
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "middle";
  gameCtx.fillText(letter, x + width / 2, y + height / 2);
  gameCtx.restore();
}

// Draw player
function drawPlayer() {
  if (playerImage.complete && playerImage.naturalWidth > 0) {
    gameCtx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  } else {
    // Fallback to geometric shape if image not loaded
    gameCtx.fillStyle = player.color;
    gameCtx.fillRect(player.x, player.y, player.width, player.height);
    gameCtx.fillRect(player.x + 8, player.y + 4, player.width - 16, player.height - 16);
    gameCtx.fillRect(player.x + 4, player.y + 28, player.width - 8, 18);
  }
}

// Draw enemy
function drawEnemy(enemy) {
  if (enemy.isAlive && !enemy.isDead) {
    // Draw enemy sprite if loaded
    if (enemyImage.complete && enemyImage.naturalWidth > 0) {
      gameCtx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    } else if (enemy.isUFO) {
      drawAnimeUFO(enemy);
    } else {
      gameCtx.fillStyle = enemy.color;
      gameCtx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      gameCtx.strokeStyle = "#fff";
      gameCtx.lineWidth = 1;
      gameCtx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
      // draw letter label inside enemy (larger font)
      gameCtx.fillStyle = "#000";
      gameCtx.font = "18px 'Press Start 2P'";
      gameCtx.textAlign = "center";
      gameCtx.textBaseline = "middle";
      if (enemy.letter) gameCtx.fillText(enemy.letter, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    }
  } else if (enemy.isDead && enemy.deadTime < 20) {
    gameCtx.fillStyle = "#ff6600";
    gameCtx.fillRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
  }
}

// Realistic UFO drawing with metallic saucer and glowing effects
function drawAnimeUFO(u) {
  const ctx = gameCtx;
  ctx.save();

  // strong outer glow for UFO atmosphere
  ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
  ctx.shadowBlur = Math.max(12, (u.width + u.height) * 0.15);

  // metallic saucer base (ellipse shape)
  const sx = u.x;
  const sy = u.y + u.height * 0.35;
  const sw = u.width * 0.95;
  const sh = u.height * 0.45;

  // metallic gradient - silver/grey metallic look
  const metalGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
  metalGrad.addColorStop(0, '#e8e8e8');
  metalGrad.addColorStop(0.3, '#b0b0b0');
  metalGrad.addColorStop(0.5, '#808080');
  metalGrad.addColorStop(0.7, '#b0b0b0');
  metalGrad.addColorStop(1, '#e8e8e8');
  ctx.fillStyle = metalGrad;
  ctx.beginPath();
  ctx.ellipse(sx + sw / 2, sy + sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // rim highlight on saucer
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(sx + sw / 2, sy + sh / 2 - 2, sw / 2 - 3, sh / 2 - 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // cockpit dome - large glass dome with cyan glow
  const cx = u.x + u.width * 0.5;
  const cy = u.y + u.height * 0.25;
  const drx = u.width * 0.32;
  const dry = u.height * 0.28;

  // dome inner gradient (cyan/blue)
  const domeGrad = ctx.createRadialGradient(cx, cy - dry * 0.3, 0, cx, cy, drx);
  domeGrad.addColorStop(0, 'rgba(100, 220, 255, 0.85)');
  domeGrad.addColorStop(0.5, 'rgba(50, 180, 255, 0.7)');
  domeGrad.addColorStop(1, 'rgba(20, 100, 200, 0.6)');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, drx, dry, 0, 0, Math.PI * 2);
  ctx.fill();

  // dome outline
  ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, drx, dry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // bottom landing lights (red/orange)
  ctx.fillStyle = 'rgba(255, 100, 50, 0.9)';
  ctx.beginPath();
  ctx.arc(sx + sw * 0.25, sy + sh * 0.7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx + sw * 0.75, sy + sh * 0.7, 3, 0, Math.PI * 2);
  ctx.fill();

  // pulsing glow effect around UFO
  const pulseAlpha = 0.3 + 0.2 * Math.sin(Date.now() * 0.005);
  ctx.fillStyle = `rgba(100, 200, 255, ${pulseAlpha})`;
  ctx.beginPath();
  ctx.ellipse(cx, sy + sh / 2, sw / 2 + 8, sh / 2 + 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

// Draw lasers
function drawLasers() {
  // Draw player lasers
  gameCtx.fillStyle = "#00ff00";
  for (let laser of player.lasers) {
    const w = laser.width || 3;
    const h = laser.height || 10;
    gameCtx.fillRect(laser.x, laser.y, w, h);
  }

  // Draw enemy lasers
  gameCtx.fillStyle = "#ff5555";
  for (let enemy of enemies) {
    for (let laser of enemy.lasers) {
      const w = laser.width || 3;
      const h = laser.height || 10;
      gameCtx.fillRect(laser.x, laser.y, w, h);
    }
  }
}

// Update player position
function updatePlayer(keys) {
  // Mouse control - smooth follow for improved shot stability
  const targetX = Math.max(0, Math.min(mouseX - player.width / 2, gameCanvas.width - player.width));
  // interpolate towards target to reduce jitter (0 = no movement, 1 = instant)
  const SMOOTH = 0.28;
  player.x += (targetX - player.x) * SMOOTH;

  // Optional: keyboard fallback (adds to smoothed position)
  // Game speed stays constant on all devices
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x = Math.max(0, player.x - player.dx);
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x = Math.min(gameCanvas.width - player.width, player.x + player.dx);
  }
}

// Player shoot (vertical-only, slow)
function playerShoot() {
  if (player.lasers.length < player.maxLasers) {
    const lw = 4;
    const lh = 12;
    const sx = Math.round(player.x + player.width / 2 - lw / 2);
    const sy = Math.round(player.y);

    // Game speed stays constant on all devices
    player.lasers.push({
      x: sx,
      y: sy,
      vy: -player.bulletSpeed,
      vx: 0,
      width: lw,
      height: lh
    });
    
    // Play shoot sound
    playShootSound();
  }
}

// Update lasers
function updateLasers() {
  for (let i = player.lasers.length - 1; i >= 0; i--) {
    // update x as well for any horizontal assist velocity
    player.lasers[i].x += player.lasers[i].vx || 0;
    player.lasers[i].y += player.lasers[i].vy;
    
    // collision with defensive blocks (player shots)
    let hitBlock = false;
    for (let b = defensiveBlocks.length - 1; b >= 0; b--) {
      const block = defensiveBlocks[b];
      if (player.lasers[i] &&
          player.lasers[i].x < block.x + block.width &&
          player.lasers[i].x + player.lasers[i].width > block.x &&
          player.lasers[i].y < block.y + block.height &&
          player.lasers[i].y + player.lasers[i].height > block.y) {
        block.health--;
        if (block.health <= 0) {
          defensiveBlocks.splice(b, 1);
        }
        player.lasers.splice(i, 1);
        hitBlock = true;
        break;
      }
    }
    if (hitBlock) continue;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (enemy.isAlive &&
          player.lasers[i].x < enemy.x + enemy.width &&
          player.lasers[i].x + player.lasers[i].width > enemy.x &&
          player.lasers[i].y < enemy.y + enemy.height &&
          player.lasers[i].y + player.lasers[i].height > enemy.y) {
        
        enemy.isAlive = false;
        enemy.isDead = true;
        enemy.deadTime = 0;
        gameState.enemiesDefeated++;
        gameState.score += 100;
        
        // Play enemy killed sound
        playEnemyKilledSound();
        
        player.lasers.splice(i, 1);
        break;
      }
    }
    
    if (player.lasers[i] && player.lasers[i].y < 0) {
      player.lasers.splice(i, 1);
    }
  }
  
      for (let enemy of enemies) {
    for (let i = enemy.lasers.length - 1; i >= 0; i--) {
      const l = enemy.lasers[i];
      // update both x and y for aimed shots
      l.x += l.vx || 0;
      l.y += l.vy || 0;

      // collision with player
      if (l.x < player.x + player.width &&
          l.x + l.width > player.x &&
          l.y < player.y + player.height &&
          l.y + l.height > player.y) {
        gameState.lives--;
        livesDisplay.textContent = `LIVES: ${gameState.lives}`;
        
        // Play explosion sound when player is hit
        playExplosionSound();

        if (gameState.lives <= 0) {
          gameState.isOver = true;
        }

        enemy.lasers.splice(i, 1);
        continue;
      }

      // collision with defensive blocks
      for (let block of defensiveBlocks) {
        if (l &&
            l.x < block.x + block.width &&
            l.x + l.width > block.x &&
            l.y < block.y + block.height &&
            l.y + l.height > block.y) {
          block.health--;
          enemy.lasers.splice(i, 1);
          break;
        }
      }

      // remove if out of bounds
      if (l && (l.y > gameCanvas.height + 50 || l.x < -50 || l.x > gameCanvas.width + 50)) {
        enemy.lasers.splice(i, 1);
      }
    }
  }
}

// Global enemy speed variable
// Enemy base horizontal speed (keep moderate for classic pace)
let enemy_vx = 1.2;

// Difficulty scaling factor (increases slightly each direction flip)
const ENEMY_SPEED_SCALE = 1.06;
// Enemy firing frequency multiplier (same on all devices)
const ENEMY_FIRE_FACTOR = 1.0;

// Update enemies
function updateEnemies() {
  let leftBound = gameCanvas.width;
  let rightBound = 0;
  
  for (let enemy of enemies) {
    if (enemy.isAlive) {
      enemy.x += enemy.vx;
      
      if (enemy.x < leftBound) leftBound = enemy.x;
      if (enemy.x + enemy.width > rightBound) rightBound = enemy.x + enemy.width;
    }
  }
  
  // Play invader movement sound periodically
  if (enemies.some(e => e.isAlive)) {
    playInvaderMoveSound();
  }
  
  if (rightBound >= gameCanvas.width || leftBound <= 0) {
    // Reverse direction and slightly increase speed to ramp difficulty
    enemy_vx = -enemy_vx * ENEMY_SPEED_SCALE;
    for (let enemy of enemies) {
      if (enemy.isAlive) {
        enemy.vx = -enemy.vx * ENEMY_SPEED_SCALE;
        // Drop slower on mobile (half speed: 9 instead of 18)
        enemy.y += isMobile ? 9 : 18;
      }
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive && enemy.y + enemy.height >= player.y) {
      gameState.isOver = true;
      gameState.lives = 0;
      playExplosionSound(); // Play explosion when game over
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive) {
      // increase firing probability as fewer enemies remain
      const aliveFactor = 1 + (gameState.enemiesDefeated / Math.max(1, gameState.totalEnemies)) * 3;
      const chance = enemy.shotChance * aliveFactor * ENEMY_FIRE_FACTOR;
      if (Math.random() < chance) {
        // Enemy fires slow vertical-only shot
        const sx = enemy.x + enemy.width / 2;
        const sy = enemy.y + enemy.height;
        const speed = 3.0; // slow vertical shots (constant speed)
        enemy.lasers.push({
          x: sx,
          y: sy,
          vx: 0,
          vy: speed,
          width: 4,
          height: 12
        });
      }
    }
    
    if (enemy.isDead) {
      enemy.deadTime++;
      if (enemy.deadTime > 20) {
        enemy.isDead = false;
      }
    }
  }
}

// Clear canvas
function clearCanvas() {
  gameCtx.fillStyle = "#000";
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
}

// Game loop
function gameLoop() {
  if (!gameState.isRunning) return;
  
  clearCanvas();
  
  if (!gameState.isOver && !gameState.isWon) {
    updatePlayer(keysPressed);
    updateEnemies();
    updateLasers();
    // Auto-fire when space is held
    // Fire rate stays constant on all devices
    if (spaceHeld && Date.now() - lastShotTime >= FIRE_RATE_MS) {
      playerShoot();
      lastShotTime = Date.now();
    }
    
    if (gameState.enemiesDefeated === gameState.totalEnemies) {
      gameState.isWon = true;
      playExplosionSound(); // Play explosion when all enemies are defeated
      showWinScreen();
      return;
    }
  }
  
  drawPlayer();
  for (let enemy of enemies) {
    drawEnemy(enemy);
  }
  drawLasers();
  
  for (let block of defensiveBlocks) {
    // Keep blocks at full opacity regardless of damage
    gameCtx.globalAlpha = 1;
    drawLetterBlock(block.x, block.y, block.width, block.height, block.letter, block.color, block.health);
  }
  
  if (gameState.isOver) {
    gameCtx.fillStyle = "rgba(0,0,0,0.7)";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameCtx.fillStyle = "#fff";
    gameCtx.font = "bold 40px 'Press Start 2P'";
    gameCtx.textAlign = "center";
    gameCtx.fillText("GAME OVER", gameCanvas.width / 2, gameCanvas.height / 2);
    gameCtx.font = "20px 'Press Start 2P'";
    gameCtx.fillText("Play again?", gameCanvas.width / 2, gameCanvas.height / 2 + 48);
  }
  
  requestAnimationFrame(gameLoop);
}

// Show win screen
function showWinScreen() {
  winScreen.classList.remove("hidden");
}

// Helper: shade hex color by percent (-100..100)
function shadeColor(hex, percent) {
  try {
    const c = hex.replace('#','');
    const num = parseInt(c,16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ( (r<<16) | (g<<8) | b ).toString(16).padStart(6,'0');
  } catch (e) {
    return hex;
  }
}

// Restart game helper
function restartGame() {
  // Reset state
  gameState.isOver = false;
  gameState.isWon = false;
  gameState.score = 0;
  gameState.lives = 3;
  livesDisplay.textContent = `LIVES: ${gameState.lives}`;
  scoreDisplay.textContent = `SCORE: ${gameState.score}`;
  createENVOFormation();
  createDefensiveBlocks();
  winScreen.classList.add('hidden');
  if (!gameState.isRunning) gameState.isRunning = true;
  gameLoop();
}

// Canvas click to restart when game over
gameCanvas.addEventListener('click', () => {
  if (gameState.isOver) {
    restartGame();
  }
});

// Send contact message handler (no external links)
const sendContactBtn = document.getElementById('send-contact');
if (sendContactBtn) sendContactBtn.addEventListener('click', () => {
  const msg = document.getElementById('contact-message');
  if (msg) {
    // locally acknowledge message
    alert('Message received. Thank you!');
    msg.value = '';
    winScreen.classList.add('hidden');
  }
});

// Keyboard handling
const keysPressed = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  // start space hold
  if (e.code === "Space") {
    spaceHeld = true;
    // immediate shot on press
    if (gameState.isRunning && !gameState.isOver && !gameState.isWon) {
      // Fire rate stays constant on all devices
      if (Date.now() - lastShotTime >= FIRE_RATE_MS) {
        playerShoot();
        lastShotTime = Date.now();
      }
    }
    e.preventDefault();
  }
  
  if ((e.code === "KeyW" || e.key === "w") && gameState.isRunning && !gameState.isOver && !gameState.isWon) {
    playerShoot();
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
  if (e.code === "Space") spaceHeld = false;
});

// Mouse click to shoot
document.addEventListener("click", () => {
  if (gameState.isRunning && !gameState.isOver && !gameState.isWon) {
    playerShoot();
  }
});

// Touch to shoot for mobile
document.addEventListener("touchstart", (e) => {
  if (gameState.isRunning && !gameState.isOver && !gameState.isWon && isMobile) {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    playerShoot();
  }
});

// Play button
playBtn.addEventListener("click", () => {
  landingPage.classList.add("hidden");
  gamePage.classList.remove("hidden");
  
  // Initialize player position
  player.x = gameCanvas.width / 2 - 20;
  player.y = gameCanvas.height - 70;
  
  gameState.isRunning = true;
  gameState.isOver = false;
  gameState.isWon = false;
  gameState.score = 0;
  gameState.lives = 3;
  
  livesDisplay.textContent = `LIVES: 3`;
  scoreDisplay.textContent = `SCORE: 0`;
  
  createENVOFormation();
  createDefensiveBlocks();
  gameLoop();
});

if (restartBtn) restartBtn.addEventListener('click', () => { restartGame(); });

// Scene preview: create a small set of anime UFOs
function createAnimeUFOPreview(count = 5) {
  enemies = [];
  gameState.enemiesDefeated = 0;
  const padding = 80;
  const available = gameCanvas.width - padding * 2;
  for (let i = 0; i < count; i++) {
    const size = 48 + (i % 2) * 8;
    const x = padding + (i + 0.5) * (available / count) - size / 2;
    const y = 120 + Math.sin(i) * 14;
    enemies.push({
      id: `anime-${i}`,
      x: x,
      y: y,
      width: size,
      height: size * 0.64,
      vx: (Math.random() * 0.6 + 0.2) * (i % 2 === 0 ? 1 : -1),
      bobOffset: Math.random() * 10,
      isUFO: true,
      isAlive: true,
      lasers: [],
      shotChance: 0
    });
  }
  gameState.totalEnemies = enemies.length;
}

if (sceneBtn) {
  sceneBtn.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    
    // Initialize player position
    player.x = gameCanvas.width / 2 - 20;
    player.y = gameCanvas.height - 70;
    
    gameState.isRunning = true;
    gameState.isOver = false;
    gameState.isWon = false;
    gameState.isScene = true;
    createAnimeUFOPreview(6);
    defensiveBlocks = [];
    gameLoop();
  });
}

// Restart button
restartBtn.addEventListener("click", () => {
  winScreen.classList.add("hidden");
  gamePage.classList.remove("hidden");
  
  // Initialize player position
  player.x = gameCanvas.width / 2 - 20;
  player.y = gameCanvas.height - 70;
  
  gameState.isRunning = true;
  gameState.isOver = false;
  gameState.isWon = false;
  gameState.score = 0;
  gameState.lives = 3;
  
  livesDisplay.textContent = `LIVES: 3`;
  scoreDisplay.textContent = `SCORE: 0`;
  
  createENVOFormation();
  createDefensiveBlocks();
  gameLoop();
});

// Auto-start game on mobile devices for touch-optimized experience
if (isMobile) {
  // Small timeout to allow layout and canvas sizing to settle
  setTimeout(() => {
    if (!gameState.isRunning) {
      landingPage.classList.add("hidden");
      gamePage.classList.remove("hidden");
      
      // Show mobile controls
      if (mobileControls) mobileControls.classList.remove("hidden");
      
      // Initialize player position
      player.x = gameCanvas.width / 2 - 20;
      player.y = gameCanvas.height - 70;
      
      gameState.isRunning = true;
      gameState.isOver = false;
      gameState.isWon = false;
      gameState.score = 0;
      gameState.lives = 3;
      
      livesDisplay.textContent = `LIVES: 3`;
      scoreDisplay.textContent = `SCORE: 0`;
      
      createENVOFormation();
      createDefensiveBlocks();
      gameLoop();
    }
  }, 300);
}
