// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;

// 공 설정 (Scratch의 스프라이트처럼)
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    dx: 4,
    dy: -4,
    radius: 10,
    color: '#ffff00',
    trail: [] // 공의 궤적
};

// 패들 설정
const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 30,
    width: 120,
    height: 15,
    color: '#00ff00',
    speed: 8
};

// 블록들 배열
let blocks = [];
const blockRows = 6;
const blockCols = 10;
const blockWidth = 75;
const blockHeight = 25;
const blockPadding = 5;

// 파티클 효과 배열
let particles = [];

// 마우스 위치
let mouseX = canvas.width / 2;

// 이벤트 리스너
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// 블록 생성 (Scratch의 클론 만들기처럼)
function createBlocks() {
    blocks = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let row = 0; row < blockRows; row++) {
        for (let col = 0; col < blockCols; col++) {
            const block = {
                x: col * (blockWidth + blockPadding) + blockPadding + 10,
                y: row * (blockHeight + blockPadding) + blockPadding + 50,
                width: blockWidth,
                height: blockHeight,
                color: colors[row % colors.length],
                visible: true,
                hits: 0
            };
            blocks.push(block);
        }
    }
}

// 파티클 생성
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            color: color,
            life: 30,
            maxLife: 30
        });
    }
}

// 공 그리기 (궤적 포함)
function drawBall() {
    // 궤적 그리기
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < ball.trail.length; i++) {
        const trailBall = ball.trail[i];
        const alpha = i / ball.trail.length;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(trailBall.x, trailBall.y, ball.radius * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 공 그리기
    ctx.globalAlpha = 1;
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 공에 반짝이는 효과
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

// 패들 그리기
function drawPaddle() {
    // 패들 위치 업데이트 (마우스 따라가기)
    paddle.x = mouseX - paddle.width / 2;
    
    // 경계 체크
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > canvas.width - paddle.width) {
        paddle.x = canvas.width - paddle.width;
    }
    
    // 패들 그리기 (그라데이션)
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(1, '#00aa00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // 패들 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// 블록들 그리기
function drawBlocks() {
    for (let block of blocks) {
        if (block.visible) {
            // 블록 그라데이션
            const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
            gradient.addColorStop(0, block.color);
            gradient.addColorStop(1, darkenColor(block.color, 0.3));
            
            ctx.fillStyle = gradient;
            ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // 블록 테두리
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
    }
}

// 색상 어둡게 만들기
function darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount * 255);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount * 255);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

// 파티클 그리기
function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;
        
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    ctx.globalAlpha = 1;
}

// 충돌 감지
function checkCollisions() {
    // 패들과 공 충돌
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0) {
        
        ball.dy = -ball.dy;
        
        // 패들의 어느 부분에 맞았는지에 따라 각도 조정
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
    }
    
    // 블록과 공 충돌
    for (let block of blocks) {
        if (block.visible &&
            ball.x > block.x &&
            ball.x < block.x + block.width &&
            ball.y > block.y &&
            ball.y < block.y + block.height) {
            
            ball.dy = -ball.dy;
            block.visible = false;
            score += 10;
            
            // 파티클 효과
            createParticles(block.x + block.width/2, block.y + block.height/2, block.color);
            
            updateStats();
            
            // 모든 블록이 깨졌는지 확인
            if (blocks.every(block => !block.visible)) {
                nextLevel();
            }
            break;
        }
    }
}

// 공 업데이트
function updateBall() {
    // 공 이동
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 궤적 업데이트
    ball.trail.push({x: ball.x, y: ball.y});
    if (ball.trail.length > 10) {
        ball.trail.shift();
    }
    
    // 벽 충돌
    if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y < ball.radius) {
        ball.dy = -ball.dy;
    }
    
    // 바닥에 떨어짐
    if (ball.y > canvas.height) {
        lives--;
        updateStats();
        
        if (lives <= 0) {
            gameOver();
        } else {
            resetBall();
        }
    }
}

// 공 리셋
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 100;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = -4;
    ball.trail = [];
}

// 다음 레벨
function nextLevel() {
    level++;
    ball.dx *= 1.1;
    ball.dy *= 1.1;
    createBlocks();
    resetBall();
    updateStats();
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('게임 오버!', canvas.width/2, canvas.height/2);
    ctx.font = '24px Comic Sans MS';
    ctx.fillText('최종 점수: ' + score, canvas.width/2, canvas.height/2 + 50);
}

// 통계 업데이트
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// 게임 루프
function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    // 화면 지우기
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 별 배경
    drawStars();
    
    // 게임 요소들 업데이트 및 그리기
    updateBall();
    checkCollisions();
    
    drawBlocks();
    drawPaddle();
    drawBall();
    drawParticles();
    
    requestAnimationFrame(gameLoop);
}

// 별 배경 그리기
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 73.3) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

// 게임 제어 함수들
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameLoop();
    }
}

function pauseGame() {
    gamePaused = !gamePaused;
    if (!gamePaused && gameRunning) {
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    level = 1;
    createBlocks();
    resetBall();
    updateStats();
}

// 초기화
createBlocks();
updateStats();