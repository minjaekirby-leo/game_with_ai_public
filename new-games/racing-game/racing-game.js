// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let distance = 0;
let score = 0;
let level = 1;
let gameSpeed = 2;

// 플레이어 자동차
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,
    width: 50,
    height: 80,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.3,
    deceleration: 0.2,
    turnSpeed: 5
};

// 게임 객체들
let otherCars = [];
let obstacles = [];
let roadLines = [];
let particles = [];

// 도로 설정
const roadWidth = 400;
const roadX = (canvas.width - roadWidth) / 2;
const laneWidth = roadWidth / 3;

// 키보드 입력
const keys = {};

// 자동차 클래스
class Car {
    constructor(x, y, color, speed) {
        this.x = x;
        this.y = y;
        this.width = 45;
        this.height = 75;
        this.color = color;
        this.speed = speed;
        this.lane = Math.floor((x - roadX) / laneWidth);
    }
    
    update() {
        this.y += this.speed + gameSpeed;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // 자동차 몸체
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // 자동차 창문
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(-this.width/2 + 5, -this.height/2 + 10, this.width - 10, 20);
        ctx.fillRect(-this.width/2 + 5, -this.height/2 + 35, this.width - 10, 15);
        
        // 자동차 바퀴
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.width/2 - 3, -this.height/2 + 5, 6, 15);
        ctx.fillRect(this.width/2 - 3, -this.height/2 + 5, 6, 15);
        ctx.fillRect(-this.width/2 - 3, this.height/2 - 20, 6, 15);
        ctx.fillRect(this.width/2 - 3, this.height/2 - 20, 6, 15);
        
        // 헤드라이트
        ctx.fillStyle = '#FFFF99';
        ctx.fillRect(-this.width/2 + 8, -this.height/2, 8, 5);
        ctx.fillRect(this.width/2 - 16, -this.height/2, 8, 5);
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 장애물 클래스
class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type;
        this.rotation = 0;
    }
    
    update() {
        this.y += gameSpeed + 1;
        this.rotation += 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        if (this.type === 'cone') {
            // 교통 콘
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.moveTo(0, -this.height/2);
            ctx.lineTo(-this.width/3, this.height/2);
            ctx.lineTo(this.width/3, this.height/2);
            ctx.closePath();
            ctx.fill();
            
            // 흰색 줄무늬
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(-this.width/4, -5, this.width/2, 3);
            ctx.fillRect(-this.width/4, 5, this.width/2, 3);
        } else if (this.type === 'oil') {
            // 오일 웅덩이
            ctx.fillStyle = '#2C3E50';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width/2, this.height/3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 반짝임 효과
            ctx.fillStyle = '#34495E';
            ctx.beginPath();
            ctx.ellipse(-5, -3, 8, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 도로 선 클래스
class RoadLine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 40;
    }
    
    update() {
        this.y += gameSpeed + 2;
    }
    
    draw() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 8;
        this.dy = (Math.random() - 0.5) * 8;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 5 + 2;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life--;
        this.dy += 0.2; // 중력
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// 플레이어 자동차 그리기
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    
    // 자동차 몸체 (플레이어는 빨간색)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // 자동차 창문
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-player.width/2 + 5, -player.height/2 + 10, player.width - 10, 20);
    ctx.fillRect(-player.width/2 + 5, -player.height/2 + 35, player.width - 10, 15);
    
    // 자동차 바퀴
    ctx.fillStyle = '#333';
    ctx.fillRect(-player.width/2 - 3, -player.height/2 + 5, 6, 15);
    ctx.fillRect(player.width/2 - 3, -player.height/2 + 5, 6, 15);
    ctx.fillRect(-player.width/2 - 3, player.height/2 - 20, 6, 15);
    ctx.fillRect(player.width/2 - 3, player.height/2 - 20, 6, 15);
    
    // 헤드라이트
    ctx.fillStyle = '#FFFF99';
    ctx.fillRect(-player.width/2 + 8, -player.height/2, 8, 5);
    ctx.fillRect(player.width/2 - 16, -player.height/2, 8, 5);
    
    // 속도에 따른 엔진 불꽃
    if (player.speed > 3) {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(-8, player.height/2, 4, 10);
        ctx.fillRect(4, player.height/2, 4, 10);
    }
    
    ctx.restore();
}

// 도로 그리기
function drawRoad() {
    // 도로 배경
    ctx.fillStyle = '#555';
    ctx.fillRect(roadX, 0, roadWidth, canvas.height);
    
    // 도로 가장자리
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(roadX - 5, 0, 5, canvas.height);
    ctx.fillRect(roadX + roadWidth, 0, 5, canvas.height);
    
    // 차선
    roadLines.forEach(line => line.draw());
}

// 미니맵 그리기
function drawMinimap() {
    minimapCtx.fillStyle = '#000';
    minimapCtx.fillRect(0, 0, minimap.width, minimap.height);
    
    // 도로
    minimapCtx.fillStyle = '#555';
    minimapCtx.fillRect(20, 0, 80, minimap.height);
    
    // 플레이어 (빨간 점)
    const playerMinimapX = 20 + ((player.x - roadX) / roadWidth) * 80;
    const playerMinimapY = 60;
    minimapCtx.fillStyle = '#FF0000';
    minimapCtx.fillRect(playerMinimapX - 2, playerMinimapY - 2, 4, 4);
    
    // 다른 자동차들 (파란 점)
    minimapCtx.fillStyle = '#0000FF';
    otherCars.forEach(car => {
        if (car.y < canvas.height && car.y > -100) {
            const carMinimapX = 20 + ((car.x - roadX) / roadWidth) * 80;
            const carMinimapY = ((car.y / canvas.height) * minimap.height);
            minimapCtx.fillRect(carMinimapX - 1, carMinimapY - 1, 2, 2);
        }
    });
    
    // 장애물들 (노란 점)
    minimapCtx.fillStyle = '#FFFF00';
    obstacles.forEach(obstacle => {
        if (obstacle.y < canvas.height && obstacle.y > -100) {
            const obstacleMinimapX = 20 + ((obstacle.x - roadX) / roadWidth) * 80;
            const obstacleMinimapY = ((obstacle.y / canvas.height) * minimap.height);
            minimapCtx.fillRect(obstacleMinimapX - 1, obstacleMinimapY - 1, 2, 2);
        }
    });
}

// 충돌 감지
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 파티클 생성
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    // 플레이어 이동
    if (keys.ArrowLeft && player.x > roadX) {
        player.x -= player.turnSpeed;
    }
    if (keys.ArrowRight && player.x < roadX + roadWidth - player.width) {
        player.x += player.turnSpeed;
    }
    if (keys.ArrowUp && player.speed < player.maxSpeed) {
        player.speed += player.acceleration;
    }
    if (keys.ArrowDown && player.speed > -player.maxSpeed/2) {
        player.speed -= player.acceleration;
    }
    
    // 자연 감속
    if (!keys.ArrowUp && !keys.ArrowDown) {
        if (player.speed > 0) {
            player.speed -= player.deceleration;
            if (player.speed < 0) player.speed = 0;
        } else if (player.speed < 0) {
            player.speed += player.deceleration;
            if (player.speed > 0) player.speed = 0;
        }
    }
    
    // 거리 및 점수 업데이트
    distance += gameSpeed;
    score += Math.floor(gameSpeed);
    
    // 레벨 업
    if (distance > level * 500) {
        level++;
        gameSpeed += 0.5;
    }
    
    // 도로 선 생성
    if (Math.random() < 0.1) {
        for (let i = 1; i < 3; i++) {
            roadLines.push(new RoadLine(roadX + i * laneWidth - 4, -50));
        }
    }
    
    // 다른 자동차 생성
    if (Math.random() < 0.02 + level * 0.005) {
        const lane = Math.floor(Math.random() * 3);
        const carX = roadX + lane * laneWidth + laneWidth/2 - 22.5;
        const colors = ['#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speed = Math.random() * 2 + 1;
        otherCars.push(new Car(carX, -100, color, speed));
    }
    
    // 장애물 생성
    if (Math.random() < 0.01 + level * 0.002) {
        const lane = Math.floor(Math.random() * 3);
        const obstacleX = roadX + lane * laneWidth + laneWidth/2 - 20;
        const type = Math.random() < 0.7 ? 'cone' : 'oil';
        obstacles.push(new Obstacle(obstacleX, -50, type));
    }
    
    // 객체들 업데이트
    roadLines.forEach(line => line.update());
    otherCars.forEach(car => car.update());
    obstacles.forEach(obstacle => obstacle.update());
    particles.forEach(particle => particle.update());
    
    // 화면 밖 객체 제거
    roadLines = roadLines.filter(line => !line.isOffScreen());
    otherCars = otherCars.filter(car => !car.isOffScreen());
    obstacles = obstacles.filter(obstacle => !obstacle.isOffScreen());
    particles = particles.filter(particle => !particle.isDead());
    
    // 충돌 검사
    for (let car of otherCars) {
        if (checkCollision(player, car)) {
            createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000');
            gameOver();
            return;
        }
    }
    
    for (let obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            if (obstacle.type === 'cone') {
                createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, '#FF4500');
                gameOver();
                return;
            } else if (obstacle.type === 'oil') {
                // 오일에서는 미끄러짐 효과
                player.speed *= 0.5;
                createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, '#2C3E50');
                obstacles.splice(obstacles.indexOf(obstacle), 1);
            }
        }
    }
    
    updateDisplay();
}

// 게임 그리기
function draw() {
    // 배경 (하늘)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 도로 그리기
    drawRoad();
    
    // 게임 객체들 그리기
    otherCars.forEach(car => car.draw());
    obstacles.forEach(obstacle => obstacle.draw());
    drawPlayer();
    particles.forEach(particle => particle.draw());
    
    // 미니맵 그리기
    drawMinimap();
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
    
    document.getElementById('finalDistance').textContent = Math.floor(distance);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('distance').textContent = Math.floor(distance);
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('speedDisplay').textContent = Math.floor(player.speed * 20);
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
    distance = 0;
    score = 0;
    level = 1;
    gameSpeed = 2;
    
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 120;
    player.speed = 0;
    
    otherCars = [];
    obstacles = [];
    roadLines = [];
    particles = [];
    
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

// 초기화
updateDisplay();