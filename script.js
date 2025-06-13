const menu = document.getElementById('menu-section');
const game = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const grid = 20;
let count = 0;
let animation;
let snake, apple;

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
}

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < 4) return;
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
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
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
