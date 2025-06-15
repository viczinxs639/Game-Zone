const menu = document.getElementById('menu-section');
const gameSection = document.getElementById('game-section');
const gameOver = document.getElementById('game-over');
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const rankingList = document.getElementById("ranking-list");

const grid = 20;
let count = 0;
let animation;
let snake, apple, score, highScore;

let eatSound = new Audio('eat.mp3');
let gameOverSound = new Audio('gameover.mp3');

function showGameScreen() {
  menu.style.display = 'none';
  gameSection.style.display = 'flex';
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
  scoreDisplay.textContent = "Score: 0";
  highScore = localStorage.getItem("highScore") || 0;
  highScoreDisplay.textContent = "Recorde: " + highScore;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function startGame() {
  resetGame();
  document.querySelector(".play-btn").style.display = 'none';
  gameOver.style.display = 'none';
  animation = requestAnimationFrame(loop);
}

function backToMenu() {
  location.reload();
}

function restartGame() {
  document.querySelector(".play-btn").style.display = 'block';
  gameOver.style.display = 'none';
}

function endGame() {
  cancelAnimationFrame(animation);
  gameOver.style.display = 'block';
  gameOverSound.play();

  // Atualiza recorde
  if (score > highScore) {
    localStorage.setItem("highScore", score);
  }
  updateRanking(score);
}

function updateRanking(newScore) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push(newScore);
  ranking.sort((a, b) => b - a);
  ranking = ranking.slice(0, 3);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  rankingList.innerHTML = "";
  ranking.forEach((s, i) => {
    rankingList.innerHTML += `<li>#${i + 1}: ${s} pts</li>`;
  });
}

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < 6) return; // Diminuiu a velocidade
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  // Colisão com parede
  if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
    endGame();
    return;
  }

  snake.cells.unshift({ x: snake.x, y: snake.y });

  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // Desenha maçã
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // Desenha cobra
  ctx.fillStyle = "lime";
  snake.cells.forEach(function (cell, index) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

    // Comer maçã
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      scoreDisplay.textContent = "Score: " + score;
      eatSound.play();
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }

    // Colisão com o próprio corpo
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

// Carregar ranking ao abrir
window.onload = function() {
  updateRanking(0);
};
