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

// 모바일 컨트롤 변수
let mobileControls = {
    left: false,
    right: false,
    jump: false,
    trick: false
};

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let distance = 0;
let bestScore = localStorage.getItem('surfBestScore') || 0;
let combo = 1;
let gameSpeed = 2;

// 서퍼 설정
const surfer = {
    x: 200,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    onWave: false,
    inAir: false,
    rotation: 0,
    trickActive: false,
    trickType: '',
    trickTime: 0
};

// 물리 설정
const gravity = 0.4;
const waveHeight = 100;
const baseWaterLevel = 450;

// 게임 객체들
let waves = [];
let obstacles = [];
let powerUps = [];
let particles = [];
let splashes = [];

// 날씨 시스템
let weather = {
    type: 'sunny', // sunny, cloudy, stormy
    intensity: 1,
    changeTimer: 0
};

// 키보드 입력
const keys = {};

// 파도 클래스
class Wave {
    constructor(x) {
        this.x = x;
        this.amplitude = Math.random() * 50 + 50;
        this.frequency = Math.random() * 0.02 + 0.01;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = gameSpeed;
    }
    
    update() {
        this.x -= this.speed;
        this.phase += 0.05;
    }
    
    getHeightAt(x) {
        const relativeX = x - this.x;
        return baseWaterLevel - Math.sin(relativeX * this.frequency + this.phase) * this.amplitude;
    }
    
    draw() {
        if (this.x < -200 || this.x > canvas.width + 200) return;
        
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = Math.max(0, this.x - 100); x < Math.min(canvas.width, this.x + 300); x += 5) {
            const y = this.getHeightAt(x);
            if (x === Math.max(0, this.x - 100)) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // 파도 거품
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let x = this.x; x < this.x + 200; x += 20) {
            if (x >= 0 && x <= canvas.width) {
                const y = this.getHeightAt(x);
                const bubbleSize = Math.sin(this.phase + x * 0.1) * 3 + 5;
                ctx.beginPath();
                ctx.arc(x, y - 5, bubbleSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    isOffScreen() {
        return this.x < -300;
    }
}

// 장애물 클래스
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type; // rock, seagull, shark
        this.speed = gameSpeed;
        this.animationFrame = 0;
    }
    
    update() {
        this.x -= this.speed;
        this.animationFrame += 0.2;
        
        if (this.type === 'seagull') {
            this.y += Math.sin(this.animationFrame) * 2;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        if (this.type === 'rock') {
            // 바위
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#808080';
            ctx.beginPath();
            ctx.ellipse(-5, -5, this.width/4, this.height/4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'seagull') {
            // 갈매기
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🐦', 0, 10);
        } else if (this.type === 'shark') {
            // 상어
            ctx.fillStyle = '#708090';
            ctx.font = '35px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🦈', 0, 10);
        }
        
        ctx.restore();
    }
    
    checkCollision(surferX, surferY, surferWidth, surferHeight) {
        return surferX < this.x + this.width &&
               surferX + surferWidth > this.x &&
               surferY < this.y + this.height &&
               surferY + surferHeight > this.y;
    }
    
    isOffScreen() {
        return this.x < -100;
    }
}

// 파워업 클래스
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // speed, score, trick
        this.speed = gameSpeed;
        this.pulse = 0;
    }
    
    update() {
        this.x -= this.speed;
        this.pulse += 0.2;
    }
    
    draw() {
        const pulseSize = Math.sin(this.pulse) * 5 + this.width;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // 외부 링
        ctx.strokeStyle = this.getColor();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize/2, 0, Math.PI * 2);
        ctx.stroke();
        
        // 아이콘
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.getColor();
        
        if (this.type === 'speed') {
            ctx.fillText('⚡', 0, 7);
        } else if (this.type === 'score') {
            ctx.fillText('⭐', 0, 7);
        } else if (this.type === 'trick') {
            ctx.fillText('🎯', 0, 7);
        }
        
        ctx.restore();
    }
    
    getColor() {
        const colors = {
            speed: '#ffff00',
            score: '#ff6b6b',
            trick: '#4ecdc4'
        };
        return colors[this.type] || '#ffffff';
    }
    
    checkCollision(surferX, surferY, surferWidth, surferHeight) {
        return surferX < this.x + this.width &&
               surferX + surferWidth > this.x &&
               surferY < this.y + this.height &&
               surferY + surferHeight > this.y;
    }
    
    isOffScreen() {
        return this.x < -100;
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
        this.dy += 0.2;
        this.life--;
        
        if (this.type === 'water') {
            this.dx *= 0.98;
        }
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        
        if (this.type === 'water') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
        
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// 물 튀김 클래스
class Splash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, '#4169E1', 'water'));
        }
    }
    
    update() {
        this.particles.forEach(particle => particle.update());
        this.particles = this.particles.filter(particle => !particle.isDead());
    }
    
    draw() {
        this.particles.forEach(particle => particle.draw());
    }
    
    isDead() {
        return this.particles.length === 0;
    }
}

// 배경 그리기
function drawBackground() {
    // 하늘 그라데이션 (날씨에 따라 변화)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    if (weather.type === 'sunny') {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4169E1');
    } else if (weather.type === 'cloudy') {
        gradient.addColorStop(0, '#708090');
        gradient.addColorStop(1, '#4682B4');
    } else if (weather.type === 'stormy') {
        gradient.addColorStop(0, '#2F4F4F');
        gradient.addColorStop(1, '#191970');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 구름
    if (weather.type !== 'sunny') {
        drawClouds();
    }
    
    // 태양
    if (weather.type === 'sunny') {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width - 100, 80, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // 태양 광선
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(
                canvas.width - 100 + Math.cos(angle) * 50,
                80 + Math.sin(angle) * 50
            );
            ctx.lineTo(
                canvas.width - 100 + Math.cos(angle) * 70,
                80 + Math.sin(angle) * 70
            );
            ctx.stroke();
        }
    }
    
    // 비 (폭풍일 때)
    if (weather.type === 'stormy') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = (Math.random() * canvas.height + Date.now() * 0.5) % canvas.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 5, y + 20);
            ctx.stroke();
        }
    }
}

// 구름 그리기
function drawClouds() {
    ctx.fillStyle = weather.type === 'stormy' ? 
        'rgba(105, 105, 105, 0.8)' : 'rgba(255, 255, 255, 0.7)';
    
    const cloudPositions = [
        { x: 100, y: 80 },
        { x: 300, y: 60 },
        { x: 500, y: 100 },
        { x: 700, y: 70 }
    ];
    
    cloudPositions.forEach(cloud => {
        drawCloud(cloud.x, cloud.y, 50);
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

// 물 그리기
function drawWater() {
    // 기본 물 표면
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(0, baseWaterLevel, canvas.width, canvas.height - baseWaterLevel);
    
    // 파도들 그리기
    waves.forEach(wave => wave.draw());
    
    // 물 반짝임
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 10; i++) {
        const x = (i * 80 + Date.now() * 0.1) % canvas.width;
        const y = baseWaterLevel + Math.sin(Date.now() * 0.005 + i) * 10;
        ctx.fillRect(x, y, 20, 2);
    }
}

// 서퍼 그리기
function drawSurfer() {
    ctx.save();
    ctx.translate(surfer.x + surfer.width/2, surfer.y + surfer.height/2);
    ctx.rotate(surfer.rotation);
    
    // 서핑보드
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-surfer.width/2, surfer.height/4, surfer.width, 8);
    
    // 서퍼 몸체
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(-surfer.width/4, -surfer.height/2, surfer.width/2, surfer.height/2);
    
    // 서퍼 머리
    ctx.fillStyle = '#FFDBAC';
    ctx.beginPath();
    ctx.arc(0, -surfer.height/2 - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 서퍼 팔
    ctx.strokeStyle = '#FFDBAC';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-surfer.width/4, -surfer.height/4);
    ctx.lineTo(-surfer.width/2 - 10, -surfer.height/4 + 10);
    ctx.moveTo(surfer.width/4, -surfer.height/4);
    ctx.lineTo(surfer.width/2 + 10, -surfer.height/4 + 10);
    ctx.stroke();
    
    ctx.restore();
    
    // 트릭 표시
    if (surfer.trickActive) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '20px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText(surfer.trickType, surfer.x + surfer.width/2, surfer.y - 20);
    }
}

// 파도 생성
function generateWaves() {
    if (Math.random() < 0.02) {
        waves.push(new Wave(canvas.width + 100));
    }
}

// 장애물 생성
function generateObstacles() {
    if (Math.random() < 0.01 + distance * 0.00001) {
        const types = ['rock', 'seagull', 'shark'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = canvas.width + 50;
        let y;
        
        if (type === 'seagull') {
            y = Math.random() * 200 + 100;
        } else if (type === 'shark') {
            y = baseWaterLevel + 20;
        } else {
            y = baseWaterLevel - 30;
        }
        
        obstacles.push(new Obstacle(x, y, type));
    }
}

// 파워업 생성
function generatePowerUps() {
    if (Math.random() < 0.005) {
        const types = ['speed', 'score', 'trick'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = canvas.width + 50;
        const y = Math.random() * 200 + 200;
        
        powerUps.push(new PowerUp(x, y, type));
    }
}

// 서퍼 업데이트
function updateSurfer() {
    // 키보드 입력 처리
    if ((keys.ArrowLeft || mobileControls.left) && surfer.x > 0) {
        surfer.x -= surfer.speed;
    }
    if ((keys.ArrowRight || mobileControls.right) && surfer.x < canvas.width - surfer.width) {
        surfer.x += surfer.speed;
    }
    if ((keys.ArrowUp || mobileControls.jump) && surfer.onWave) {
        surfer.velocityY = -12;
        surfer.inAir = true;
        surfer.onWave = false;
        createSplash(surfer.x + surfer.width/2, surfer.y + surfer.height);
        mobileControls.jump = false; // 점프 후 리셋
    }
    
    // 트릭 처리
    if ((keys.Space || mobileControls.trick) && surfer.inAir && !surfer.trickActive) {
        performTrick();
        mobileControls.trick = false; // 트릭 후 리셋
    }
    
    // 물리 적용
    if (surfer.inAir) {
        surfer.velocityY += gravity;
        surfer.y += surfer.velocityY;
        surfer.rotation += 0.1;
    } else {
        surfer.rotation = 0;
    }
    
    // 파도와 충돌 검사
    surfer.onWave = false;
    for (let wave of waves) {
        const waveHeight = wave.getHeightAt(surfer.x + surfer.width/2);
        if (surfer.y + surfer.height >= waveHeight && surfer.velocityY >= 0) {
            surfer.y = waveHeight - surfer.height;
            surfer.velocityY = 0;
            surfer.onWave = true;
            surfer.inAir = false;
            break;
        }
    }
    
    // 물에 빠졌는지 확인
    if (surfer.y > baseWaterLevel) {
        surfer.y = baseWaterLevel - surfer.height;
        surfer.velocityY = 0;
        surfer.onWave = true;
        surfer.inAir = false;
    }
    
    // 트릭 시간 감소
    if (surfer.trickActive) {
        surfer.trickTime--;
        if (surfer.trickTime <= 0) {
            surfer.trickActive = false;
        }
    }
}

// 트릭 수행
function performTrick() {
    const tricks = ['360°', 'Flip', 'Spin', 'Twist', 'Air'];
    surfer.trickType = tricks[Math.floor(Math.random() * tricks.length)];
    surfer.trickActive = true;
    surfer.trickTime = 60;
    
    // 트릭 점수
    const trickScore = 50 * combo;
    score += trickScore;
    combo = Math.min(combo + 1, 10);
    
    // 트릭 파티클
    createTrickParticles(surfer.x + surfer.width/2, surfer.y + surfer.height/2);
}

// 물 튀김 생성
function createSplash(x, y) {
    splashes.push(new Splash(x, y));
}

// 트릭 파티클 생성
function createTrickParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x, y, '#FFFF00'));
    }
}

// 날씨 업데이트
function updateWeather() {
    weather.changeTimer++;
    
    if (weather.changeTimer > 1800) { // 30초마다 날씨 변경
        const weathers = ['sunny', 'cloudy', 'stormy'];
        weather.type = weathers[Math.floor(Math.random() * weathers.length)];
        weather.changeTimer = 0;
        
        // 날씨에 따른 게임 속도 조절
        if (weather.type === 'stormy') {
            gameSpeed = 3;
        } else if (weather.type === 'cloudy') {
            gameSpeed = 2.5;
        } else {
            gameSpeed = 2;
        }
    }
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    updateSurfer();
    updateWeather();
    
    // 거리 및 점수 업데이트
    distance += gameSpeed;
    score += Math.floor(gameSpeed);
    
    // 콤보 감소 (시간이 지나면)
    if (Math.random() < 0.01) {
        combo = Math.max(1, combo - 1);
    }
    
    // 객체 생성
    generateWaves();
    generateObstacles();
    generatePowerUps();
    
    // 객체 업데이트
    waves.forEach(wave => wave.update());
    obstacles.forEach(obstacle => obstacle.update());
    powerUps.forEach(powerUp => powerUp.update());
    particles.forEach(particle => particle.update());
    splashes.forEach(splash => splash.update());
    
    // 충돌 검사
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        if (obstacle.checkCollision(surfer.x, surfer.y, surfer.width, surfer.height)) {
            gameOver();
            return;
        }
    }
    
    // 파워업 수집
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (powerUp.checkCollision(surfer.x, surfer.y, surfer.width, surfer.height)) {
            collectPowerUp(powerUp);
            powerUps.splice(i, 1);
        }
    }
    
    // 화면 밖 객체 제거
    waves = waves.filter(wave => !wave.isOffScreen());
    obstacles = obstacles.filter(obstacle => !obstacle.isOffScreen());
    powerUps = powerUps.filter(powerUp => !powerUp.isOffScreen());
    particles = particles.filter(particle => !particle.isDead());
    splashes = splashes.filter(splash => !splash.isDead());
    
    updateDisplay();
}

// 파워업 수집
function collectPowerUp(powerUp) {
    if (powerUp.type === 'speed') {
        surfer.speed = Math.min(surfer.speed + 1, 10);
    } else if (powerUp.type === 'score') {
        score += 100 * combo;
    } else if (powerUp.type === 'trick') {
        combo = Math.min(combo + 2, 10);
    }
    
    // 수집 파티클
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(powerUp.x, powerUp.y, powerUp.getColor()));
    }
}

// 게임 그리기
function draw() {
    drawBackground();
    drawWater();
    
    // 게임 객체들 그리기
    obstacles.forEach(obstacle => obstacle.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    drawSurfer();
    particles.forEach(particle => particle.draw());
    splashes.forEach(splash => splash.draw());
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
    
    // 최고 기록 업데이트
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('surfBestScore', bestScore);
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalDistance').textContent = Math.floor(distance / 10);
    document.getElementById('gameOver').style.display = 'block';
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('distance').textContent = Math.floor(distance / 10);
    document.getElementById('bestScore').textContent = bestScore;
    document.getElementById('speedDisplay').textContent = Math.floor(surfer.speed * 2);
    document.getElementById('comboDisplay').textContent = `콤보: x${combo}`;
    
    // 날씨 표시
    const weatherEmojis = {
        sunny: '☀️ 맑음',
        cloudy: '☁️ 흐림',
        stormy: '⛈️ 폭풍'
    };
    document.getElementById('weatherIndicator').textContent = weatherEmojis[weather.type];
    
    // 트릭 표시
    if (surfer.inAir && !surfer.trickActive) {
        document.getElementById('trickIndicator').textContent = '스페이스로 트릭!';
        document.getElementById('trickIndicator').style.color = '#ffff00';
    } else if (surfer.trickActive) {
        document.getElementById('trickIndicator').textContent = `${surfer.trickType} 성공!`;
        document.getElementById('trickIndicator').style.color = '#00ff00';
    } else {
        document.getElementById('trickIndicator').textContent = '트릭 준비!';
        document.getElementById('trickIndicator').style.color = '#ffffff';
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
    distance = 0;
    combo = 1;
    gameSpeed = 2;
    
    // 서퍼 초기화
    surfer.x = 200;
    surfer.y = 400;
    surfer.velocityX = 0;
    surfer.velocityY = 0;
    surfer.speed = 5;
    surfer.onWave = false;
    surfer.inAir = false;
    surfer.rotation = 0;
    surfer.trickActive = false;
    
    // 날씨 초기화
    weather.type = 'sunny';
    weather.changeTimer = 0;
    
    // 객체들 초기화
    waves = [];
    obstacles = [];
    powerUps = [];
    particles = [];
    splashes = [];
    
    document.getElementById('gameOver').style.display = 'none';
    updateDisplay();
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 모바일 버튼 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    const trickBtn = document.getElementById('trickBtn');
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', () => mobileControls.left = true, { passive: true });
        leftBtn.addEventListener('touchend', () => mobileControls.left = false, { passive: true });
        leftBtn.addEventListener('mousedown', () => mobileControls.left = true);
        leftBtn.addEventListener('mouseup', () => mobileControls.left = false);
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', () => mobileControls.right = true, { passive: true });
        rightBtn.addEventListener('touchend', () => mobileControls.right = false, { passive: true });
        rightBtn.addEventListener('mousedown', () => mobileControls.right = true);
        rightBtn.addEventListener('mouseup', () => mobileControls.right = false);
    }
    
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', () => mobileControls.jump = true, { passive: true });
        jumpBtn.addEventListener('click', () => mobileControls.jump = true);
    }
    
    if (trickBtn) {
        trickBtn.addEventListener('touchstart', () => mobileControls.trick = true, { passive: true });
        trickBtn.addEventListener('click', () => mobileControls.trick = true);
    }
});

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// 초기화
resizeCanvas();
updateDisplay();
document.getElementById('bestScore').textContent = bestScore;