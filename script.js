const menu = document.getElementById('menu-section');
const gameSection = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const scoreboard = document.getElementById('score');
const highScoreboard = document.getElementById('high-score');
const rankingDiv = document.getElementById('ranking');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('start-button');

const grid = 20;
let count = 0;
let animation;
let snake, apple;
let score = 0;
let highScore = 0;
let ranking = [];

let touchStartX = null;
let touchStartY = null;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
  snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  };
  apple = {
    x: getRandomInt(0, 20) * grid,
    y: getRandomInt(0, 20) * grid
  };
  score = 0;
  updateScore();
  gameOver.style.display = 'none';
  rankingDiv.innerHTML = '';
}

function updateScore() {
  scoreboard.textContent = `Score: ${score}`;
  highScoreboard.textContent = `Recorde: ${highScore}`;
}

function updateRanking() {
  ranking.push(score);
  ranking = ranking.filter(s => typeof s === 'number');
  ranking.sort((a, b) => b - a);
  ranking = ranking.slice(0, 3);
  highScore = ranking[0] || 0;
  updateScore();

  let html = '<h3>🏆 Ranking:</h3>';
  ranking.forEach((s, i) => {
    html += `<p>${i + 1}º: ${s} pontos</p>`;
  });
  rankingDiv.innerHTML = html;
}

function startGame() {
  // Sons
  startSound.play();

  menu.style.display = 'none';
  gameSection.style.display = 'flex';
  resetGame();
  animation = requestAnimationFrame(loop);
}

function backToMenu() {
  window.location.reload();
}

function restartGame() {
  gameOver.style.display = 'none';
  resetGame();
  animation = requestAnimationFrame(loop);
}

function endGame() {
  cancelAnimationFrame(animation);
  gameOver.style.display = 'block';
  gameOverSound.play();
  updateRanking();
}

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < 6) return; // Velocidade reduzida (antes era 4)
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // Colisão com paredes
  if (
    snake.x < 0 || snake.x >= canvas.width ||
    snake.y < 0 || snake.y >= canvas.height
  ) {
    endGame();
    return;
  }

  snake.cells.unshift({ x: snake.x, y: snake.y });

  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // Desenha maçã
  ctx.fillStyle = 'red';
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // Desenha cobra
  ctx.fillStyle = 'lime';
  snake.cells.forEach(function(cell, index) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // Comer maçã
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      updateScore();
      eatSound.play();
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }

    // Colisão consigo mesma
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        endGame();
        return;
      }
    }
  });
}

// Controle teclado
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft' && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  } else if (e.key === 'ArrowUp' && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  } else if (e.key === 'ArrowRight' && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  } else if (e.key === 'ArrowDown' && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

// Controle toque para mobile (swipe)
canvas.addEventListener('touchstart', function(e) {
  const touch = e.changedTouches[0];
  touchStartX = touch.pageX;
  touchStartY = touch.pageY;
}, false);

canvas.addEventListener('touchend', function(e) {
  if (touchStartX === null || touchStartY === null) return;
  const touch = e.changedTouches[0];
  const dx = touch.pageX - touchStartX;
  const dy = touch.pageY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && snake.dx === 0) { // swipe right
      snake.dx = grid;
      snake.dy = 0;
    } else if (dx < -30 && snake.dx === 0) { // swipe left
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    if (dy > 30 && snake.dy === 0) { // swipe down
      snake.dy = grid;
      snake.dx = 0;
    } else if (dy < -30 && snake.dy === 0) { // swipe up
      snake.dy = -grid;
      snake.dx = 0;
    }
  }
  touchStartX = null;
  touchStartY = null;
}, false);

// Sons
const eatSound = new Audio('sounds/eat.mp3');
const gameOverSound = new Audio('sounds/gameover.mp3');
const startSound = new Audio('sounds/start.mp3');

// Botão iniciar
startBtn.addEventListener('click', startGame);
