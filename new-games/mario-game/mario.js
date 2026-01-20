// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 모바일 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 캔버스 크기 조정
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(800, window.innerWidth - 40);
    const maxHeight = Math.min(400, window.innerHeight * 0.4);
    
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = maxHeight + 'px';
    
    // 실제 캔버스 크기는 고정 (렌더링 품질 유지)
    canvas.width = 800;
    canvas.height = 400;
}

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let coins = 0;
let lives = 3;
let level = 1;

// 게임 설정
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// 마리오 객체
const mario = {
    x: 50,
    y: 300,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    direction: 1, // 1: 오른쪽, -1: 왼쪽
    animationFrame: 0,
    animationTimer: 0
};

// 카메라
const camera = {
    x: 0,
    y: 0
};

// 게임 오브젝트들
let platforms = [];
let coins_objects = [];
let enemies = [];
let flag = null;

// 키보드 입력
const keys = {};

// 피드백 시스템
let feedbacks = JSON.parse(localStorage.getItem('marioGameFeedbacks')) || [];

// 피드백 제출
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    const userName = document.getElementById('userName').value.trim();
    
    if (!feedbackText) {
        alert('피드백 내용을 입력해주세요!');
        return;
    }
    
    if (!userName) {
        alert('이름을 입력해주세요!');
        return;
    }
    
    const feedback = {
        content: feedbackText,
        author: userName,
        timestamp: new Date().toLocaleString()
    };
    
    feedbacks.push(feedback);
    localStorage.setItem('marioGameFeedbacks', JSON.stringify(feedbacks));
    
    // 폼 리셋
    document.getElementById('feedbackText').value = '';
    document.getElementById('userName').value = '';
    
    // 피드백 목록 업데이트
    updateFeedbackList();
    
    alert('피드백이 등록되었습니다! 감사합니다! 🎮');
}

// 피드백 목록 업데이트
function updateFeedbackList() {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '';
    
    // 최신 피드백부터 표시 (최대 10개)
    const recentFeedbacks = feedbacks.slice(-10).reverse();
    
    recentFeedbacks.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `
            <div class="feedback-content">${feedback.content}</div>
            <div class="feedback-author">- ${feedback.author}</div>
        `;
        feedbackList.appendChild(feedbackItem);
    });
    
    if (feedbacks.length === 0) {
        feedbackList.innerHTML = '<div class="feedback-item"><div class="feedback-content">아직 피드백이 없습니다. 첫 번째 피드백을 남겨주세요!</div></div>';
    }
}

// 레벨 초기화
function initLevel() {
    platforms = [
        // 바닥
        { x: 0, y: 370, width: 200, height: 30 },
        { x: 250, y: 370, width: 150, height: 30 },
        { x: 450, y: 370, width: 200, height: 30 },
        { x: 700, y: 370, width: 300, height: 30 },
        { x: 1050, y: 370, width: 200, height: 30 },
        { x: 1300, y: 370, width: 200, height: 30 },
        
        // 플랫폼들
        { x: 300, y: 280, width: 100, height: 20 },
        { x: 500, y: 250, width: 100, height: 20 },
        { x: 750, y: 280, width: 100, height: 20 },
        { x: 950, y: 220, width: 100, height: 20 },
        { x: 1150, y: 280, width: 100, height: 20 },
        
        // 높은 플랫폼들
        { x: 600, y: 150, width: 80, height: 20 },
        { x: 800, y: 120, width: 80, height: 20 },
        { x: 1000, y: 100, width: 80, height: 20 }
    ];
    
    coins_objects = [
        { x: 320, y: 240, collected: false },
        { x: 520, y: 210, collected: false },
        { x: 770, y: 240, collected: false },
        { x: 970, y: 180, collected: false },
        { x: 1170, y: 240, collected: false },
        { x: 620, y: 110, collected: false },
        { x: 820, y: 80, collected: false },
        { x: 1020, y: 60, collected: false },
        { x: 350, y: 330, collected: false },
        { x: 550, y: 330, collected: false }
    ];
    
    enemies = [
        { x: 400, y: 340, width: 24, height: 24, velocityX: -1, direction: -1 },
        { x: 650, y: 340, width: 24, height: 24, velocityX: 1, direction: 1 },
        { x: 900, y: 340, width: 24, height: 24, velocityX: -1, direction: -1 },
        { x: 1200, y: 340, width: 24, height: 24, velocityX: 1, direction: 1 }
    ];
    
    flag = { x: 1450, y: 270, width: 20, height: 100, reached: false };
}

// 충돌 감지
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 마리오 업데이트
function updateMario() {
    // 애니메이션
    mario.animationTimer++;
    if (mario.animationTimer > 10) {
        mario.animationFrame = (mario.animationFrame + 1) % 4;
        mario.animationTimer = 0;
    }
    
    // 입력 처리
    mario.velocityX = 0;
    
    if (keys['ArrowLeft'] || keys['KeyA']) {
        mario.velocityX = -MOVE_SPEED;
        mario.direction = -1;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        mario.velocityX = MOVE_SPEED;
        mario.direction = 1;
    }
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && mario.onGround) {
        mario.velocityY = JUMP_FORCE;
        mario.onGround = false;
    }
    
    // 중력 적용
    mario.velocityY += GRAVITY;
    
    // 위치 업데이트
    mario.x += mario.velocityX;
    mario.y += mario.velocityY;
    
    // 바닥 충돌 (임시)
    mario.onGround = false;
    
    // 플랫폼 충돌
    platforms.forEach(platform => {
        if (checkCollision(mario, platform)) {
            // 위에서 떨어지는 경우
            if (mario.velocityY > 0 && mario.y < platform.y) {
                mario.y = platform.y - mario.height;
                mario.velocityY = 0;
                mario.onGround = true;
            }
            // 아래에서 올라가는 경우
            else if (mario.velocityY < 0 && mario.y > platform.y) {
                mario.y = platform.y + platform.height;
                mario.velocityY = 0;
            }
            // 옆에서 충돌하는 경우
            else if (mario.velocityX > 0 && mario.x < platform.x) {
                mario.x = platform.x - mario.width;
            }
            else if (mario.velocityX < 0 && mario.x > platform.x) {
                mario.x = platform.x + platform.width;
            }
        }
    });
    
    // 화면 아래로 떨어지면
    if (mario.y > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameOver();
        } else {
            resetMarioPosition();
        }
    }
    
    // 화면 왼쪽 경계
    if (mario.x < 0) {
        mario.x = 0;
    }
}

// 적 업데이트
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;
        
        // 플랫폼 끝에서 방향 전환
        let onPlatform = false;
        platforms.forEach(platform => {
            if (enemy.y + enemy.height >= platform.y && 
                enemy.y + enemy.height <= platform.y + platform.height &&
                enemy.x + enemy.width > platform.x && 
                enemy.x < platform.x + platform.width) {
                onPlatform = true;
            }
        });
        
        if (!onPlatform || enemy.x <= 0) {
            enemy.velocityX *= -1;
            enemy.direction *= -1;
        }
        
        // 마리오와 충돌
        if (checkCollision(mario, enemy)) {
            // 위에서 밟으면 적 제거
            if (mario.velocityY > 0 && mario.y < enemy.y) {
                enemy.x = -100; // 화면 밖으로
                score += 100;
                mario.velocityY = JUMP_FORCE / 2; // 작은 점프
            } else {
                // 옆에서 충돌하면 생명 감소
                lives--;
                if (lives <= 0) {
                    gameOver();
                } else {
                    resetMarioPosition();
                }
            }
        }
    });
}

// 코인 수집
function updateCoins() {
    coins_objects.forEach(coin => {
        if (!coin.collected && checkCollision(mario, { x: coin.x, y: coin.y, width: 20, height: 20 })) {
            coin.collected = true;
            coins++;
            score += 50;
        }
    });
}

// 깃발 체크
function updateFlag() {
    if (!flag.reached && checkCollision(mario, flag)) {
        flag.reached = true;
        score += 1000;
        level++;
        
        // 다음 레벨로
        setTimeout(() => {
            nextLevel();
        }, 1000);
    }
}

// 카메라 업데이트
function updateCamera() {
    camera.x = mario.x - canvas.width / 2;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > 1500 - canvas.width) camera.x = 1500 - canvas.width;
}

// 마리오 그리기
function drawMario() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // 마리오 색상
    ctx.fillStyle = mario.direction === 1 ? '#FF0000' : '#FF4444';
    
    // 몸체
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);
    
    // 모자
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(mario.x + 4, mario.y, mario.width - 8, 8);
    
    // 얼굴
    ctx.fillStyle = '#FFDBAC';
    ctx.fillRect(mario.x + 8, mario.y + 8, mario.width - 16, 12);
    
    // 수염
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(mario.x + 12, mario.y + 16, mario.width - 24, 4);
    
    // 버튼
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(mario.x + 8, mario.y + 20, 4, 4);
    ctx.fillRect(mario.x + 20, mario.y + 20, 4, 4);
    
    ctx.restore();
}

// 플랫폼 그리기
function drawPlatforms() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // 플랫폼 테두리
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    ctx.restore();
}

// 코인 그리기
function drawCoins() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    coins_objects.forEach(coin => {
        if (!coin.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // 코인 테두리
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 코인 표시
            ctx.fillStyle = '#FF8C00';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('C', coin.x + 10, coin.y + 15);
        }
    });
    
    ctx.restore();
}

// 적 그리기
function drawEnemies() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    enemies.forEach(enemy => {
        if (enemy.x > -50) { // 화면에 있는 적만 그리기
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 눈
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(enemy.x + 4, enemy.y + 4, 4, 4);
            ctx.fillRect(enemy.x + 16, enemy.y + 4, 4, 4);
            
            // 발
            ctx.fillStyle = '#654321';
            ctx.fillRect(enemy.x, enemy.y + 20, 8, 4);
            ctx.fillRect(enemy.x + 16, enemy.y + 20, 8, 4);
        }
    });
    
    ctx.restore();
}

// 깃발 그리기
function drawFlag() {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // 깃대
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(flag.x, flag.y, 4, flag.height);
    
    // 깃발
    ctx.fillStyle = flag.reached ? '#00FF00' : '#FF0000';
    ctx.fillRect(flag.x + 4, flag.y, 40, 30);
    
    // 깃발 무늬
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(flag.x + 8, flag.y + 4, 8, 8);
    ctx.fillRect(flag.x + 20, flag.y + 4, 8, 8);
    ctx.fillRect(flag.x + 32, flag.y + 4, 8, 8);
    ctx.fillRect(flag.x + 8, flag.y + 16, 8, 8);
    ctx.fillRect(flag.x + 20, flag.y + 16, 8, 8);
    ctx.fillRect(flag.x + 32, flag.y + 16, 8, 8);
    
    ctx.restore();
}

// 배경 그리기
function drawBackground() {
    // 하늘 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름
    ctx.save();
    ctx.translate(-camera.x * 0.5, 0); // 패럴랙스 효과
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
        const x = i * 300 + 100;
        const y = 50 + Math.sin(i) * 20;
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    updateMario();
    updateEnemies();
    updateCoins();
    updateFlag();
    updateCamera();
    
    updateDisplay();
}

// 게임 그리기
function draw() {
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawFlag();
    drawMario();
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 마리오 위치 리셋
function resetMarioPosition() {
    mario.x = 50;
    mario.y = 300;
    mario.velocityX = 0;
    mario.velocityY = 0;
    mario.onGround = false;
}

// 다음 레벨
function nextLevel() {
    initLevel();
    resetMarioPosition();
    
    // 적과 코인 추가
    if (level > 1) {
        for (let i = 0; i < level; i++) {
            enemies.push({
                x: 200 + i * 300,
                y: 340,
                width: 24,
                height: 24,
                velocityX: Math.random() > 0.5 ? 1 : -1,
                direction: Math.random() > 0.5 ? 1 : -1
            });
            
            coins_objects.push({
                x: 150 + i * 250,
                y: 200 + Math.random() * 100,
                collected: false
            });
        }
    }
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCoins').textContent = coins;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').style.display = 'block';
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coins;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
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
    coins = 0;
    lives = 3;
    level = 1;
    
    initLevel();
    resetMarioPosition();
    
    document.getElementById('gameOver').style.display = 'none';
    updateDisplay();
    draw(); // 초기 화면 그리기
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 모바일 버튼 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true, { passive: true });
        leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false, { passive: true });
        leftBtn.addEventListener('mousedown', () => keys['ArrowLeft'] = true);
        leftBtn.addEventListener('mouseup', () => keys['ArrowLeft'] = false);
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true, { passive: true });
        rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false, { passive: true });
        rightBtn.addEventListener('mousedown', () => keys['ArrowRight'] = true);
        rightBtn.addEventListener('mouseup', () => keys['ArrowRight'] = false);
    }
    
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', () => keys['Space'] = true, { passive: true });
        jumpBtn.addEventListener('touchend', () => keys['Space'] = false, { passive: true });
        jumpBtn.addEventListener('mousedown', () => keys['Space'] = true);
        jumpBtn.addEventListener('mouseup', () => keys['Space'] = false);
    }
    
    // 피드백 목록 초기화
    updateFeedbackList();
});

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// 초기화
resizeCanvas();
initLevel();
updateDisplay();
draw();