/* ===== LANDING PAGE - BOUNCING LOGO ===== */
const logoCanvas = document.getElementById("logo-canvas");
const logoCtx = logoCanvas.getContext("2d");
const playBtn = document.getElementById("play-btn");
const landingPage = document.getElementById("landing-page");
const gamePage = document.getElementById("game-page");
const winScreen = document.getElementById("win-screen");
const restartBtn = document.getElementById("restart-btn");

// Bouncing logo animation (increased size)
const logo = {
  x: logoCanvas.width / 2 - 70,
  y: logoCanvas.height / 2 - 70,
  vx: 4,
  vy: 4,
  width: 140,
  height: 140
};

function drawPixelatedLogo(x, y, size) {
  const pixelSize = size / 4;
  const colors = ["#124e78", "#f0f0c9", "#f2bb05", "#d74e09"];
  
  // E
  logoCtx.fillStyle = colors[0];
  logoCtx.fillRect(x, y, pixelSize * 3, pixelSize);
  logoCtx.fillRect(x, y + pixelSize, pixelSize, pixelSize);
  logoCtx.fillRect(x, y + pixelSize * 2, pixelSize * 2, pixelSize);
  logoCtx.fillRect(x, y + pixelSize * 3, pixelSize * 3, pixelSize);
  
  // N
  logoCtx.fillStyle = colors[1];
  let nX = x + pixelSize * 4;
  logoCtx.fillRect(nX, y, pixelSize, pixelSize * 4);
  logoCtx.fillRect(nX + pixelSize, y + pixelSize, pixelSize, pixelSize);
  logoCtx.fillRect(nX + pixelSize * 2, y + pixelSize * 2, pixelSize, pixelSize);
  logoCtx.fillRect(nX + pixelSize * 3, y, pixelSize, pixelSize * 4);
  
  // V
  logoCtx.fillStyle = colors[2];
  let vX = x + pixelSize * 8;
  logoCtx.fillRect(vX, y, pixelSize, pixelSize * 3);
  logoCtx.fillRect(vX + pixelSize, y + pixelSize * 3, pixelSize, pixelSize);
  logoCtx.fillRect(vX + pixelSize * 2, y + pixelSize * 3, pixelSize, pixelSize);
  logoCtx.fillRect(vX + pixelSize * 3, y, pixelSize, pixelSize * 3);
  
  // O
  logoCtx.fillStyle = colors[3];
  let oX = x + pixelSize * 12;
  logoCtx.fillRect(oX, y, pixelSize * 3, pixelSize);
  logoCtx.fillRect(oX, y + pixelSize * 3, pixelSize * 3, pixelSize);
  logoCtx.fillRect(oX, y + pixelSize, pixelSize, pixelSize * 2);
  logoCtx.fillRect(oX + pixelSize * 2, y + pixelSize, pixelSize, pixelSize * 2);
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

// Color palette
const colorArray = ["#124e78", "#f0f0c9", "#f2bb05", "#d74e09", "#6e0e0a"];

// Game state
let gameState = {
  isRunning: false,
  isOver: false,
  isWon: false,
  score: 0,
  lives: 3,
  level: 1,
  enemiesDefeated: 0,
  totalEnemies: 0
};

// Auto-fire controls
let spaceHeld = false;
let lastShotTime = 0;
const FIRE_RATE_MS = 160; // milliseconds between auto-shots

// Player (slightly larger)
const player = {
  x: gameCanvas.width / 2 - 20,
  y: gameCanvas.height - 70,
  width: 40,
  height: 50,
  dx: 6,
  color: "#f0f0c9",
  lasers: [],
  bulletSpeed: 12,
  maxLasers: 2
};

// Enemies array
let enemies = [];
let defensiveBlocks = [];

// Enemy formations for ENVO letters - ONLY 5 ENEMIES
function createENVOFormation() {
  enemies = [];
  gameState.enemiesDefeated = 0;
  
    // Four letter blocks: E, N, V, O (one enemy each)
    const letters = [
      { name: "E", color: "#124e78", startX: 120 },
      { name: "N", color: "#f0f0c9", startX: 260 },
      { name: "V", color: "#f2bb05", startX: 400 },
      { name: "O", color: "#d74e09", startX: 540 }
    ];
  
  let enemyId = 0;
    for (let letter of letters) {
      const enemy = {
        id: enemyId++,
        x: letter.startX,
        y: 100,
        width: 44,
        height: 44,
        vx: enemy_vx,
        color: letter.color,
        letter: letter.name,
        isAlive: true,
        lasers: [],
        shotChance: 0.002,
        isDead: false,
        deadTime: 0
      };
      enemies.push(enemy);
    }
  
  gameState.totalEnemies = enemies.length;
}

// Create defensive blocks with letters E, N, V, O
function createDefensiveBlocks() {
  // Shelters removed per request — no defensive blocks
  defensiveBlocks = [];
}

// Draw pixelated letter on block
function drawLetterBlock(x, y, width, height, letter, color) {
  gameCtx.fillStyle = color;
  gameCtx.strokeStyle = "#fff";
  gameCtx.lineWidth = 2;
  gameCtx.fillRect(x, y, width, height);
  gameCtx.strokeRect(x, y, width, height);
  
  gameCtx.fillStyle = "#000";
  gameCtx.font = "bold 32px 'Press Start 2P'";
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "middle";
  gameCtx.fillText(letter, x + width / 2, y + height / 2);
}

// Draw player
function drawPlayer() {
  gameCtx.fillStyle = player.color;
  gameCtx.fillRect(player.x, player.y, player.width, player.height);
  gameCtx.fillRect(player.x + 8, player.y + 4, player.width - 16, player.height - 16);
  gameCtx.fillRect(player.x + 4, player.y + 28, player.width - 8, 18);
}

// Draw enemy
function drawEnemy(enemy) {
  if (enemy.isAlive && !enemy.isDead) {
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
  } else if (enemy.isDead && enemy.deadTime < 20) {
    gameCtx.fillStyle = "#ff6600";
    gameCtx.fillRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
  }
}

// Draw lasers
function drawLasers() {
  gameCtx.fillStyle = "#00ff00";
  for (let laser of player.lasers) {
    gameCtx.fillRect(laser.x, laser.y, 3, 10);
  }
  
  gameCtx.fillStyle = "#ff0000";
  for (let enemy of enemies) {
    for (let laser of enemy.lasers) {
      gameCtx.fillRect(laser.x, laser.y, 3, 10);
    }
  }
}

// Update player position
function updatePlayer(keys) {
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x = Math.max(0, player.x - player.dx);
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x = Math.min(gameCanvas.width - player.width, player.x + player.dx);
  }
}

// Player shoot
function playerShoot() {
  if (player.lasers.length < player.maxLasers) {
    player.lasers.push({
      x: player.x + player.width / 2 - 1.5,
      y: player.y,
      vy: -player.bulletSpeed,
      width: 3,
      height: 10
    });
  }
}

// Update lasers
function updateLasers() {
  for (let i = player.lasers.length - 1; i >= 0; i--) {
    player.lasers[i].y += player.lasers[i].vy;
    
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
      enemy.lasers[i].y += enemy.lasers[i].vy;
      
      if (enemy.lasers[i].x < player.x + player.width &&
          enemy.lasers[i].x + 3 > player.x &&
          enemy.lasers[i].y < player.y + player.height &&
          enemy.lasers[i].y + 10 > player.y) {
        
        gameState.lives--;
        livesDisplay.textContent = `LIVES: ${gameState.lives}`;
        
        if (gameState.lives <= 0) {
          gameState.isOver = true;
        }
        
        enemy.lasers.splice(i, 1);
      }
      
      for (let block of defensiveBlocks) {
        if (enemy.lasers[i] &&
            enemy.lasers[i].x < block.x + block.width &&
            enemy.lasers[i].x + 3 > block.x &&
            enemy.lasers[i].y < block.y + block.height &&
            enemy.lasers[i].y + 10 > block.y) {
          
          block.health--;
          enemy.lasers.splice(i, 1);
        }
      }
      
      if (enemy.lasers[i] && enemy.lasers[i].y > gameCanvas.height) {
        enemy.lasers.splice(i, 1);
      }
    }
  }
}

// Global enemy speed variable
let enemy_vx = 1.5;

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
  
  if (rightBound >= gameCanvas.width || leftBound <= 0) {
    enemy_vx *= -1;
    for (let enemy of enemies) {
      if (enemy.isAlive) {
        enemy.vx *= -1;
        enemy.y += 15;
      }
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive && enemy.y + enemy.height >= player.y) {
      gameState.isOver = true;
      gameState.lives = 0;
    }
  }
  
  for (let enemy of enemies) {
    if (enemy.isAlive && Math.random() < enemy.shotChance) {
      enemy.lasers.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height,
        vy: 3,
        width: 3,
        height: 10
      });
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
    if (spaceHeld && Date.now() - lastShotTime >= FIRE_RATE_MS) {
      playerShoot();
      lastShotTime = Date.now();
    }
    
    if (gameState.enemiesDefeated === gameState.totalEnemies) {
      gameState.isWon = true;
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
    const alpha = Math.max(0.3, 1 - (3 - block.health) * 0.25);
    gameCtx.globalAlpha = alpha;
    drawLetterBlock(block.x, block.y, block.width, block.height, block.letter, block.color);
    gameCtx.globalAlpha = 1;
  }
  
  if (gameState.isOver) {
    gameCtx.fillStyle = "rgba(0,0,0,0.7)";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameCtx.fillStyle = "#fff";
    gameCtx.font = "bold 40px 'Press Start 2P'";
    gameCtx.textAlign = "center";
    gameCtx.fillText("GAME OVER", gameCanvas.width / 2, gameCanvas.height / 2);
  }
  
  requestAnimationFrame(gameLoop);
}

// Show win screen
function showWinScreen() {
  winScreen.classList.remove("hidden");
}

// Keyboard handling
const keysPressed = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  // start space hold
  if (e.code === "Space") {
    spaceHeld = true;
    // immediate shot on press
    if (gameState.isRunning && !gameState.isOver && !gameState.isWon) {
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

// Play button
playBtn.addEventListener("click", () => {
  landingPage.classList.add("hidden");
  gamePage.classList.remove("hidden");
  
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

// Restart button
restartBtn.addEventListener("click", () => {
  winScreen.classList.add("hidden");
  gamePage.classList.remove("hidden");
  
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
