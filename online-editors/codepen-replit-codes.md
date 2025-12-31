# CodePen / Replit용 코드들

CodePen (https://codepen.io/)이나 Replit (https://replit.com/)에서 사용할 수 있는 완전한 HTML 코드들입니다.

## 1. 뱀 게임 (CodePen용)

새 Pen을 만들고 HTML, CSS, JS를 각각 분리해서 붙여넣으세요:

### HTML:
```html
<div class="game-container">
    <h1>🐍 뱀 게임</h1>
    <div class="instructions">
        <p>화살표 키로 뱀을 조종하세요!</p>
        <p>빨간 사과를 먹으면 점수가 올라갑니다!</p>
    </div>
    <div class="score" id="score">점수: 0</div>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div class="game-over" id="gameOver" style="display: none;">
        게임 오버! 스페이스바를 눌러서 다시 시작하세요!
    </div>
</div>
```

### CSS:
```css
body {
    margin: 0;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #2c3e50;
    color: white;
    text-align: center;
}

.game-container {
    max-width: 600px;
    margin: 0 auto;
}

h1 {
    color: #e74c3c;
    margin-bottom: 10px;
}

canvas {
    border: 3px solid #34495e;
    background-color: #27ae60;
    margin: 20px auto;
    display: block;
}

.instructions {
    margin: 20px;
    color: #ecf0f1;
}

.score {
    font-size: 24px;
    color: #f39c12;
    margin: 10px;
}

.game-over {
    font-size: 24px;
    color: #e74c3c;
    margin: 20px;
}
```

### JavaScript:
```javascript
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
        snake.pop();
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
setInterval(gameLoop, 150);
```

## 2. 완전한 HTML 파일 (Replit용)

Replit에서 새 HTML/CSS/JS 프로젝트를 만들고 `index.html`에 아래 코드를 붙여넣으세요:

```html
<!DOCTYPE html>
<html>
<head>
    <title>미니 게임 모음</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Comic Sans MS', cursive;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
            text-align: center;
        }
        
        .game-selector {
            margin: 20px;
        }
        
        button {
            background: #fff;
            color: #333;
            border: none;
            padding: 15px 30px;
            margin: 10px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        button:hover {
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        canvas {
            border: 3px solid #fff;
            border-radius: 10px;
            margin: 20px;
            display: none;
        }
        
        .active {
            display: block !important;
        }
    </style>
</head>
<body>
    <h1>🎮 미니 게임 모음</h1>
    
    <div class="game-selector">
        <button onclick="showGame('bouncing')">튀는 공</button>
        <button onclick="showGame('catch')">물체 잡기</button>
        <button onclick="showGame('draw')">그림 그리기</button>
    </div>
    
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let currentGame = '';
        let animationId;
        
        // 게임 변수들
        let ball = {x: 300, y: 200, dx: 3, dy: 2, radius: 25, color: '#ff6b6b'};
        let catcher = {x: 300, y: 350, width: 80, height: 20};
        let fallingItems = [];
        let score = 0;
        
        function showGame(gameType) {
            canvas.classList.add('active');
            currentGame = gameType;
            
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            switch(gameType) {
                case 'bouncing':
                    bouncingBallGame();
                    break;
                case 'catch':
                    catchGame();
                    break;
                case 'draw':
                    drawGame();
                    break;
            }
        }
        
        function bouncingBallGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 배경
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 공 이동
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // 벽 충돌
            if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
                ball.dx = -ball.dx;
            }
            if (ball.y < ball.radius || ball.y > canvas.height - ball.radius) {
                ball.dy = -ball.dy;
            }
            
            // 공 그리기
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            
            animationId = requestAnimationFrame(bouncingBallGame);
        }
        
        function catchGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 배경
            ctx.fillStyle = '#45b7d1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 새로운 아이템 생성
            if (Math.random() < 0.02) {
                fallingItems.push({
                    x: Math.random() * (canvas.width - 20),
                    y: 0,
                    speed: Math.random() * 3 + 2,
                    color: '#ff6b6b'
                });
            }
            
            // 아이템들 이동 및 그리기
            for (let i = fallingItems.length - 1; i >= 0; i--) {
                const item = fallingItems[i];
                item.y += item.speed;
                
                ctx.fillStyle = item.color;
                ctx.fillRect(item.x, item.y, 20, 20);
                
                // 바구니와 충돌 검사
                if (item.y > catcher.y - 20 &&
                    item.x > catcher.x &&
                    item.x < catcher.x + catcher.width) {
                    score++;
                    fallingItems.splice(i, 1);
                }
                // 화면 밖으로 나감
                else if (item.y > canvas.height) {
                    fallingItems.splice(i, 1);
                }
            }
            
            // 바구니 그리기
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(catcher.x, catcher.y, catcher.width, catcher.height);
            
            // 점수 표시
            ctx.fillStyle = '#fff';
            ctx.font = '20px Comic Sans MS';
            ctx.fillText('점수: ' + score, 10, 30);
            
            animationId = requestAnimationFrame(catchGame);
        }
        
        function drawGame() {
            // 그림 그리기 모드
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#333';
            ctx.font = '24px Comic Sans MS';
            ctx.fillText('마우스로 그림을 그려보세요!', 150, 200);
        }
        
        // 마우스 이벤트
        let isDrawing = false;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            if (currentGame === 'catch') {
                catcher.x = mouseX - catcher.width / 2;
            }
            
            if (currentGame === 'draw' && isDrawing) {
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        canvas.addEventListener('mousedown', () => {
            if (currentGame === 'draw') {
                isDrawing = true;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });
        
        canvas.addEventListener('click', () => {
            if (currentGame === 'bouncing') {
                ball.color = '#' + Math.floor(Math.random()*16777215).toString(16);
            }
        });
    </script>
</body>
</html>
```