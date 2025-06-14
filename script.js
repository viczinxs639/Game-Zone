const menu = document.getElementById('menu-section');
const game = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

const grid = 20;  // tamanho da célula
let count = 0;
let animation;
let snake, apple;
let score = 0;
let highScore = 0;

// Ajustar tamanho do canvas conforme a tela, múltiplo de grid
function resizeCanvas() {
  // Queremos tamanho quadrado, máximo 400, mínimo 200, múltiplo de grid
  const maxSize = Math.min(window.innerWidth * 0.9, 400);
  const size = Math.floor(maxSize / grid) * grid;
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
});

function resetGame() {
  score = 0;
  updateScore();

  snake = {
    x: grid * 4,
    y: grid * 4,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  };
  apple = {
    x: getRandomInt(0, canvas.width / grid) * grid,
    y: getRandomInt(0, canvas.height / grid) * grid
  };
}

function updateScore() {
  scoreEl.textContent = `Score: ${score}`;
  highScoreEl.textContent = `Recorde: ${highScore}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function startGame() {
  menu.style.display = 'none';
  game.style.display = 'flex';
  gameOver.style.display = 'none';
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
  if (score > highScore) {
    highScore = score;
    updateScore();
  }
}

// Variável para controlar velocidade (aumentar para diminuir a velocidade)
const speed = 8; // frames por movimento, maior = mais lento

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < speed) return;
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // COLISÃO COM PAREDES
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

  // desenha maçã
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // desenha cobra
  ctx.fillStyle = "lime";
  snake.cells.forEach(function (cell, index) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // come maçã
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      updateScore();

      // Garante que a maçã não apareça em cima da cobra
      do {
        apple.x = getRandomInt(0, canvas.width / grid) * grid;
        apple.y = getRandomInt(0, canvas.height / grid) * grid;
      } while (snake.cells.some(c => c.x === apple.x && c.y === apple.y));
    }

    // colide consigo mesma
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        endGame();
        return;
      }
    }
  });
}

// Controle por teclado
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft" && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  } else if (e.key === "ArrowUp" && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  } else if (e.key === "ArrowRight" && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  } else if (e.key === "ArrowDown" && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

// Controle por toque (swipe)
// Detecta o início do toque e o fim para detectar a direção do swipe
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', function(e) {
  const touch = e.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, false);

canvas.addEventListener('touchend', function(e) {
  if (touchStartX === null || touchStartY === null) return;

  const touch = e.changedTouches[0];
  const diffX = touch.clientX - touchStartX;
  const diffY = touch.clientY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // movimento horizontal
    if (diffX > 30 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    } else if (diffX < -30 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    // movimento vertical
    if (diffY > 30 && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    } else if (diffY < -30 && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    }
  }

  touchStartX = null;
  touchStartY = null;
}, false);
