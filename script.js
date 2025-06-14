const menu = document.getElementById('menu-section');
const game = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 20;
const gridCount = canvas.width / grid;

let count = 0;
let animation;
let snake, apple;
let score = 0;
let highScore = 0;

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

function resetGame() {
  snake = {
    x: grid * 8,
    y: grid * 8,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  };
  apple = {
    x: getRandomInt(0, gridCount) * grid,
    y: getRandomInt(0, gridCount) * grid
  };
  score = 0;
  updateScore();
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

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < 8) return;  // velocidade controlada aqui
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

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

  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  ctx.fillStyle = "lime";
  for (let i = 0; i < snake.cells.length; i++) {
    let cell = snake.cells[i];
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      updateScore();

      do {
        apple.x = getRandomInt(0, gridCount) * grid;
        apple.y = getRandomInt(0, gridCount) * grid;
      } while (snake.cells.some(c => c.x === apple.x && c.y === apple.y));
    }

    for (let j = i + 1; j < snake.cells.length; j++) {
      if (cell.x === snake.cells[j].x && cell.y === snake.cells[j].y) {
        endGame();
        return;
      }
    }
  }
}

// Controle teclado - PC
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

// Controle toque - celular (swipe)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", function (e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

document.addEventListener("touchend", function (e) {
  const touch = e.changedTouches[0];
  let dx = touch.clientX - touchStartX;
  let dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30 && snake.dx === 0) { // swipe para direita
      snake.dx = grid;
      snake.dy = 0;
    } else if (dx < -30 && snake.dx === 0) { // swipe para esquerda
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    if (dy > 30 && snake.dy === 0) { // swipe para baixo
      snake.dy = grid;
      snake.dx = 0;
    } else if (dy < -30 && snake.dy === 0) { // swipe para cima
      snake.dy = -grid;
      snake.dx = 0;
    }
  }
});
