// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;
let invulnerable = false;
let invulnerableTime = 0;

// 플레이어 우주선 클래스
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.trail = [];
    }
    
    update() {
        // 키보드 입력 처리
        if (keys.ArrowLeft || keys.KeyA) this.x -= this.speed;
        if (keys.ArrowRight || keys.KeyD) this.x += this.speed;
        if (keys.ArrowUp || keys.KeyW) this.y -= this.speed;
        if (keys.ArrowDown || keys.KeyS) this.y += this.speed;
        
        // 화면 경계 체크
        this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
        this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));
        
        // 궤적 업데이트
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) {
            this.trail.shift();
        }
    }
    
    draw() {
        // 궤적 그리기
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            ctx.globalAlpha = alpha * 0.3;
            ctx.fillStyle = invulnerable ? '#00ffff' : '#ffffff';
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, 5 * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        
        // 무적 상태일 때 깜빡임
        if (invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // 우주선 그리기
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 우주선 몸체
        ctx.fillStyle = invulnerable ? '#00ffff' : '#00ff00';
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-this.width/3, this.height/2);
        ctx.lineTo(this.width/3, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // 우주선 엔진 불꽃
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(-this.width/4, this.height/2);
        ctx.lineTo(0, this.height/2 + 15);
        ctx.lineTo(this.width/4, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // 우주선 창문
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// 별 클래스
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 15 + 10;
        this.speed = Math.random() * 3 + 2;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.2 + 0.1;
        this.sparkles = [];
    }
    
    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        
        // 반짝임 효과
        if (Math.random() < 0.3) {
            this.sparkles.push({
                x: this.x + (Math.random() - 0.5) * this.size,
                y: this.y + (Math.random() - 0.5) * this.size,
                life: 20
            });
        }
        
        // 반짝임 업데이트
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            this.sparkles[i].life--;
            if (this.sparkles[i].life <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
    }
    
    draw() {
        // 반짝임 그리기
        for (let sparkle of this.sparkles) {
            const alpha = sparkle.life / 20;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(sparkle.x, sparkle.y, 2, 2);
        }
        
        ctx.globalAlpha = 1;
        
        // 별 그리기
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            const innerAngle = ((i + 0.5) * Math.PI * 2) / 5;
            const innerX = Math.cos(innerAngle) * this.size * 0.5;
            const innerY = Math.sin(innerAngle) * this.size * 0.5;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 운석 클래스
class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -30;
        this.size = Math.random() * 20 + 15;
        this.speed = Math.random() * 4 + 3;
        this.rotation = 0;
        this.rotationSpeed = Math.random() * 0.3 + 0.1;
        this.vertices = [];
        
        // 불규칙한 모양 생성
        for (let i = 0; i < 8; i++) {
            this.vertices.push({
                angle: (i / 8) * Math.PI * 2,
                radius: this.size * (0.7 + Math.random() * 0.6)
            });
        }
    }
    
    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 운석 그리기
        ctx.fillStyle = '#ff4444';
        ctx.strokeStyle = '#aa0000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < this.vertices.length; i++) {
            const vertex = this.vertices[i];
            const x = Math.cos(vertex.angle) * vertex.radius;
            const y = Math.sin(vertex.angle) * vertex.radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 운석 표면 디테일
        ctx.fillStyle = '#aa0000';
        for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * this.size;
            const y = (Math.random() - 0.5) * this.size;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 파워업 클래스
class PowerUp {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = 20;
        this.speed = Math.random() * 2 + 1;
        this.pulse = 0;
    }
    
    update() {
        this.y += this.speed;
        this.pulse += 0.2;
    }
    
    draw() {
        const pulseSize = this.size + Math.sin(this.pulse) * 5;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 외부 링
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // 내부 코어
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 십자가 모양
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-pulseSize * 0.3, 0);
        ctx.lineTo(pulseSize * 0.3, 0);
        ctx.moveTo(0, -pulseSize * 0.3);
        ctx.lineTo(0, pulseSize * 0.3);
        ctx.stroke();
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 게임 객체들
const player = new Player();
let stars = [];
let asteroids = [];
let powerUps = [];
let particles = [];

// 키보드 입력 상태
const keys = {};

// 파티클 생성
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            color: color,
            life: 30,
            maxLife: 30,
            size: Math.random() * 5 + 2
        });
    }
}

// 충돌 감지
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size || obj1.width/2) + (obj2.size || obj2.width/2);
}

// 별 배경 그리기
function drawStarBackground() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 73.3 + Date.now() * 0.01) % canvas.height;
        const size = Math.sin(i + Date.now() * 0.001) * 0.5 + 1;
        ctx.globalAlpha = Math.sin(i + Date.now() * 0.002) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
}

// 파티클 업데이트 및 그리기
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;
        
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    ctx.globalAlpha = 1;
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    // 무적 시간 감소
    if (invulnerable) {
        invulnerableTime--;
        if (invulnerableTime <= 0) {
            invulnerable = false;
        }
    }
    
    // 플레이어 업데이트
    player.update();
    
    // 별 생성
    if (Math.random() < 0.02 + level * 0.005) {
        stars.push(new Star());
    }
    
    // 운석 생성
    if (Math.random() < 0.015 + level * 0.003) {
        asteroids.push(new Asteroid());
    }
    
    // 파워업 생성
    if (Math.random() < 0.005) {
        powerUps.push(new PowerUp());
    }
    
    // 별 업데이트
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].update();
        
        // 플레이어와 충돌 검사
        if (checkCollision(player, stars[i])) {
            score += 10;
            createParticles(stars[i].x, stars[i].y, '#ffff00');
            stars.splice(i, 1);
            updateStats();
            continue;
        }
        
        // 화면 밖으로 나간 별 제거
        if (stars[i].isOffScreen()) {
            stars.splice(i, 1);
        }
    }
    
    // 운석 업데이트
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].update();
        
        // 플레이어와 충돌 검사 (무적이 아닐 때만)
        if (!invulnerable && checkCollision(player, asteroids[i])) {
            lives--;
            invulnerable = true;
            invulnerableTime = 120; // 2초간 무적
            createParticles(asteroids[i].x, asteroids[i].y, '#ff4444');
            asteroids.splice(i, 1);
            updateStats();
            
            if (lives <= 0) {
                gameOver();
            }
            continue;
        }
        
        // 화면 밖으로 나간 운석 제거
        if (asteroids[i].isOffScreen()) {
            asteroids.splice(i, 1);
        }
    }
    
    // 파워업 업데이트
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].update();
        
        // 플레이어와 충돌 검사
        if (checkCollision(player, powerUps[i])) {
            invulnerable = true;
            invulnerableTime = 300; // 5초간 무적
            createParticles(powerUps[i].x, powerUps[i].y, '#00ffff');
            powerUps.splice(i, 1);
            continue;
        }
        
        // 화면 밖으로 나간 파워업 제거
        if (powerUps[i].isOffScreen()) {
            powerUps.splice(i, 1);
        }
    }
    
    // 레벨업 체크
    if (score > level * 100) {
        level++;
        updateStats();
    }
}

// 게임 그리기
function draw() {
    // 배경 그리기
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 별 배경
    drawStarBackground();
    
    // 게임 객체들 그리기
    stars.forEach(star => star.draw());
    asteroids.forEach(asteroid => asteroid.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    player.draw();
    
    // 파티클 그리기
    updateParticles();
    
    // 무적 상태 표시
    if (invulnerable) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = '20px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText('무적 상태!', canvas.width/2, 50);
    }
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
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = '48px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('게임 오버!', canvas.width/2, canvas.height/2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Comic Sans MS';
    ctx.fillText('최종 점수: ' + score, canvas.width/2, canvas.height/2);
    ctx.fillText('도달 레벨: ' + level, canvas.width/2, canvas.height/2 + 40);
}

// 통계 업데이트
function updateStats() {
    document.getElementById('score').textContent = score;
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
    lives = 3;
    level = 1;
    invulnerable = false;
    invulnerableTime = 0;
    
    stars = [];
    asteroids = [];
    powerUps = [];
    particles = [];
    
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;
    player.trail = [];
    
    updateStats();
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 초기화
updateStats();