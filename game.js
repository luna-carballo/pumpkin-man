// 🎃 PUMPKIN-MAN: HALLOWEEN HARVEST
// Jeu Pac-Man revisité Halloween avec monstres, araignées, items automnaux & easter eggs.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 32;
const COLS = 19;
const ROWS = 21;

// Éléments du DOM
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const startBtn = document.getElementById('startBtn');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalGotItBtn = document.getElementById('modalGotItBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const easterEggBanner = document.getElementById('easterEggBanner');
const eggTitle = document.getElementById('eggTitle');
const eggDesc = document.getElementById('eggDesc');
const catStatus = document.getElementById('catStatus');
const secretsStatus = document.getElementById('secretsStatus');
const whoaBanner = document.getElementById('whoaBanner');

// 0: Vide, 1: Mur Crypte, 2: Bonbon Maïs, 3: Lanterne Magique (Super pastille), 4: Maison Fantômes, 5: Porte Fantôme, 6: Mur Secret (Easter Egg), 8: Tombe Ancienne
const INITIAL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,5,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0], // Tunnels latéraux
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,7,0,0,0,1,2,1,0,0,0], // 7: Spawn fruit automnal
  [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,8,2,1,1,1,1,1,1,2,1], // 8: Tombe maudite
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// État Global du Jeu
const state = {
  score: 0,
  highScore: parseInt(localStorage.getItem('pumpkin_highscore') || '0', 10),
  level: 1,
  lives: 3,
  running: false,
  paused: false,
  frightenedTimer: 0,
  ghostsEatenCombo: 0,
  pelletsRemaining: 0,
  fruit: null, // Fruit bonus actif
  fruitTimer: 0,
  particles: [],
  floatingTexts: [],
  leaves: [], // Feuilles mortes d'ambiance
  secretsFound: {
    cryptWall: false,
    blackCat: false,
    hauntedTomb: false,
    bloodMoon: false
  },
  tombPassages: 0,
  lastTombX: -1,
  cat: null, // Chat noir itinérant
  catTimer: 400,
  speedBoostTimer: 0
};

highScoreDisplay.textContent = state.highScore;

// Feuilles mortes flottantes en arrière-plan
for (let i = 0; i < 24; i++) {
  state.leaves.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 6 + 4,
    speedX: Math.random() * 0.8 - 0.4,
    speedY: Math.random() * 0.7 + 0.3,
    color: ['#ff7700', '#d90429', '#ffbe0b', '#7b2cbf', '#8338ec'][Math.floor(Math.random() * 5)],
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04
  });
}

// Joueur: Jack la Citrouille
const player = {
  x: 9 * TILE_SIZE + TILE_SIZE / 2,
  y: 16 * TILE_SIZE + TILE_SIZE / 2,
  baseSpeed: 2.2,
  speed: 2.2,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  radius: 13,
  mouthAngle: 0.2,
  mouthSpeed: 0.04,
  mouthMax: 0.75,
  mouthDir: 1,
  glow: 0
};

// Monstres d'Halloween
const GHOST_TYPES = {
  SHADOW: { name: 'Spectre Pourpre', color: '#b5179e', type: 'ghost', baseTile: { x: 9, y: 7 } },
  SPIDER: { name: 'Veuve Noire', color: '#10002b', type: 'spider', baseTile: { x: 9, y: 9 } },
  BAT: { name: 'Chauve-souris', color: '#5a189a', type: 'bat', baseTile: { x: 8, y: 10 } },
  SKULL: { name: 'Crâne Flamboyant', color: '#70e000', type: 'skull', baseTile: { x: 10, y: 10 } }
};

let ghosts = [];

function createGhosts() {
  return [
    {
      ...GHOST_TYPES.SHADOW,
      x: 9 * TILE_SIZE + TILE_SIZE / 2,
      y: 7 * TILE_SIZE + TILE_SIZE / 2,
      dirX: 1,
      dirY: 0,
      speed: 1.8,
      mode: 'chase', // chase, scatter, frightened, dead
      target: { x: 0, y: 0 },
      animFrame: 0
    },
    {
      ...GHOST_TYPES.SPIDER,
      x: 9 * TILE_SIZE + TILE_SIZE / 2,
      y: 9 * TILE_SIZE + TILE_SIZE / 2,
      dirX: -1,
      dirY: 0,
      speed: 1.75,
      mode: 'chase',
      target: { x: 0, y: 0 },
      animFrame: 0
    },
    {
      ...GHOST_TYPES.BAT,
      x: 8 * TILE_SIZE + TILE_SIZE / 2,
      y: 10 * TILE_SIZE + TILE_SIZE / 2,
      dirX: 0,
      dirY: -1,
      speed: 1.7,
      mode: 'chase',
      target: { x: 0, y: 0 },
      animFrame: 0
    },
    {
      ...GHOST_TYPES.SKULL,
      x: 10 * TILE_SIZE + TILE_SIZE / 2,
      y: 10 * TILE_SIZE + TILE_SIZE / 2,
      dirX: 0,
      dirY: -1,
      speed: 1.65,
      mode: 'scatter',
      target: { x: 0, y: 0 },
      animFrame: 0
    }
  ];
}

let map = [];

function resetMap() {
  map = JSON.parse(JSON.stringify(INITIAL_MAP));
  state.pelletsRemaining = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (map[r][c] === 2 || map[r][c] === 3) {
        state.pelletsRemaining++;
      }
    }
  }
}

function resetPositions() {
  player.x = 9 * TILE_SIZE + TILE_SIZE / 2;
  player.y = 16 * TILE_SIZE + TILE_SIZE / 2;
  player.dirX = 0;
  player.dirY = 0;
  player.nextDirX = 0;
  player.nextDirY = 0;

  ghosts = createGhosts();
  state.frightenedTimer = 0;
  state.ghostsEatenCombo = 0;
}

// Notifications de secrets
function triggerWhoa(text = "WHOAAAAA ! 🔥") {
  if (!whoaBanner) return;
  whoaBanner.textContent = text;
  whoaBanner.classList.add("active");
  clearTimeout(whoaBanner._timer);
  whoaBanner._timer = setTimeout(() => {
    whoaBanner.classList.remove("active");
  }, 1300);
}

function unlockSecret(id, title, desc) { triggerWhoa("WHOAAAAA ! ✨");
  if (state.secretsFound[id]) return;
  state.secretsFound[id] = true;
  window.soundEngine.playSecret();

  eggTitle.textContent = `🎃 ${title}`;
  eggDesc.textContent = desc;
  easterEggBanner.classList.add('active');

  const count = Object.values(state.secretsFound).filter(Boolean).length;
  secretsStatus.textContent = `🔍 Secrets : ${count} / 4`;

  setTimeout(() => {
    easterEggBanner.classList.remove('active');
  }, 4500);
}

// Gestion des Particules
function addParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.02,
      color,
      size: Math.random() * 3 + 2
    });
  }
}

function addFloatingText(text, x, y, color = '#ffbe0b') {
  state.floatingTexts.push({
    text,
    x,
    y,
    life: 1.0,
    color
  });
}

// Détection de mur ou obstacle
function isWall(tileX, tileY, isGhost = false, ghostMode = 'chase') {
  if (tileX < 0 || tileX >= COLS) return false; // Tunnels
  if (tileY < 0 || tileY >= ROWS) return true;

  const tile = map[tileY][tileX];
  if (tile === 1) return true;
  if (tile === 5) {
    // Porte fantôme : seul un fantôme peut passer
    return !isGhost || (ghostMode !== 'dead' && !isGhost);
  }
  return false;
}

function canMove(x, y, dirX, dirY, isGhost = false, ghostMode = 'chase') {
  const step = 6;
  const nextX = x + dirX * step;
  const nextY = y + dirY * step;

  const left = Math.floor((nextX - 12) / TILE_SIZE);
  const right = Math.floor((nextX + 12) / TILE_SIZE);
  const top = Math.floor((nextY - 12) / TILE_SIZE);
  const bottom = Math.floor((nextY + 12) / TILE_SIZE);

  return (
    !isWall(left, top, isGhost, ghostMode) &&
    !isWall(right, top, isGhost, ghostMode) &&
    !isWall(left, bottom, isGhost, ghostMode) &&
    !isWall(right, bottom, isGhost, ghostMode)
  );
}

// Mise à jour de Jack la Citrouille
function updatePlayer() {
  // Boost de vitesse temporaire
  if (state.speedBoostTimer > 0) {
    state.speedBoostTimer--;
    player.speed = player.baseSpeed * 1.35;
  } else {
    player.speed = player.baseSpeed;
  }

  // Changement de direction si possible
  if (player.nextDirX !== 0 || player.nextDirY !== 0) {
    if (canMove(player.x, player.y, player.nextDirX, player.nextDirY)) {
      player.dirX = player.nextDirX;
      player.dirY = player.nextDirY;
      player.nextDirX = 0;
      player.nextDirY = 0;
    }
  }

  // Déplacement
  if (canMove(player.x, player.y, player.dirX, player.dirY)) {
    player.x += player.dirX * player.speed;
    player.y += player.dirY * player.speed;

    // Animation de la bouche citrouille
    player.mouthAngle += player.mouthSpeed * player.mouthDir;
    if (player.mouthAngle > player.mouthMax || player.mouthAngle < 0.05) {
      player.mouthDir *= -1;
    }
  }

  // Tunnels latéraux
  if (player.x < -TILE_SIZE / 2) player.x = (COLS - 0.5) * TILE_SIZE;
  if (player.x > (COLS - 0.5) * TILE_SIZE) player.x = -TILE_SIZE / 2;

  // Consommation des items
  const tileX = Math.floor(player.x / TILE_SIZE);
  const tileY = Math.floor(player.y / TILE_SIZE);

  if (tileX >= 0 && tileX < COLS && tileY >= 0 && tileY < ROWS) {
    const tile = map[tileY][tileX];

    // Bonbon Maïs
    if (tile === 2) {
      map[tileY][tileX] = 0;
      state.score += 10;
      state.pelletsRemaining--;
      window.soundEngine.playChomp();
      addParticles(player.x, player.y, '#ffbe0b', 4);
      checkFruitSpawn();
    }
    // Grande Lanterne Citrouille Magique
    else if (tile === 3) {
      map[tileY][tileX] = 0;
      state.score += 50;
      state.pelletsRemaining--;
      state.frightenedTimer = 380; triggerWhoa("WHOAAAAA ! 🎃"); // ~6.5 secondes
      state.ghostsEatenCombo = 0;
      window.soundEngine.playPowerPellet();
      addParticles(player.x, player.y, '#ff7700', 16);
      addFloatingText('+50 CHASSE AUX SPECTRES !', player.x, player.y - 12, '#ff9933');
    }

    // Easter Egg #3 : La Tombe Maudite
    if (tile === 8 && state.lastTombX !== tileX) {
      state.lastTombX = tileX;
      state.tombPassages++;
      if (state.tombPassages >= 3 && !state.secretsFound.hauntedTomb) {
        state.score += 666;
        addFloatingText('+666 OFFRANDE DES ANCESTRES !', player.x, player.y - 16, '#e63946');
        addParticles(player.x, player.y, '#70e000', 25);
        unlockSecret('hauntedTomb', 'Tombe Maudite Invoquée', 'Vous avez réveillé la bénédiction ancestrale (+666 pts) !');
      }
    } else if (tile !== 8) {
      state.lastTombX = -1;
    }

    // Manger le Fruit Automnal
    if (state.fruit && tileX === state.fruit.x && tileY === state.fruit.y) {
      state.score += state.fruit.points;
      addFloatingText(`+${state.fruit.points} ${state.fruit.name} !`, player.x, player.y - 14, '#ffbe0b');
      addParticles(player.x, player.y, '#ffbe0b', 18);
      window.soundEngine.playSecret();
      state.fruit = null;
    }
  }

  // Victoire de niveau
  if (state.pelletsRemaining <= 0) {
    levelComplete();
  }
}

// Apparition des items d'automne au centre
function checkFruitSpawn() {
  if (state.fruit) return;
  const initialCount = 175; // Environ
  if (state.pelletsRemaining === Math.floor(initialCount * 0.7) || state.pelletsRemaining === Math.floor(initialCount * 0.3)) {
    const fruits = [
      { name: 'Gland Doré', icon: '🍂', points: 100 },
      { name: 'Pomme Ensanglantée', icon: '🍎', points: 300 },
      { name: 'Champignon Mystique', icon: '🍄', points: 500 },
      { name: 'Pumpkin Spice Latte', icon: '☕', points: 700 }
    ];
    const picked = fruits[Math.min(state.level - 1, fruits.length - 1)];
    state.fruit = {
      x: 9,
      y: 12,
      ...picked
    };
    state.fruitTimer = 550; // Durée de présence
    addFloatingText(`Apparition : ${picked.name} !`, 9 * TILE_SIZE + 16, 12 * TILE_SIZE, '#ff9933');
  }
}

// Gestion des Monstres (IA & Déplacements)
function updateGhosts() {
  if (state.frightenedTimer > 0) {
    state.frightenedTimer--;
  }

  ghosts.forEach(ghost => {
    ghost.animFrame++;

    // Détermination de la cible selon l'état
    if (ghost.mode === 'dead') {
      ghost.target = { x: 9 * TILE_SIZE + 16, y: 9 * TILE_SIZE + 16 };
      ghost.speed = 3.2;
      // Retour à la maison réussi
      if (Math.hypot(ghost.x - ghost.target.x, ghost.y - ghost.target.y) < 14) {
        ghost.mode = 'chase';
        ghost.speed = 1.8;
      }
    } else if (state.frightenedTimer > 0) {
      ghost.mode = 'frightened';
      ghost.speed = 1.1;
      // Fuite aléatoire
      ghost.target = {
        x: Math.floor(Math.random() * COLS) * TILE_SIZE,
        y: Math.floor(Math.random() * ROWS) * TILE_SIZE
      };
    } else {
      ghost.mode = 'chase';
      ghost.speed = 1.75;
      if (ghost.type === 'ghost') {
        // Blinky : traque Jack directement
        ghost.target = { x: player.x, y: player.y };
      } else if (ghost.type === 'spider') {
        // Pinky / Veuve : anticipe 3 cases devant Jack
        ghost.target = {
          x: player.x + player.dirX * TILE_SIZE * 3,
          y: player.y + player.dirY * TILE_SIZE * 3
        };
      } else if (ghost.type === 'bat') {
        // Chauve-souris : trajectoire ondulante
        ghost.target = {
          x: player.x + Math.sin(Date.now() / 300) * 80,
          y: player.y + Math.cos(Date.now() / 300) * 80
        };
      } else {
        // Clyde / Crâne : s'éloigne s'il est trop près
        const dist = Math.hypot(ghost.x - player.x, ghost.y - player.y);
        if (dist < TILE_SIZE * 4) {
          ghost.target = { x: 0, y: ROWS * TILE_SIZE };
        } else {
          ghost.target = { x: player.x, y: player.y };
        }
      }
    }

    // Recherche de directions possibles aux intersections
    const tileX = Math.floor(ghost.x / TILE_SIZE);
    const tileY = Math.floor(ghost.y / TILE_SIZE);
    const centerX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = tileY * TILE_SIZE + TILE_SIZE / 2;

    const atIntersection = Math.abs(ghost.x - centerX) < 3 && Math.abs(ghost.y - centerY) < 3;

    if (atIntersection) {
      const directions = [
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 }
      ];

      // Éviter de faire demi-tour immédiatement
      const validDirs = directions.filter(dir => {
        if (dir.x === -ghost.dirX && dir.y === -ghost.dirY) return false;
        return canMove(ghost.x, ghost.y, dir.x, dir.y, true, ghost.mode);
      });

      if (validDirs.length > 0) {
        // Choix de la direction qui rapproche le plus de la cible
        validDirs.sort((a, b) => {
          const distA = Math.hypot((ghost.x + a.x * TILE_SIZE) - ghost.target.x, (ghost.y + a.y * TILE_SIZE) - ghost.target.y);
          const distB = Math.hypot((ghost.x + b.x * TILE_SIZE) - ghost.target.x, (ghost.y + b.y * TILE_SIZE) - ghost.target.y);
          return distA - distB;
        });
        ghost.dirX = validDirs[0].x;
        ghost.dirY = validDirs[0].y;
      }
    }

    // Déplacement
    if (canMove(ghost.x, ghost.y, ghost.dirX, ghost.dirY, true, ghost.mode)) {
      ghost.x += ghost.dirX * ghost.speed;
      ghost.y += ghost.dirY * ghost.speed;
    } else {
      // Si bloqué, chercher une autre direction
      ghost.dirX = -ghost.dirX;
      ghost.dirY = -ghost.dirY;
    }

    // Tunnels latéraux
    if (ghost.x < -TILE_SIZE / 2) ghost.x = (COLS - 0.5) * TILE_SIZE;
    if (ghost.x > (COLS - 0.5) * TILE_SIZE) ghost.x = -TILE_SIZE / 2;

    // Collisions avec Jack la Citrouille
    const distToPlayer = Math.hypot(ghost.x - player.x, ghost.y - player.y);
    if (distToPlayer < player.radius + 10) {
      if (ghost.mode === 'frightened') {
        // Jack mange le monstre !
        ghost.mode = 'dead';
        state.ghostsEatenCombo++; triggerWhoa("WHOAAAAA ! 👻");
        const points = 200 * Math.pow(2, state.ghostsEatenCombo - 1);
        state.score += points;
        addFloatingText(`+${points} !`, ghost.x, ghost.y, '#4deeea');
        addParticles(ghost.x, ghost.y, '#4deeea', 16);
        window.soundEngine.playEatGhost();
      } else if (ghost.mode === 'chase' || ghost.mode === 'scatter') {
        // Jack perd une citrouille !
        playerDeath();
      }
    }
  });
}

// Easter Egg #2 : Chat Noir "Midnight"
function updateBlackCat() {
  if (!state.cat) {
    state.catTimer--;
    if (state.catTimer <= 0) {
      state.cat = {
        x: 0,
        y: 10 * TILE_SIZE + 16,
        speed: 2.0,
        dirX: 1,
        life: 500
      };
      catStatus.textContent = '🐈‍⬛ Midnight est apparu !';
      addFloatingText('🐈‍⬛ Midnight le Chat Noir rode...', canvas.width / 2, canvas.height / 2, '#9d4edd');
    }
  } else {
    state.cat.x += state.cat.dirX * state.cat.speed;
    state.cat.life--;

    // Collision avec Jack
    if (Math.hypot(player.x - state.cat.x, player.y - state.cat.y) < 24) {
      state.score += 500;
      state.speedBoostTimer = 350; // Super vitesse !
      addFloatingText('+500 SUPER VITESSE DU CHAT !', player.x, player.y - 18, '#ffbe0b');
      addParticles(state.cat.x, state.cat.y, '#9d4edd', 24);
      unlockSecret('blackCat', 'Compagnon de Minuit', 'Vous avez caressé le Chat Noir (+500 pts & Vitesse divine) !');
      state.cat = null;
      state.catTimer = 900;
      catStatus.textContent = '🐈‍⬛ Compagnon trouvé !';
      return;
    }

    if (state.cat.life <= 0 || state.cat.x > canvas.width + 30) {
      state.cat = null;
      state.catTimer = 800;
      catStatus.textContent = '🐈‍⬛ En attente';
    }
  }
}

// Mort du Joueur
function playerDeath() {
  state.lives--;
  window.soundEngine.playDeath();
  addParticles(player.x, player.y, '#ff7700', 30);
  updateLivesDisplay();

  if (state.lives <= 0) {
    gameOver();
  } else {
    resetPositions();
  }
}

function updateLivesDisplay() {
  let icons = '';
  for (let i = 0; i < state.lives; i++) {
    icons += '<span>🎃</span>';
  }
  livesDisplay.innerHTML = icons || '<span>💀</span>';
}

function levelComplete() {
  state.level++;
  levelDisplay.textContent = state.level;
  window.soundEngine.playLevelComplete();
  addFloatingText(`NIVEAU ${state.level} !`, canvas.width / 2, canvas.height / 2, '#70e000');
  resetMap();
  resetPositions();
}

function gameOver() {
  state.running = false;
  window.soundEngine.stopMusic();

  if (state.score > state.highScore) {
    state.highScore = state.score;
    localStorage.setItem('pumpkin_highscore', state.highScore);
    highScoreDisplay.textContent = state.highScore;
  }

  overlayTitle.textContent = '💀 FIN DE PARTIE';
  overlaySubtitle.textContent = `Votre score final : ${state.score} points. Les spectres ont dévoré la crypte !`;
  startBtn.textContent = 'REJOUER (ESPACE)';
  gameOverlay.classList.remove('hidden');
}

// RENDU GRAPHIQUE SUR CANVAS
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Fond sombre de crypte
  ctx.fillStyle = '#06030c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Feuilles mortes d'automne flottantes
  state.leaves.forEach(leaf => {
    leaf.x += leaf.speedX;
    leaf.y += leaf.speedY;
    leaf.rot += leaf.rotSpeed;

    if (leaf.y > canvas.height) leaf.y = -10;
    if (leaf.x > canvas.width) leaf.x = 0;
    if (leaf.x < 0) leaf.x = canvas.width;

    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rot);
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.size, leaf.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 3. Dessin du Labyrinthe
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = map[r][c];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      // Mur en pierre gothique
      if (tile === 1) {
        ctx.fillStyle = '#1e1136';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#3a1b63';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

        // Petites fentes de briques et toiles d'araignées subtiles
        if ((r + c) % 4 === 0) {
          ctx.strokeStyle = 'rgba(157, 78, 221, 0.35)';
          ctx.beginPath();
          ctx.moveTo(x + 4, y + 4);
          ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4);
          ctx.stroke();
        }
      }
      // Porte de la crypte des monstres
      else if (tile === 5) {
        ctx.fillStyle = '#e63946';
        ctx.fillRect(x, y + 12, TILE_SIZE, 6);
      }
      // Bonbon Maïs Automnal (Candy Corn tricolore)
      else if (tile === 2) {
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy - 6);
        ctx.lineTo(cx - 5, cy + 5);
        ctx.lineTo(cx + 5, cy + 5);
        ctx.closePath();

        // Dégradé Candy Corn : Blanc / Orange / Jaune
        const grad = ctx.createLinearGradient(cx, cy - 6, cx, cy + 5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#ff7700');
        grad.addColorStop(1, '#ffbe0b');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // Grande Lanterne Citrouille Magique
      else if (tile === 3) {
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;
        const pulse = Math.sin(Date.now() / 150) * 2;

        // Halo lumineux
        const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14 + pulse);
        glow.addColorStop(0, 'rgba(255, 153, 51, 0.8)');
        glow.addColorStop(1, 'rgba(255, 119, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 14 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Citrouille
        ctx.fillStyle = '#ff7700';
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + pulse / 2, 0, Math.PI * 2);
        ctx.fill();

        // Yeux sculptés
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 4, cy - 2, 2, 2);
        ctx.fillRect(cx + 2, cy - 2, 2, 2);
      }
      // Tombe Maudite (Stèle)
      else if (tile === 8) {
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;
        ctx.fillStyle = '#4a4e69';
        ctx.beginPath();
        ctx.arc(cx, cy - 4, 8, Math.PI, 0);
        ctx.lineTo(cx + 8, cy + 10);
        ctx.lineTo(cx - 8, cy + 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#9a8c98';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RIP', cx, cy + 4);
      }
    }
  }

  // 4. Dessin du Fruit Automnal s'il est présent
  if (state.fruit) {
    const fx = state.fruit.x * TILE_SIZE + TILE_SIZE / 2;
    const fy = state.fruit.y * TILE_SIZE + TILE_SIZE / 2;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.fruit.icon, fx, fy + Math.sin(Date.now() / 200) * 3);
  }

  // 5. Dessin du Chat Noir "Midnight" (Easter Egg)
  if (state.cat) {
    ctx.save();
    ctx.translate(state.cat.x, state.cat.y);
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐈‍⬛', 0, Math.sin(Date.now() / 120) * 2);
    ctx.restore();
  }

  // 6. Dessin des Monstres
  ghosts.forEach(ghost => {
    drawGhost(ghost);
  });

  // 7. Dessin de Jack la Citrouille (Joueur)
  drawPlayer();

  // 8. Rendu des Particules
  state.particles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      state.particles.splice(idx, 1);
      return;
    }

    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  });

  // 9. Textes flottants (+Score, Notifications)
  state.floatingTexts.forEach((ft, idx) => {
    ft.y -= 0.8;
    ft.life -= 0.02;

    if (ft.life <= 0) {
      state.floatingTexts.splice(idx, 1);
      return;
    }

    ctx.save();
    ctx.font = 'bold 13px Fredoka, sans-serif';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = ft.life;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

// Dessin de Jack la Citrouille
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Rotation selon la direction de marche
  let angle = 0;
  if (player.dirX === 1) angle = 0;
  else if (player.dirX === -1) angle = Math.PI;
  else if (player.dirY === 1) angle = Math.PI / 2;
  else if (player.dirY === -1) angle = -Math.PI / 2;
  ctx.rotate(angle);

  // Aura lumineuse de Jack
  const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 24);
  aura.addColorStop(0, 'rgba(255, 119, 0, 0.45)');
  aura.addColorStop(1, 'rgba(255, 119, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  // Corps Citrouille avec bouche qui croque
  ctx.fillStyle = '#ff7700';
  ctx.beginPath();
  const startMouth = player.mouthAngle;
  const endMouth = Math.PI * 2 - player.mouthAngle;
  ctx.arc(0, 0, player.radius, startMouth, endMouth);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // Rayures de citrouille
  ctx.strokeStyle = '#d94e00';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Oeil sculpté triangulaire malicieux
  ctx.fillStyle = '#1a0826';
  ctx.beginPath();
  ctx.moveTo(3, -6);
  ctx.lineTo(8, -4);
  ctx.lineTo(4, -2);
  ctx.closePath();
  ctx.fill();

  // Petite tige verte sur le dessus
  ctx.fillStyle = '#38b000';
  ctx.fillRect(-2, -player.radius - 3, 4, 4);

  ctx.restore();
}

// Dessin des Monstres (Spectre, Araignée, Chauve-souris, Crâne)
function drawGhost(ghost) {
  ctx.save();
  ctx.translate(ghost.x, ghost.y);

  // Mode apeuré (Âme bleue tremblotante)
  if (ghost.mode === 'frightened') {
    const isFlashing = state.frightenedTimer < 90 && Math.floor(Date.now() / 150) % 2 === 0;
    ctx.fillStyle = isFlashing ? '#ffffff' : '#3a86ff';

    // Corps spectral ondulant
    ctx.beginPath();
    ctx.arc(0, -2, 12, Math.PI, 0);
    ctx.lineTo(12, 10);
    const wobble = Math.sin(ghost.animFrame * 0.3) * 2;
    ctx.lineTo(6, 7 + wobble);
    ctx.lineTo(0, 10);
    ctx.lineTo(-6, 7 - wobble);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.fill();

    // Yeux effrayés
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(-6, -4, 3, 3);
    ctx.fillRect(3, -4, 3, 3);
    ctx.restore();
    return;
  }

  // Mode yeux seuls (mort, retour à la crypte)
  if (ghost.mode === 'dead') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -4, 5, 5);
    ctx.fillRect(2, -4, 5, 5);
    ctx.fillStyle = '#3a86ff';
    ctx.fillRect(-5 + ghost.dirX * 2, -2 + ghost.dirY * 2, 3, 3);
    ctx.fillRect(4 + ghost.dirX * 2, -2 + ghost.dirY * 2, 3, 3);
    ctx.restore();
    return;
  }

  // Monstres selon leur type
  if (ghost.type === 'spider') {
    // 🕷️ Araignée Veuve Noire
    ctx.fillStyle = '#1b1b2f';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sablier rouge sur l'abdomen
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.moveTo(-3, -2);
    ctx.lineTo(3, -2);
    ctx.lineTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.closePath();
    ctx.fill();

    // 8 pattes animées qui gigotent
    ctx.strokeStyle = '#2b2d42';
    ctx.lineWidth = 1.8;
    const legWiggle = Math.sin(ghost.animFrame * 0.25) * 3;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = -1; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(side * 6, i * 3);
        ctx.lineTo(side * 14, i * 4 + legWiggle * (i % 2 === 0 ? 1 : -1));
        ctx.stroke();
      }
    }

    // Yeux jaunes
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(-4, -6, 2, 2);
    ctx.fillRect(2, -6, 2, 2);
  } else if (ghost.type === 'bat') {
    // 🦇 Chauve-Souris
    ctx.fillStyle = '#480ca8';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Ailes battantes
    const wingFlap = Math.sin(ghost.animFrame * 0.35) * 6;
    ctx.fillStyle = '#3a0ca3';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-16, -4 + wingFlap);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(16, -4 + wingFlap);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();

    // Yeux rouges perçants
    ctx.fillStyle = '#f72585';
    ctx.fillRect(-3, -2, 2, 2);
    ctx.fillRect(2, -2, 2, 2);
  } else if (ghost.type === 'skull') {
    // 💀 Crâne Ectoplasmique
    ctx.fillStyle = '#d8f3dc';
    ctx.beginPath();
    ctx.arc(0, -2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-6, 4, 12, 6);

    // Yeux creux verts
    ctx.fillStyle = '#70e000';
    ctx.fillRect(-5, -3, 3, 4);
    ctx.fillRect(2, -3, 3, 4);

    // Dents
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(-4, 7, 2, 3);
    ctx.fillRect(0, 7, 2, 3);
    ctx.fillRect(3, 7, 2, 3);
  } else {
    // 👻 Spectre Écarlate (Ombre)
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(0, -3, 11, Math.PI, 0);
    ctx.lineTo(11, 8);
    const wave = Math.sin(ghost.animFrame * 0.2) * 2;
    ctx.lineTo(6, 6 + wave);
    ctx.lineTo(0, 8);
    ctx.lineTo(-6, 6 - wave);
    ctx.lineTo(-11, 8);
    ctx.closePath();
    ctx.fill();

    // Yeux spectraux
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-4, -4, 4, 0, Math.PI * 2);
    ctx.arc(4, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(-4 + ghost.dirX * 2, -4 + ghost.dirY * 2, 2, 0, Math.PI * 2);
    ctx.arc(4 + ghost.dirX * 2, -4 + ghost.dirY * 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Boucle Principale du Jeu
let lastTime = 0;
function gameLoop(timestamp) {
  if (state.running && !state.paused) {
    updatePlayer();
    updateGhosts();
    updateBlackCat();

    scoreDisplay.textContent = state.score;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// Contrôles et Événements Clavier
window.addEventListener('keydown', e => {
  // Démarrer avec Espace
  if (e.code === 'Space' && !state.running) {
    e.preventDefault();
    startGame();
    return;
  }

  // Pause avec P
  if (e.key === 'p' || e.key === 'P') {
    togglePause();
    return;
  }

  // Easter Egg #4 : Clé magique 'H' pour invoquer la Lune de Sang !
  if ((e.key === 'h' || e.key === 'H') && state.running) {
    if (!state.secretsFound.bloodMoon) {
      state.score += 333;
      state.frightenedTimer = 450;
      addFloatingText('🌕 RITUEL DE LA PLEINE LUNE !', player.x, player.y - 20, '#e63946');
      addParticles(player.x, player.y, '#e63946', 30);
      unlockSecret('bloodMoon', 'Rituel de la Pleine Lune', 'La Lune de Sang a terrifié tous les monstres (+333 pts) !');
    }
  }

  // Directions
  switch (e.key) {
    case 'ArrowUp':
    case 'z':
    case 'Z':
    case 'w':
    case 'W':
      player.nextDirX = 0;
      player.nextDirY = -1;
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      player.nextDirX = 0;
      player.nextDirY = 1;
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'q':
    case 'Q':
    case 'a':
    case 'A':
      player.nextDirX = -1;
      player.nextDirY = 0;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      player.nextDirX = 1;
      player.nextDirY = 0;
      e.preventDefault();
      break;
  }
});

// Contrôles Virtuels (D-Pad pour mobiles/souris)
document.querySelectorAll('.dpad-btn').forEach(btn => {
  const dir = btn.dataset.dir;
  const trigger = (e) => {
    e.preventDefault();
    if (!state.running) {
      startGame();
      return;
    }
    if (dir === 'up') { player.nextDirX = 0; player.nextDirY = -1; }
    if (dir === 'down') { player.nextDirX = 0; player.nextDirY = 1; }
    if (dir === 'left') { player.nextDirX = -1; player.nextDirY = 0; }
    if (dir === 'right') { player.nextDirX = 1; player.nextDirY = 0; }
  };
  btn.addEventListener('touchstart', trigger);
  btn.addEventListener('mousedown', trigger);
});

// Gestion des Boutons d'interface
function startGame() {
  state.score = 0;
  state.level = 1;
  state.lives = 3;
  state.running = true;
  state.paused = false;

  scoreDisplay.textContent = '0';
  levelDisplay.textContent = '1';
  updateLivesDisplay();

  resetMap();
  resetPositions();

  gameOverlay.classList.add('hidden');
  window.soundEngine.startMusic();
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? '▶️ Reprendre' : '⏸️ Pause';
  if (state.paused) {
    window.soundEngine.stopMusic();
  } else {
    window.soundEngine.startMusic();
  }
}

startBtn.addEventListener('click', startGame);

pauseBtn.addEventListener('click', togglePause);

restartBtn.addEventListener('click', () => {
  startGame();
});

soundToggleBtn.addEventListener('click', () => {
  const unmuted = window.soundEngine.toggleMute();
  soundToggleBtn.textContent = unmuted ? '🔊 Son : ON' : '🔇 Son : OFF';
});

rulesBtn.addEventListener('click', () => {
  rulesModal.classList.remove('hidden');
});

modalCloseBtn.addEventListener('click', () => {
  rulesModal.classList.add('hidden');
});

modalGotItBtn.addEventListener('click', () => {
  rulesModal.classList.add('hidden');
});

// Initialisation au chargement
resetMap();
resetPositions();
requestAnimationFrame(gameLoop);

window.state = state;
window.player = player;
window.startGame = startGame;
window.triggerWhoa = triggerWhoa;
