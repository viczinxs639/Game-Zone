// Elementos
const menu = document.getElementById('menu-section');
const game = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const backMenuButton = document.getElementById('back-menu-button');

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');

const grid = 20;
let count = 0;
let animation;

let snake, apple;
let score = 0;
let highScore = 0;

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
  scoreDisplay.textContent = 'Score: ' + score;
}

function startGame() {
  menu.style.display = 'none';
  game.style.display = 'flex';
  gameOver.style.display = 'none';
  resetGame();
  animation = requestAnimationFrame(loop);
}

function backToMenu() {
  cancelAnimationFrame(animation);
  game.style.display = 'none';
  gameOver.style.display = 'none';
  menu.style.display = 'flex';
}

function restartGame() {
  gameOver.style.display = 'none';
  resetGame();
  animation = requestAnimationFrame(loop);
}

function endGame() {
  cancelAnimationFrame(animation);
  gameOver.style.display = 'block';

  // Atualiza recorde
  if(score > highScore){
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  highScoreDisplay.textContent = 'Recorde: ' + highScore;
}

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < 6) return; // diminui velocidade (aumenta o número para ficar mais lento)
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // Colisão paredes
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
      scoreDisplay.textContent = 'Score: ' + score;

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

// Controle teclado
document.addEventListener("keydown", function (e) {
  if (!snake) return;
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

// Botões
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
backMenuButton.addEventListener('click', backToMenu);

// Puxa highscore do localStorage
if(localStorage.getItem('highScore')){
  highScore = parseInt(localStorage.getItem('highScore'));
  highScoreDisplay.textContent = 'Recorde: ' + highScore;
}
