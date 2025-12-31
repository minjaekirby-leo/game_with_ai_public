// 캔버스와 컨텍스트 가져오기
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 설정
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 뱀 초기 설정
let snake = [
    {x: 10, y: 10}
];
let dx = 0;
let dy = 0;

// 사과 위치
let appleX = 15;
let appleY = 15;

// 점수
let score = 0;
let gameRunning = true;

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
}

function update() {
    // 뱀 머리 이동
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    // 벽 충돌 검사
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 자기 몸 충돌 검사
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // 사과 먹었는지 확인
    if (head.x === appleX && head.y === appleY) {
        score += 10;
        document.getElementById('score').textContent = '점수: ' + score;
        generateApple();
    } else {
        snake.pop(); // 꼬리 제거
    }
}

function draw() {
    // 배경 그리기
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 뱀 그리기
    ctx.fillStyle = '#2c3e50';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // 뱀 머리 다르게 그리기
    ctx.fillStyle = '#34495e';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
    
    // 사과 그리기
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(appleX * gridSize, appleY * gridSize, gridSize - 2, gridSize - 2);
}

function generateApple() {
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
    
    // 뱀 몸과 겹치지 않게 하기
    for (let segment of snake) {
        if (segment.x === appleX && segment.y === appleY) {
            generateApple();
            return;
        }
    }
}

function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').style.display = 'block';
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    gameRunning = true;
    document.getElementById('score').textContent = '점수: 0';
    document.getElementById('gameOver').style.display = 'none';
    generateApple();
}

// 키보드 입력 처리
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code === 'Space') {
        resetGame();
        return;
    }
    
    if (!gameRunning) return;
    
    // 방향 바꾸기 (반대 방향으로는 못 감)
    switch(e.code) {
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            break;
    }
});

// 게임 시작
generateApple();
setInterval(gameLoop, 150); // 150ms마다 업데이트