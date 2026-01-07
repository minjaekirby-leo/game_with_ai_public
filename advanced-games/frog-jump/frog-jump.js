// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 모바일 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 캔버스 크기 조정
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(800, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight * 0.6);
    
    // 비율 유지하면서 크기 조정
    const aspectRatio = 800 / 600;
    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;
    
    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
    }
    
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // 실제 캔버스 크기는 고정 (렌더링 품질 유지)
    canvas.width = 800;
    canvas.height = 600;
}

// 터치 관련 변수
let touchStartTime = 0;
let touchIndicator = document.getElementById('touchIndicator');
let isCharging = false;

// 게임 상태
let gameRunning = false;
let distance = 0;
let score = 0;
let bestScore = localStorage.getItem('frogBestScore') || 0;
let cameraX = 0;

// 개구리 설정
const frog = {
    x: 100,
    y: 400,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    charging: false,
    power: 0,
    maxPower: 100,
    angle: 45, // 점프 각도
    trail: []
};

// 물리 설정
const gravity = 0.5;
const waterLevel = 500;
const maxJumpPower = 15;

// 게임 객체들
let lilyPads = [];
let particles = [];
let ripples = [];

// 키보드 입력
const keys = {};

// 연꽃잎 클래스
class LilyPad {
    constructor(x, y, size = 60) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 0.02;
        this.originalY = y;
    }
    
    update() {
        // 물 위에서 살짝 흔들리는 효과
        this.y = this.originalY + Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * 2;
    }
    
    draw() {
        const screenX = this.x - cameraX;
        
        // 화면에 보이는 것만 그리기
        if (screenX < -100 || screenX > canvas.width + 100) return;
        
        ctx.save();
        ctx.translate(screenX, this.y);
        
        // 연꽃잎 그리기
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 연꽃잎 디테일
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.8, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 연꽃잎 선
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.8);
        ctx.lineTo(0, this.size * 0.8);
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        
        // 연꽃 (가끔)
        if (Math.random() < 0.3) {
            ctx.fillStyle = '#FFB6C1';
            for (let i = 0; i < 6; i++) {
                ctx.save();
                ctx.rotate((i * Math.PI) / 3);
                ctx.beginPath();
                ctx.ellipse(0, -8, 4, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            
            // 꽃 중심
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    checkCollision(frogX, frogY, frogWidth, frogHeight) {
        const dx = frogX + frogWidth/2 - this.x;
        const dy = frogY + frogHeight/2 - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size * 0.8;
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 8;
        this.dy = (Math.random() - 0.5) * 8 - 3;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 4 + 2;
        this.type = type;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += 0.2; // 중력
        this.life--;
        
        if (this.type === 'splash') {
            this.dx *= 0.98;
            this.dy *= 0.98;
        }
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        const screenX = this.x - cameraX;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (this.type === 'splash') {
            ctx.beginPath();
            ctx.arc(screenX, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(screenX, this.y, this.size, this.size);
        }
        
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// 물결 클래스
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 50;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.radius += 2;
        this.life--;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        const screenX = this.x - cameraX;
        
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0 || this.radius > this.maxRadius;
    }
}

// 연꽃잎 생성
function generateLilyPads() {
    lilyPads = [];
    
    // 시작 연꽃잎
    lilyPads.push(new LilyPad(100, 450, 80));
    
    let lastX = 200;
    for (let i = 0; i < 50; i++) {
        const gap = Math.random() * 150 + 100; // 100-250 픽셀 간격
        const x = lastX + gap;
        const y = Math.random() * 100 + 400; // 400-500 높이
        const size = Math.random() * 30 + 50; // 50-80 크기
        
        lilyPads.push(new LilyPad(x, y, size));
        lastX = x;
    }
}

// 배경 그리기
function drawBackground() {
    // 하늘 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#98FB98');
    gradient.addColorStop(1, '#4169E1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름
    drawClouds();
    
    // 물
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(0, waterLevel, canvas.width, canvas.height - waterLevel);
    
    // 물 표면 반짝임
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        const x = (i * 100 + Date.now() * 0.1) % (canvas.width + 200) - 100;
        const y = waterLevel + Math.sin(Date.now() * 0.005 + i) * 5;
        ctx.fillRect(x, y, 30, 2);
    }
}

// 구름 그리기
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    const cloudPositions = [
        { x: 100 - cameraX * 0.3, y: 80 },
        { x: 300 - cameraX * 0.2, y: 120 },
        { x: 600 - cameraX * 0.4, y: 60 },
        { x: 900 - cameraX * 0.1, y: 100 }
    ];
    
    cloudPositions.forEach(cloud => {
        if (cloud.x > -150 && cloud.x < canvas.width + 150) {
            drawCloud(cloud.x, cloud.y, 60);
        }
    });
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

// 개구리 그리기
function drawFrog() {
    const screenX = frog.x - cameraX;
    
    // 궤적 그리기
    if (frog.trail.length > 1) {
        ctx.strokeStyle = 'rgba(34, 139, 34, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < frog.trail.length; i++) {
            const point = frog.trail[i];
            const trailScreenX = point.x - cameraX;
            if (i === 0) {
                ctx.moveTo(trailScreenX, point.y);
            } else {
                ctx.lineTo(trailScreenX, point.y);
            }
        }
        ctx.stroke();
    }
    
    ctx.save();
    ctx.translate(screenX + frog.width/2, frog.y + frog.height/2);
    
    // 점프 중일 때 회전
    if (!frog.onGround) {
        const rotation = Math.atan2(frog.velocityY, frog.velocityX);
        ctx.rotate(rotation);
    }
    
    // 개구리 몸체
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(0, 0, frog.width/2, frog.height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 개구리 배
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.ellipse(0, 5, frog.width/3, frog.height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 개구리 눈
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, -10, 6, 0, Math.PI * 2);
    ctx.arc(8, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-8, -10, 3, 0, Math.PI * 2);
    ctx.arc(8, -10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 개구리 입
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();
    
    // 파워 충전 중일 때 표시
    if (frog.charging) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const angle = (frog.angle * Math.PI) / 180;
        const length = (frog.power / frog.maxPower) * 100;
        ctx.moveTo(screenX + frog.width/2, frog.y + frog.height/2);
        ctx.lineTo(
            screenX + frog.width/2 + Math.cos(angle) * length,
            frog.y + frog.height/2 - Math.sin(angle) * length
        );
        ctx.stroke();
    }
}

// 파워 게이지 업데이트
function updatePowerGauge() {
    const powerFill = document.getElementById('powerFill');
    const percentage = (frog.power / frog.maxPower) * 100;
    powerFill.style.height = percentage + '%';
}

// 개구리 업데이트
function updateFrog() {
    // 궤적 업데이트
    frog.trail.push({ x: frog.x + frog.width/2, y: frog.y + frog.height/2 });
    if (frog.trail.length > 20) {
        frog.trail.shift();
    }
    
    // 물리 적용
    if (!frog.onGround) {
        frog.velocityY += gravity;
        frog.x += frog.velocityX;
        frog.y += frog.velocityY;
        
        // 공기 저항
        frog.velocityX *= 0.995;
    }
    
    // 연꽃잎과 충돌 검사
    frog.onGround = false;
    for (let pad of lilyPads) {
        if (pad.checkCollision(frog.x, frog.y, frog.width, frog.height)) {
            if (frog.velocityY > 0 && frog.y < pad.y) {
                frog.y = pad.y - frog.height;
                frog.velocityY = 0;
                frog.velocityX *= 0.8; // 착지 시 감속
                frog.onGround = true;
                
                // 착지 파티클
                createLandingParticles(frog.x + frog.width/2, frog.y + frog.height);
                
                // 점수 계산
                const distanceTraveled = Math.max(0, frog.x - 100);
                distance = Math.floor(distanceTraveled / 10);
                score = distance * 10;
                
                // 햅틱 피드백 (모바일)
                if (isMobile && navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                break;
            }
        }
    }
    
    // 물에 빠졌는지 확인
    if (frog.y > waterLevel) {
        gameOver();
    }
    
    // 카메라 따라가기
    const targetCameraX = frog.x - canvas.width / 3;
    cameraX += (targetCameraX - cameraX) * 0.1;
}

// 착지 파티클 생성
function createLandingParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push(new Particle(x, y, '#228B22'));
    }
}

// 물 튀김 파티클 생성
function createSplashParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, '#4169E1', 'splash'));
    }
    ripples.push(new Ripple(x, y));
}

// 점프 실행
function jump() {
    if (frog.onGround && frog.power > 0) {
        const angle = (frog.angle * Math.PI) / 180;
        const jumpForce = (frog.power / frog.maxPower) * maxJumpPower;
        
        frog.velocityX = Math.cos(angle) * jumpForce;
        frog.velocityY = -Math.sin(angle) * jumpForce;
        frog.onGround = false;
        frog.power = 0;
        frog.charging = false;
        isCharging = false;
        
        // 점프 파티클
        createLandingParticles(frog.x + frog.width/2, frog.y + frog.height);
        
        // 햅틱 피드백 (모바일)
        if (isMobile && navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // 터치 인디케이터 숨기기
        hideTouchIndicator();
    }
}

// 게임 업데이트
function update() {
    if (!gameRunning) return;
    
    // 파워 충전 (키보드 또는 터치)
    if ((keys.Space || isCharging) && frog.onGround) {
        frog.charging = true;
        frog.power = Math.min(frog.power + 2, frog.maxPower);
    }
    
    updateFrog();
    
    // 연꽃잎 업데이트
    lilyPads.forEach(pad => pad.update());
    
    // 파티클 업데이트
    particles.forEach(particle => particle.update());
    particles = particles.filter(particle => !particle.isDead());
    
    // 물결 업데이트
    ripples.forEach(ripple => ripple.update());
    ripples = ripples.filter(ripple => !ripple.isDead());
    
    updateDisplay();
    updatePowerGauge();
}

// 게임 그리기
function draw() {
    drawBackground();
    
    // 연꽃잎 그리기
    lilyPads.forEach(pad => pad.draw());
    
    // 파티클 그리기
    particles.forEach(particle => particle.draw());
    
    // 물결 그리기
    ripples.forEach(ripple => ripple.draw());
    
    // 개구리 그리기
    drawFrog();
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    isCharging = false;
    
    // 물 튀김 효과
    createSplashParticles(frog.x + frog.width/2, waterLevel);
    
    // 최고 기록 업데이트
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('frogBestScore', bestScore);
    }
    
    // 햅틱 피드백 (모바일)
    if (isMobile && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
    
    document.getElementById('finalDistance').textContent = distance;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    
    hideTouchIndicator();
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('distance').textContent = distance;
    document.getElementById('score').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
}

// 게임 제어 함수들
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
}

function resetGame() {
    gameRunning = false;
    isCharging = false;
    
    // 개구리 초기화
    frog.x = 100;
    frog.y = 400;
    frog.velocityX = 0;
    frog.velocityY = 0;
    frog.onGround = true;
    frog.charging = false;
    frog.power = 0;
    frog.trail = [];
    
    // 게임 상태 초기화
    distance = 0;
    score = 0;
    cameraX = 0;
    
    // 객체들 초기화
    particles = [];
    ripples = [];
    
    // 연꽃잎 재생성
    generateLilyPads();
    
    document.getElementById('gameOver').style.display = 'none';
    updateDisplay();
    updatePowerGauge();
    hideTouchIndicator();
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    if (e.code === 'Space' && frog.charging) {
        jump();
    }
});

// 터치 인디케이터 함수들
function showTouchIndicator(x, y) {
    const rect = canvas.getBoundingClientRect();
    const power = Math.min(frog.power / frog.maxPower, 1);
    const size = 50 + power * 50;
    
    touchIndicator.style.display = 'block';
    touchIndicator.style.left = (rect.left + x - size/2) + 'px';
    touchIndicator.style.top = (rect.top + y - size/2) + 'px';
    touchIndicator.style.width = size + 'px';
    touchIndicator.style.height = size + 'px';
    touchIndicator.style.borderColor = `hsl(${120 * power}, 100%, 50%)`;
}

function hideTouchIndicator() {
    touchIndicator.style.display = 'none';
}

// 터치 이벤트
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning || !frog.onGround) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isCharging = true;
    touchStartTime = Date.now();
    showTouchIndicator(x, y);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isCharging) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    showTouchIndicator(x, y);
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isCharging && frog.charging) {
        jump();
    }
    isCharging = false;
}, { passive: false });

// 마우스 이벤트 (PC에서도 클릭으로 조작 가능)
canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning || !frog.onGround) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    isCharging = true;
    showTouchIndicator(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isCharging) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    showTouchIndicator(x, y);
});

canvas.addEventListener('mouseup', (e) => {
    if (isCharging && frog.charging) {
        jump();
    }
    isCharging = false;
});

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// 초기화
resizeCanvas();
generateLilyPads();
updateDisplay();
document.getElementById('bestScore').textContent = bestScore;