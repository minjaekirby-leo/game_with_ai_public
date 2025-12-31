// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 변수들
let score = 0;
let caught = 0;
let missed = 0;

// 바구니 설정
const basket = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 60,
    width: 80,
    height: 40,
    speed: 8
};

// 떨어지는 물체들 배열
let fallingItems = [];

// 물체 종류
const itemTypes = [
    { emoji: '🍎', color: '#ff4444', points: 10, size: 25 },
    { emoji: '💎', color: '#4444ff', points: 20, size: 20 },
    { emoji: '💣', color: '#333333', points: -5, size: 30 }
];

// 마우스 위치
let mouseX = canvas.width / 2;

// 마우스 이벤트
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
});

// 새로운 물체 생성
function createFallingItem() {
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    const item = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        speed: Math.random() * 3 + 2,
        type: type,
        size: type.size
    };
    fallingItems.push(item);
}

// 바구니 그리기
function drawBasket() {
    // 바구니 위치를 마우스에 따라 조정
    basket.x = mouseX - basket.width / 2;
    
    // 화면 경계 체크
    if (basket.x < 0) basket.x = 0;
    if (basket.x > canvas.width - basket.width) {
        basket.x = canvas.width - basket.width;
    }
    
    // 바구니 그리기
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    
    // 바구니 테두리
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    ctx.strokeRect(basket.x, basket.y, basket.width, basket.height);
    
    // 바구니 손잡이
    ctx.fillStyle = '#654321';
    ctx.fillRect(basket.x - 5, basket.y + 10, 5, 20);
    ctx.fillRect(basket.x + basket.width, basket.y + 10, 5, 20);
}

// 떨어지는 물체 그리기
function drawFallingItems() {
    for (let i = fallingItems.length - 1; i >= 0; i--) {
        const item = fallingItems[i];
        
        // 물체 이동
        item.y += item.speed;
        
        // 물체 그리기
        ctx.font = item.size + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.type.emoji, item.x, item.y);
        
        // 바구니와 충돌 검사
        if (item.y + item.size > basket.y &&
            item.y < basket.y + basket.height &&
            item.x > basket.x &&
            item.x < basket.x + basket.width) {
            
            // 점수 업데이트
            score += item.type.points;
            caught++;
            updateStats();
            
            // 물체 제거
            fallingItems.splice(i, 1);
            
            // 효과음 대신 화면 깜빡임
            if (item.type.points > 0) {
                canvas.style.filter = 'brightness(1.3)';
                setTimeout(() => canvas.style.filter = 'brightness(1)', 100);
            }
        }
        // 화면 아래로 떨어진 경우
        else if (item.y > canvas.height) {
            if (item.type.points > 0) { // 좋은 아이템만 놓친 것으로 카운트
                missed++;
                updateStats();
            }
            fallingItems.splice(i, 1);
        }
    }
}

// 배경 그리기
function drawBackground() {
    // 하늘 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름 그리기
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100, 80, 60);
    drawCloud(300, 60, 80);
    drawCloud(500, 100, 70);
}

// 구름 그리기 함수
function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x - size * 0.3, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
}

// 통계 업데이트
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('caught').textContent = caught;
    document.getElementById('missed').textContent = missed;
}

// 게임 루프
function gameLoop() {
    // 배경 그리기
    drawBackground();
    
    // 바구니 그리기
    drawBasket();
    
    // 떨어지는 물체들 그리기
    drawFallingItems();
    
    // 새로운 물체 생성 (랜덤)
    if (Math.random() < 0.02) {
        createFallingItem();
    }
    
    requestAnimationFrame(gameLoop);
}

// 게임 시작
updateStats();
gameLoop();