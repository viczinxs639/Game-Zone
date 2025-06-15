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
const rankingList = document.getElementById('ranking-list');

const eatSound = document.getElementById('eat-sound');
const gameoverSound = document.getElementById('gameover-sound');

const grid = 20;
let count = 0;
let animation;

let snake, apple;
let score = 0;
let highScore = 0;
let speed = 12; // menor é mais lento

// Carregar texturas
const snakeImg = new Image();
snakeImg.src = "snake-texture.png";

const appleImg = new Image();
appleImg.src = "apple-texture.png";

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
  updateRanking();
}

function restartGame() {
  gameOver.style.display = 'none';
  resetGame();
  animation = requestAnimationFrame(loop);
}

function endGame() {
  cancelAnimationFrame(animation);
  gameOver.style.display = 'block';

  // Toca som
  gameoverSound.currentTime = 0;
  gameoverSound.play();

  // Atualiza recorde
  if(score > highScore){
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  highScoreDisplay.textContent = 'Recorde: ' + highScore;

  // Salva ranking local
  saveRanking(score);
  updateRanking();
}

function loop() {
  animation = requestAnimationFrame(loop);

  if (++count < speed) return; // controla a velocidade (menor valor = mais lento)
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

  // desenha maçã com textura
  ctx.drawImage(appleImg, apple.x, apple.y, grid - 1, grid - 1);

  // desenha cobra com textura
  snake.cells.forEach(function (cell, index) {
    ctx.drawImage(snakeImg, cell.x, cell.y, grid - 1, grid - 1);

    // come maçã
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score++;
      scoreDisplay.textContent = 'Score: ' + score;

      eatSound.currentTime = 0;
      eatSound.play();

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

// Controle toque para celular - Swipe simples
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});

canvas.addEventListener('touchend', e => {
  if (touchStartX === null || touchStartY === null) return;

  let touchEndX = e.changedTouches[0].screenX;
  let touchEndY = e.changedTouches[0].screenY;

  let diffX = touchEndX - touchStartX;
  let diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 30 && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    } else if (diffX < -30 && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    }
  } else {
    // Vertical swipe
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

// Ranking simples local usando localStorage
function saveRanking(score){
  let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  ranking.push(score);
  ranking.sort((a,b) => b - a);
  if(ranking.length > 5) ranking = ranking.slice(0,5);
  localStorage.setItem('ranking', JSON.stringify(ranking));
}

function updateRanking(){
  let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
  rankingList.innerHTML = '';
  if(ranking.length === 0){
    rankingList.innerHTML = '<li>Nenhum registro ainda.</li>';
    return;
  }
  ranking.forEach((score,i) => {
    rankingList.innerHTML += `<li>${i+1}. ${score} pontos</li>`;
  });
}

// Atualiza ranking na tela inicial caso volte
updateRanking();
