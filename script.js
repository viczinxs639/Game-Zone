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

  let snake = [];
  let velocity = { x: 0, y: 0 };
  let apple = { x: 0, y: 0 };
  let score = 0;
  let running = false;
  let moveQueue = [];
  let gameLoopInterval;

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
    ctx.fillStyle = '#0f0';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
    });
  }

  function drawApple() {
    ctx.fillStyle = '#f00';
    ctx.fillRect(apple.x * tileSize, apple.y * tileSize, tileSize, tileSize);
  }

  function updateScore() {
    scoreEl.textContent = `Score: ${score}`;
  }

  function gameOver() {
    running = false;
    clearInterval(gameLoopInterval);
    alert(`Fim de jogo! Seu score: ${score}`);
  }

  function moveSnake() {
    if (moveQueue.length > 0) {
      const nextDir = moveQueue.shift();
      if (!((nextDir.x === -velocity.x && nextDir.y === 0) || (nextDir.y === -velocity.y && nextDir.x === 0))) {
        velocity = nextDir;
      }
    }

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }

    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
      score++;
      updateScore();
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
    gameLoopInterval = setInterval(gameLoop, 150); // velocidade menor
  }

  startButton.addEventListener('click', () => {
    startGame();
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
