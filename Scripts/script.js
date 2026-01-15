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
const DROP_MOBILE = .1;   // mobile-এ খুব ধীর (তুমি চাইছিলে)
const DROP_PC     = 8;   // PC-তে দ্রুত/স্বাভাবিক
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

// Load enemy sprite animation frame pairs (each pair = 2 frames)
const enemySpritePairs = [
  // Pair 0: frames A and B
  [
    (() => { const img = new Image(); img.src = "Images/enemy.9.png"; return img; })(),
    (() => { const img = new Image(); img.src = "Images/enemy.10.png"; return img; })()
  ],
  // Pair 1: frames A and B
  [
    (() => { const img = new Image(); img.src = "Images/enemy.7.png"; return img; })(),
    (() => { const img = new Image(); img.src = "Images/enemy.8.png"; return img; })()
  ]
];

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

// When bouncing, toggle text color between white and black
let logoTextIsWhite = true;

function drawPixelatedLogo(x, y, size) {
  // Draw the DVD image instead of pixelated logo
  if (dvdImage.complete && dvdImage.naturalWidth > 0) {
    logoCtx.drawImage(dvdImage, x, y, size, size);
  } else {
    // Fallback: draw a simple pixelated text using square grid
    const grid = [
      "111011101",
      "101101001",
      "101101001",
      "111011101",
      "101101001",
      "101101001",
      "101011101"
    ];
    const cols = grid[0].length;
    const rows = grid.length;
    const cell = Math.max(4, Math.floor(size / Math.max(cols, rows) / 1.6));
    const startX = x + (size - cols * cell) / 2;
    const startY = y + (size - rows * cell) / 2;
    logoCtx.fillStyle = logoTextIsWhite ? '#fff' : '#000';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === '1') {
          logoCtx.fillRect(Math.round(startX + c * cell), Math.round(startY + r * cell), cell, cell);
        }
      }
    }
  }
}

function animateBouncingLogo() {
  logoCtx.fillStyle = "#000";
  logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
  
  // Bounce off walls
  if (logo.x + logo.vx <= 0 || logo.x + logo.width + logo.vx >= logoCanvas.width) {
    logo.vx = -logo.vx;
    logoTextIsWhite = !logoTextIsWhite; // change text color on horizontal bounce
  }
  if (logo.y + logo.vy <= 0 || logo.y + logo.height + logo.vy >= logoCanvas.height) {
    logo.vy = -logo.vy;
    logoTextIsWhite = !logoTextIsWhite; // change text color on vertical bounce
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
const levelDisplay = document.getElementById("level-display");

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
  bulletSpeed: 7,
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

  // Letter pixel patterns - 5x5 grids for clear ENVO readability
  const patterns = {
    E: [
      "11111",
      "10000",
      "11111",
      "10000",
      "11111"
    ],
    N: [
      "10001",
      "11001",
      "10101",
      "10011",
      "10001"
    ],
    V: [
      "10001",
      "10001",
      "10001",
      "01010",
      "00100"
    ],
    O: [
      "01110",
      "10001",
      "10001",
      "10001",
      "01110"
    ]
  };

  const letterOrder = [
    { name: "E", color: "#124e78" },
    { name: "N", color: "#f0f0c9" },
    { name: "V", color: "#f2bb05" },
    { name: "O", color: "#d74e09" }
  ];

  // Scale enemy size based on screen size (keeps pixel-art proportions)
  const cellSize = Math.round(42 * screenScale.sizeFactor); // scale from ~21 (small) to ~42 (large)
  // Spacing scales with screen size to maintain visual balance and prevent overlap
  const spacing = Math.max(8, Math.round(16 * screenScale.sizeFactor));
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
          const ex = Math.round(letterOffsetX + col * (cellSize + spacing));
          const ey = Math.round(startY + row * (cellSize + spacing));
          const id = enemyId++;
          enemies.push({
            id: id,
            x: ex,
            y: ey,
            width: cellSize,
            height: cellSize,
            vx: enemy_vx,
            // Sprite animation properties - choose pair based on id for variety
            spritePairIndex: (enemySpritePairs && enemySpritePairs.length > 0) ? (id % enemySpritePairs.length) : 0,
            spriteFrameIndex: 0,
            spriteFrameTimer: 0,
            spriteFrameInterval: 360, // faster alternation for visible animation
            isUFO: true,
            color: color,
            letter: null,
            isAlive: true,
            lasers: [],
            // base shot chance (lower = less frequent firing for relaxed gameplay)
            shotChance: 0.0015,
            isDead: false,
            deadTime: 0
          });
        }
      }
    }
  }

  gameState.totalEnemies = enemies.length;
}

// Letter shape patterns as 2D binary grids (1=pixel exists, 0=empty)
// Letter shape patterns - BOLD & THICK (Uniform 13x13 size)
// Same overall size but with much thicker pixel density for a bold look
// Premium Pixel Art Patterns - 11x13 Grid
// 'N' is now perfectly balanced with a thick diagonal stroke
// Premium Pixel Art Patterns - Fixed 11x11 Balanced Grid
const LETTER_PATTERNS = {
  E: [
    "11111111111", // Row 0
    "11111111111", // Row 1
    "11100000000", // Row 2
    "11100000000", // Row 3
    "11111111100", // Row 4 (Perfect Mid)
    "11111111100", // Row 5
    "11100000000", // Row 6
    "11100000000", // Row 7
    "11100000000", // Row 8
    "11111111111", // Row 9
    "11111111111"  // Row 10
  ],
  N: [
    "11110000111", // Row 0
    "11111000111", // Row 1
    "11111100111", // Row 2
    "11101110111", // Row 3
    "11101110111", // Row 4
    "11100111111", // Row 5 (Balanced Diagonal)
    "11100111111", // Row 6
    "11100011111", // Row 7
    "11100001111", // Row 8
    "11100000111", // Row 9
    "11100000111"  // Row 10
  ],
  V: [
    "11100000111", // Row 0
    "11100000111", // Row 1
    "11100000111", // Row 2
    "01110001110", // Row 3
    "01110001110", // Row 4
    "00111011100", // Row 5
    "00111011100", // Row 6
    "00011111000", // Row 7
    "00011111000", // Row 8
    "00001110000", // Row 9
    "00001110000"  // Row 10
  ],
  O: [
    "00111111100", // Row 0
    "01111111110", // Row 1
    "11100000111", // Row 2
    "11100000111", // Row 3
    "11100000111", // Row 4
    "11100000111", // Row 5
    "11100000111", // Row 6
    "11100000111", // Row 7
    "11100000111", // Row 8
    "01111111110", // Row 9
    "00111111100"  // Row 10
  ]
};
// Create defensive blocks shaped like letters E, N, V, O
function createDefensiveBlocks() {
  defensiveBlocks = [];
  const colors = {
    E: "#124e78",
    N: "#f0f0c9",
    V: "#f2bb05",
    O: "#d74e09"
  };

  const pixelSize = Math.max(8, Math.round(16 * screenScale.sizeFactor)); // Size of each pixel block
  const gap = Math.max(30, Math.round(60 * screenScale.sizeFactor));
  
  // Position shields near bottom of screen
  const startY = gameCanvas.height - 280;
  
  // Calculate starting X position (center all shields)
  let totalWidth = 0;
  Object.keys(LETTER_PATTERNS).forEach((letter, idx) => {
    const pattern = LETTER_PATTERNS[letter];
    const patternWidth = pattern[0].length * pixelSize;
    totalWidth += patternWidth;
    if (idx < 3) totalWidth += gap; // Add gap between shields
  });
  let startX = (gameCanvas.width - totalWidth) / 2;

  // Create each letter shield
  Object.keys(LETTER_PATTERNS).forEach(letter => {
    const pattern = LETTER_PATTERNS[letter];
    const color = colors[letter];
    const cells = [];

    // Create pixels from the pattern
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col] === "1") {
          cells.push({
            x: startX + col * pixelSize,
            y: startY + row * pixelSize,
            w: pixelSize,
            h: pixelSize,
            alive: true,
            row: row,
            col: col
          });
        }
      }
    }

    defensiveBlocks.push({
      x: startX,
      y: startY,
      letter: letter,
      color: color,
      cells: cells,
      pixelSize: pixelSize
    });

    // Move X position for next letter
    const patternWidth = pattern[0].length * pixelSize;
    startX += patternWidth + gap;
  });
}

// Draw letter-shaped shield made of pixel blocks
function drawLetterBlock(block) {
  // Draw only the alive pixels that form the letter shape
  for (let cell of block.cells) {
    if (!cell.alive) continue;

    // Calculate damage-based shading
    const liveCellCount = block.cells.filter(c => c.alive).length;
    const totalCellCount = block.cells.length;
    const integrityPercent = liveCellCount / totalCellCount;
    
    // Color gets darker as shield takes damage
    const shade = shadeColor(block.color, -15 - Math.floor((1 - integrityPercent) * 40));
    gameCtx.fillStyle = shade;
    gameCtx.strokeStyle = shadeColor(block.color, -30);
    gameCtx.lineWidth = 0.5;

    // Draw the pixel block
    gameCtx.fillRect(cell.x + 0.5, cell.y + 0.5, Math.max(2, cell.w - 1), Math.max(2, cell.h - 1));
    gameCtx.strokeRect(cell.x + 0.5, cell.y + 0.5, Math.max(2, cell.w - 1), Math.max(2, cell.h - 1));
  }
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
    // Use sprite animation frames (paired images)
    if (enemySpritePairs && enemy.spritePairIndex >= 0 && enemy.spritePairIndex < enemySpritePairs.length) {
      const pair = enemySpritePairs[enemy.spritePairIndex];
      const frameImg = pair[enemy.spriteFrameIndex];
      if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
        gameCtx.drawImage(frameImg, enemy.x, enemy.y, enemy.width, enemy.height);
        return;
      }
    }
    
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
    
    // collision with defensive blocks (player shots) - chip individual cells
    let hitBlock = false;
    for (let b = defensiveBlocks.length - 1; b >= 0; b--) {
      const block = defensiveBlocks[b];
      for (let ci = 0; ci < block.cells.length; ci++) {
        const cell = block.cells[ci];
        if (!cell.alive) continue;
        if (player.lasers[i] &&
            player.lasers[i].x < cell.x + cell.w &&
            player.lasers[i].x + player.lasers[i].width > cell.x &&
            player.lasers[i].y < cell.y + cell.h &&
            player.lasers[i].y + player.lasers[i].height > cell.y) {
          cell.alive = false;
          // remove block entirely if no live cells remain
          if (!block.cells.some(c => c.alive)) {
            defensiveBlocks.splice(b, 1);
          }
          player.lasers.splice(i, 1);
          hitBlock = true;
          break;
        }
      }
      if (hitBlock) break;
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
        gameState.score += 10;
        
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

      // collision with defensive blocks - damage single cells only
      for (let b = 0; b < defensiveBlocks.length; b++) {
        const block = defensiveBlocks[b];
        let hitCell = false;
        for (let ci = 0; ci < block.cells.length; ci++) {
          const cell = block.cells[ci];
          if (!cell.alive) continue;
          if (l &&
              l.x < cell.x + cell.w &&
              l.x + l.width > cell.x &&
              l.y < cell.y + cell.h &&
              l.y + l.height > cell.y) {
            cell.alive = false;
            hitCell = true;
            break;
          }
        }
        if (hitCell) {
          // remove block if empty
          if (!block.cells.some(c => c.alive)) {
            defensiveBlocks.splice(b, 1);
          }
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

// Game state variables - level tracking
let gameLevel = 1;  // Current level/playthrough number

// Enemy speed calculation based on level (classic arcade progression)
// ১. স্পিড ফাংশনটি আপডেট করুন (সবসময় একই স্পিড থাকবে)
function calculateEnemySpeed(level) {
  const baseSpeedMobile = 0.14;
  const baseSpeedPC = 0.9;

  // Multiplier সবসময় ১ রাখা হয়েছে যাতে স্পিড না বাড়ে
  const speed = isMobile ? baseSpeedMobile : baseSpeedPC;
  
  console.log(`Speed Fixed at: ${speed.toFixed(2)}`);
  return speed;
}

// ২. রিস্টার্ট ফাংশনটি আপডেট করুন
function restartGame() {
  // লেভেল ১-এ রিসেট করুন
  gameLevel = 1;
  
  // স্পিড আবার শুরুর মানে ফিরিয়ে আনুন
  enemy_vx = calculateEnemySpeed(gameLevel);
  enemy_vx = Math.abs(enemy_vx); // নিশ্চিত করুন ডান দিকে মুভমেন্ট শুরু হবে

  // স্টেট রিসেট
  gameState.isOver = false;
  gameState.isWon = false;
  gameState.score = 0;
  gameState.lives = 3;
  gameState.enemiesDefeated = 0;

  // UI আপডেট
  livesDisplay.textContent = `LIVES: ${gameState.lives}`;
  scoreDisplay.textContent = `SCORE: ${gameState.score}`;
  levelDisplay.textContent = `LEVEL: ${gameLevel}`;

  // এলিমেন্টগুলো নতুন করে তৈরি করুন
  createENVOFormation();
  createDefensiveBlocks();

  // এনিমিদের স্পিড আপডেট করুন
  for (let enemy of enemies) {
    enemy.vx = enemy_vx;
  }

  // স্ক্রিন হাইড করুন
  winScreen.classList.add('hidden');
  
  // গেম লুপ শুরু করুন
  if (!gameState.isRunning) {
    gameState.isRunning = true;
    requestAnimationFrame(gameLoop);
  }
}

// ৩. ক্লিক করলে যেন গেম শুরু হয় (গ্লোবাল লিসেনার)
gameCanvas.addEventListener("click", () => {
  if (gameState.isOver || gameState.isWon) {
    restartGame();
  }
});



// Global enemy speed variable
// Enemy base horizontal speed (recalculated on game start based on level)
let enemy_vx = calculateEnemySpeed(1);


// Enemy firing frequency multiplier (lower = enemies fire less often)
const ENEMY_FIRE_FACTOR = 0.8;

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
  
  if (enemies.some(e => e.isAlive)) {
    playInvaderMoveSound();
  }
  
  if (rightBound >= gameCanvas.width || leftBound <= 0) {
    enemy_vx = -enemy_vx;
    
    for (let enemy of enemies) {
      if (enemy.isAlive) {
        enemy.vx = -enemy.vx;                    // ← left-right direction reverse ঠিক
        enemy.y += isMobile ? DROP_MOBILE : DROP_PC;  // ← mobile/PC আলাদা down speed
      }
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive && enemy.y + enemy.height >= player.y) {
      gameState.isOver = true;
      gameState.lives = 0;
      playExplosionSound();
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive) {
      const chance = enemy.shotChance * ENEMY_FIRE_FACTOR;
      if (Math.random() < chance) {
        // Only allow the bottom-most enemy in each column to fire
        const centerX = enemy.x + enemy.width / 2;
        const horizontalTolerance = Math.max(enemy.width * 0.75, 8);
        const isBottomMost = !enemies.some(e2 => (
          e2 !== enemy && e2.isAlive &&
          Math.abs((e2.x + e2.width / 2) - centerX) < horizontalTolerance &&
          e2.y < enemy.y  // Looking for enemies BELOW (higher y value = lower on screen)
        ));
        if (isBottomMost) {
          const sx = enemy.x + enemy.width / 2;
          const sy = enemy.y + enemy.height;
          enemy.lasers.push({
            x: sx,
            y: sy,
            vx: 0,
            vy: 2.0,
            width: 4,
            height: 12
          });
        }
      }
    }
    
    // Update sprite animation frame (paired: 0 or 1)
    if (enemy.isAlive && enemySpritePairs && enemy.spritePairIndex >= 0 && enemy.spritePairIndex < enemySpritePairs.length) {
      enemy.spriteFrameTimer += 16.67; // ~60fps frame time in milliseconds
      if (enemy.spriteFrameTimer >= enemy.spriteFrameInterval) {
        enemy.spriteFrameTimer = 0;
        enemy.spriteFrameIndex = (enemy.spriteFrameIndex + 1) % 2; // Alternate between 0 and 1
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
console.log("Device:", isMobile ? "Mobile" : "PC");
console.log("Drop speed used:", isMobile ? DROP_MOBILE : DROP_PC);
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
      // return;
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
    drawLetterBlock(block);
  }
  
  // Update score display (only during active gameplay)
  if (!gameState.isOver && !gameState.isWon) {
    scoreDisplay.textContent = `SCORE: ${gameState.score}`;
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
  // ১. লেভেল ও স্পিড সবসময় বেসে রাখা (স্পিড বাড়বে না)
  gameLevel = 1;
  
  const BASE_SPEED_MOBILE = 0.14;
  const BASE_SPEED_PC = 0.9;
  
  enemy_vx = isMobile ? BASE_SPEED_MOBILE : BASE_SPEED_PC;
  enemy_vx = Math.abs(enemy_vx); // ডান দিক থেকে শুরু হবে

  // ২. গেম স্টেট পুরোপুরি রিসেট
  gameState.isOver = false;
  gameState.isWon = false;
  gameState.score = 0;
  gameState.lives = 3;
  gameState.enemiesDefeated = 0; // এটি যোগ করা জরুরি

  // ৩. UI আপডেট
  livesDisplay.textContent = `LIVES: 3`;
  scoreDisplay.textContent = `SCORE: 0`;
  levelDisplay.textContent = `LEVEL: 1`;

  // ৪. নতুন এনিমি ও ব্লক তৈরি
  createENVOFormation();
  createDefensiveBlocks();

  // ৫. সব এনিমির vx সিঙ্ক করা (যাতে আগের স্পিড না থাকে)
  for (let enemy of enemies) {
    enemy.vx = enemy_vx;
  }

  // ৬. উইন স্ক্রিন লুকানো
  winScreen.classList.add('hidden');

  // ৭. গেম লুপ কন্ট্রোল (সবচেয়ে গুরুত্বপূর্ণ অংশ)
  // যদি গেম অলরেডি চলতে থাকে, তাহলে নতুন করে লুপ ডাকার দরকার নেই
  if (!gameState.isRunning) {
    gameState.isRunning = true;
    requestAnimationFrame(gameLoop);
  }
}

// ৮. গেম ওভার বা উইন হলে ক্যানভাসে ক্লিক করলে যেন খেলা শুরু হয়
gameCanvas.onclick = () => {
  if (gameState.isOver || gameState.isWon) {
    restartGame();
  }
};

// ৯. উইন স্ক্রিনের বাটনের জন্য (যদি থাকে)
if (restartBtn) {
  restartBtn.onclick = (e) => {
    e.stopPropagation(); // ক্লিক যেন ক্যানভাসে ডাবল না যায়
    restartGame();
  };
}


// Canvas click to restart when game over
gameCanvas.addEventListener('click', () => {
  if (gameState.isOver || gameState.isWon) {
    restartGame();
  }
});

// Send contact message handler
const sendContactBtn = document.getElementById('send-contact');
if (sendContactBtn) sendContactBtn.addEventListener('click', async () => {
  const msg = document.getElementById('contact-message');
  if (msg && msg.value.trim() !== '') {
    try {
      sendContactBtn.disabled = true;
      sendContactBtn.textContent = 'Sending...';

      // Send to backend server
      const response = await fetch('https://server-ecru-eight-91.vercel.app/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: msg.value.trim(),
          playerInfo: {
            finalScore: gameState.score,
            timestamp: new Date().toISOString()
          }
        })
      });


      const result = await response.json();

      if (result.success) {
  Swal.fire({
    title: 'Message Sent!',
    text: "Thank you for your message!",
    icon: 'success',
    confirmButtonText: 'Play Again!',
    background: '#1a1a2e',
    color: '#fff',
    confirmButtonColor: '#00d4ff'
  }).then((swalResult) => {
    if (swalResult.isConfirmed) {
      msg.value = '';
      winScreen.classList.add('hidden');
      restartGame();           // ← এই লাইনটা যোগ করে গেম রিস্টার্ট হবে
    }
  });
} else {
        alert('Error: ' + (result.error || 'Failed to send message'));
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Unable to send message. Make sure the server is running on https://server-ecru-eight-91.vercel.app');
    } finally {
      sendContactBtn.disabled = false;
      sendContactBtn.textContent = 'Send';
    }
  } else {
    alert('Please enter a message before sending.');
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
  
  // Reset level on fresh game start
  gameLevel = 1;
enemy_vx = calculateEnemySpeed(gameLevel);

  
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

// Restart button handler removed (uses restartGame() single handler set earlier)

// Auto-start game on mobile devices for touch-optimized experience
if (isMobile) {
  // Small timeout to allow layout and canvas sizing to settle
  setTimeout(() => {
    if (!gameState.isRunning) {
      // Reset level on fresh game start
      gameLevel = 1;
      enemy_vx = calculateEnemySpeed(1);
      
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
