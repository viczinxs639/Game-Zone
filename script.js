const menu = document.getElementById('menu-section');
const gameSection = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');

const grid = 20;
let count = 0;
let speed = 8; // 🔹 VELOCIDADE INICIAL REDUZIDA (menor = mais lento)
let animation;
let snake, apple, score, highScore = 0;

// Controle por toque (celular)
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', (e) => {
  if (!snake) return;
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal
    if (dx > 0 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    } else if (dx < 0 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    // Vertical
    if (dy > 0 && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    } else if (dy < 0 && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    }
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

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
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
  highScoreDisplay.textContent = `R
