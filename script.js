const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const boxSize = 20;
const canvasSize = canvas.width;
const rows = canvasSize / boxSize;

let snake = [];
let food = {};
let direction = 'RIGHT';
let score = 0;
let gameInterval = null;
let resetCount = 0;
const maxResets = 3;

// Draw rounded rectangles (for snake body)
function drawRoundedRect(x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Place food randomly
function generateFood() {
  food = {
    x: Math.floor(Math.random() * rows) * boxSize,
    y: Math.floor(Math.random() * rows) * boxSize,
  };

  // Ensure food doesn't overlap with the snake
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

// Change direction based on user input
document.addEventListener('keydown', event => {
  const key = event.key;
  if (key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Game loop
function gameLoop() {
  const head = { ...snake[0] };

  if (direction === 'UP') head.y -= boxSize;
  if (direction === 'DOWN') head.y += boxSize;
  if (direction === 'LEFT') head.x -= boxSize;
  if (direction === 'RIGHT') head.x += boxSize;

  // Check for collisions
  if (
    head.x < 0 ||
    head.x >= canvasSize ||
    head.y < 0 ||
    head.y >= canvasSize ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);

    // Check if resets are remaining
    if (resetCount < maxResets) {
      resetCount++;
      alert(`Game Over! You have ${maxResets - resetCount} reset(s) remaining.`);
      resetGame();
    } else {
      gameOverMenu();
    }

    return;
  }

  // Add head
  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('scoreboard').textContent = `Score: ${score}`;
    generateFood();
  } else {
    snake.pop();
  }

  drawGame();
}

// Draw the game
function drawGame() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw food (a shiny red apple)
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(food.x + boxSize / 2, food.y + boxSize / 2, boxSize / 2.5, 0, 2 * Math.PI);
  ctx.fill();

  // Draw snake
  snake.forEach((segment, index) => {
    drawRoundedRect(segment.x, segment.y, boxSize, boxSize, 5, index === 0 ? '#00ff00' : '#00ff00');
  });
}

// Reset game
function resetGame() {
  direction = 'RIGHT';
  score = 0;
  snake = [{ x: boxSize * 5, y: boxSize * 5 }];
  document.getElementById('scoreboard').textContent = `Score: ${score}`;
  generateFood();

  const difficulty = document.getElementById('difficulty').value;
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, difficulty);
}

// Display game over menu
function gameOverMenu() {
  const menu = document.createElement('div');
  menu.style.position = 'absolute';
  menu.style.top = '50%';
  menu.style.left = '50%';
  menu.style.transform = 'translate(-50%, -50%)';
  menu.style.background = '#333';
  menu.style.color = '#fff';
  menu.style.padding = '20px';
  menu.style.textAlign = 'center';
  menu.style.borderRadius = '10px';
  menu.innerHTML = `
    <h2>Game Over</h2>
    <p>Your score: ${score}</p>
    <button id="restart">Restart</button>
    <button id="exit">Exit</button>
  `;

  document.body.appendChild(menu);

  document.getElementById('restart').addEventListener('click', () => {
    resetCount = 0;
    document.body.removeChild(menu);
    startGame();
  });

  document.getElementById('exit').addEventListener('click', () => {
    document.body.removeChild(menu);
    alert('Thanks for playing!');
  });
}

// Start game
function startGame() {
  resetCount = 0; // Reset the reset counter
  resetGame(); // Initialize and reset game state
}
