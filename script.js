const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let gameLoop;
let gameSpeed = 120;
let isPlaying = false;

// Theme Colors
const snakeColor = '#10b981';
const snakeHeadColor = '#34d399';
const foodColor = '#f43f5e';

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    score = 0;
    gameSpeed = 120;
    scoreElement.textContent = score;
    placeFood();
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    isPlaying = true;
    
    // Initial draw
    clearCanvas();
    drawGrid();
    drawFood();
    drawSnake();
}

function startGame() {
    initGame();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

function stopGame() {
    isPlaying = false;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('active');
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Ensure food doesn't spawn on snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            placeFood();
            break;
        }
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part, index) => {
        const isHead = index === 0;
        
        if (isHead) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = snakeHeadColor;
            ctx.fillStyle = snakeHeadColor;
        } else {
            ctx.shadowBlur = 5;
            ctx.shadowColor = snakeColor;
            ctx.fillStyle = snakeColor;
        }
        
        // Slightly smaller than grid size for gap effect
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
        
        // Reset shadow
        ctx.shadowBlur = 0;
    });
}

function drawFood() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = foodColor;
    ctx.fillStyle = foodColor;
    
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2, 
        food.y * gridSize + gridSize / 2, 
        gridSize / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function moveSnake() {
    dx = nextDx;
    dy = nextDy;
    
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        stopGame();
        return;
    }
    
    // Self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            stopGame();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood();
        
        // Add a class for pulse animation to score element
        scoreElement.parentElement.classList.add('pulse');
        setTimeout(() => scoreElement.parentElement.classList.remove('pulse'), 200);
        
        // Speed up slightly
        if (gameSpeed > 50 && score % 50 === 0) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }
}

function update() {
    if (!isPlaying) return;
    
    moveSnake();
    
    if (isPlaying) {
        clearCanvas();
        drawGrid();
        drawFood();
        drawSnake();
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (!isPlaying) {
        if (e.code === 'Space' || e.key === 'Enter') {
            startGame();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) { nextDx = -1; nextDy = 0; }
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) { nextDx = 0; nextDy = -1; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) { nextDx = 1; nextDy = 0; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) { nextDx = 0; nextDy = 1; }
            break;
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

clearCanvas();
drawGrid();
