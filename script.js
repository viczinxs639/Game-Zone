(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startButton = document.getElementById('start-button');
  const rankingModal = document.getElementById('ranking-modal');
  const rankingList = document.getElementById('ranking-list');
  const closeRanking = document.getElementById('close-ranking');
  const touchButtons = document.querySelectorAll('#touch-controls button');

  const canvasSize = 600;
  const tileCount = 20;
  const tileSize = canvasSize / tileCount;

  // Texturas base64 embutidas para snake e maçã (sprites simples)
  const snakeTexture = new Image();
  snakeTexture.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAlklEQVQ4T2NkoBAwUqifAQL8TyMiMlKg2v+pDZLnw8O3aF5V+YOfhDYCAeQOdwYB+Wi5lHCAmAC/wcFhBfsNnAYajxn+ASiFJsBiYeB8J0VgPr8PFAuAyIQIpyT1gROc0ohJoAxDv+A0RxRhgQUws/jt4NCBHiHeJu2DZqDSYBgJ6/1NLYxJiEJy8uBqZPdyv6DWQANxzF4J7pGiNQAAAABJRU5ErkJggg==";
  const appleTexture = new Image();
  appleTexture.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAArklEQVQ4T2NkoBAwUqifAQL8TyMiMlKg2v+pDZLnw8O3aF5V+YOfhDYCAeQOdwYB+Wi5lHCAmAC/wcFhBfsNnAYajxn+ASiFJsBiYeB8J0VgPr8PFAuAyIQIpyT1gROc0ohJoAxDv+A0RxRhgQUws/jt4NCBHiHeJu2DZqDSYBgJ6/1NLYxJiEJy8uBqZPdyv6DWQANxzF4J7pGiNQAAAABJRU5ErkJggg==";

  let snake = [];
  let velocity = { x: 0, y: 0 };
  let apple = { x: 0, y: 0 };
  let score = 0;
  let running = false;
  let moveQueue = [];
  let gameLoopInterval;

  // Sons com URLs públicas
  const eatSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
  const gameOverSound = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg');

  function placeApple() {
    let valid = false;
    while (!valid) {
      apple.x = Math.floor(Math.random() * tileCount);
      apple.y = Math.floor(Math.random() * tileCount);
      valid = !snake.some(segment => segment.x === apple.x && segment.y === apple.y);
    }
  }

  function resetGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    velocity = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = 'Score: 0';
    moveQueue = [];
    placeApple();
    running = true;
  }

  function drawGrid() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
  }

  function drawSnake() {
    snake.forEach((segment, index) => {
      ctx.drawImage(snakeTexture, segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
      ctx.strokeStyle = '#0f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    });
  }

  function drawApple() {
    ctx.drawImage(appleTexture, apple.x * tileSize, apple.y * tileSize, tileSize, tileSize);
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(apple.x * tileSize, apple.y * tileSize, tileSize, tileSize);
  }

  function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
  }

  function gameOver() {
    running = false;
    clearInterval(gameLoopInterval);
    gameOverSound.play();
    updateRanking(score);
    showRanking();
  }

  function moveSnake() {
    if (moveQueue.length > 0) {
      const nextDir = moveQueue.shift();
      // Impede reversão direta
      if (!((nextDir.x === -velocity.x && nextDir.y === 0) || (nextDir.y === -velocity.y && nextDir.x === 0))) {
        velocity = nextDir;
      }
    }

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Verifica colisão nas bordas
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }

    // Verifica colisão com o corpo
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // Verifica se comeu a maçã
    if (head.x === apple.x && head.y === apple.y) {
      score++;
      updateScore();
      eatSound.play();
      placeApple();
    } else {
      snake.pop();
    }
  }

  function gameLoop() {
    drawGrid();
    moveSnake();
    drawSnake();
    drawApple();
  }

  function startGame() {
    if (running) return;
    resetGame();
    gameLoopInterval = setInterval(gameLoop, 120);
  }

  // Ranking localStorage
  function getRanking() {
    const raw = localStorage.getItem('snakeRanking');
    return raw ? JSON.parse(raw) : [];
  }

  function saveRanking(ranking) {
    localStorage.setItem('snakeRanking', JSON.stringify(ranking));
  }

  function updateRanking(score) {
    let ranking = getRanking();
    ranking.push({ score, date: new Date().toISOString() });
    ranking.sort((a,b) => b.score - a.score);
    if (ranking.length > 5) ranking.length = 5;
    saveRanking(ranking);
  }

  function showRanking() {
    const ranking = getRanking();
    rankingList.innerHTML = '';
    if (ranking.length === 0) {
      rankingList.innerHTML = '<li>Nenhum resultado ainda</li>';
    } else {
      ranking.forEach((entry, i) => {
        const date = new Date(entry.date);
        const li = document.createElement('li');
        li.textContent = `${i+1}º - ${entry.score} pontos em ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        rankingList.appendChild(li);
      });
    }
    rankingModal.style.display = 'block';
  }

  // Event Listeners

  startButton.addEventListener('click', () => {
    rankingModal.style.display = 'none';
    startGame();
  });

  closeRanking.addEventListener('click', () => {
    rankingModal.style.display = 'none';
  });

  window.addEventListener('keydown', (e) => {
    const directions = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 }
    };
    if (directions[e.key]) {
      e.preventDefault();
      moveQueue.push(directions[e.key]);
    }
  });

  touchButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const dir = btn.getAttribute('data-dir');
      const directions = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 }
      };
      if (directions[dir]) {
        moveQueue.push(directions[dir]);
      }
    });
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-dir');
      const directions = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 }
      };
      if (directions[dir]) {
        moveQueue.push(directions[dir]);
      }
    });
  });

})();
