// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let lives = 20;
let gold = 100;
let score = 0;
let currentWave = 1;
let waveInProgress = false;
let selectedTowerType = null;
let selectedTower = null;

// 경로 설정 (적들이 따라갈 길)
const path = [
    { x: 0, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 150 },
    { x: 400, y: 150 },
    { x: 400, y: 450 },
    { x: 600, y: 450 },
    { x: 600, y: 300 },
    { x: 800, y: 300 }
];

// 게임 객체들
let towers = [];
let enemies = [];
let projectiles = [];
let particles = [];

// 타워 타입 정의
const towerTypes = {
    basic: {
        cost: 20,
        damage: 15,
        range: 80,
        fireRate: 30,
        color: '#3498db',
        projectileColor: '#2980b9'
    },
    cannon: {
        cost: 50,
        damage: 40,
        range: 100,
        fireRate: 60,
        color: '#e74c3c',
        projectileColor: '#c0392b',
        splash: true,
        splashRadius: 50
    },
    ice: {
        cost: 75,
        damage: 10,
        range: 90,
        fireRate: 20,
        color: '#3498db',
        projectileColor: '#85c1e9',
        slow: true,
        slowAmount: 0.5,
        slowDuration: 120
    },
    laser: {
        cost: 100,
        damage: 25,
        range: 120,
        fireRate: 10,
        color: '#9b59b6',
        projectileColor: '#8e44ad',
        piercing: true
    }
};

// 적 타입 정의
const enemyTypes = {
    basic: {
        health: 50,
        speed: 1,
        reward: 5,
        color: '#e74c3c',
        size: 15
    },
    fast: {
        health: 30,
        speed: 2,
        reward: 8,
        color: '#f39c12',
        size: 12
    },
    tank: {
        health: 150,
        speed: 0.5,
        reward: 15,
        color: '#2c3e50',
        size: 20
    },
    flying: {
        health: 40,
        speed: 1.5,
        reward: 10,
        color: '#9b59b6',
        size: 14,
        flying: true
    }
};

// 타워 클래스
class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.stats = { ...towerTypes[type] };
        this.level = 1;
        this.fireTimer = 0;
        this.target = null;
        this.rotation = 0;
    }
    
    update() {
        this.fireTimer++;
        
        // 타겟 찾기
        this.findTarget();
        
        // 발사
        if (this.target && this.fireTimer >= this.stats.fireRate) {
            this.fire();
            this.fireTimer = 0;
        }
        
        // 타겟 방향으로 회전
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            this.rotation = Math.atan2(dy, dx);
        }
    }
    
    findTarget() {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        for (let enemy of enemies) {
            const distance = this.getDistance(enemy);
            if (distance <= this.stats.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        this.target = closestEnemy;
    }
    
    fire() {
        if (!this.target) return;
        
        const projectile = new Projectile(
            this.x, this.y,
            this.target.x, this.target.y,
            this.type, this.stats
        );
        projectiles.push(projectile);
        
        // 발사 파티클
        this.createMuzzleFlash();
    }
    
    createMuzzleFlash() {
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(
                this.x + Math.cos(this.rotation) * 20,
                this.y + Math.sin(this.rotation) * 20,
                this.stats.projectileColor,
                'muzzle'
            ));
        }
    }
    
    getDistance(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 타워 베이스
        ctx.fillStyle = this.stats.color;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 타워 포신
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.stats.color;
        ctx.fillRect(0, -5, 25, 10);
        
        ctx.restore();
        
        // 레벨 표시
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText(this.level, this.x, this.y + 5);
        
        // 선택된 타워 표시
        if (this === selectedTower) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
            ctx.stroke();
            
            // 사거리 표시
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    upgrade() {
        const upgradeCost = this.stats.cost * this.level;
        if (gold >= upgradeCost) {
            gold -= upgradeCost;
            this.level++;
            this.stats.damage = Math.floor(this.stats.damage * 1.5);
            this.stats.range = Math.floor(this.stats.range * 1.1);
            this.stats.fireRate = Math.max(5, this.stats.fireRate - 2);
            return true;
        }
        return false;
    }
    
    getSellPrice() {
        return Math.floor(this.stats.cost * this.level * 0.7);
    }
}
// 적 클래스
class Enemy {
    constructor(type, pathIndex = 0) {
        this.type = type;
        this.stats = { ...enemyTypes[type] };
        this.health = this.stats.health;
        this.maxHealth = this.stats.health;
        this.speed = this.stats.speed;
        this.pathIndex = pathIndex;
        this.x = path[0].x;
        this.y = path[0].y;
        this.slowTimer = 0;
        this.slowAmount = 1;
    }
    
    update() {
        // 슬로우 효과 처리
        if (this.slowTimer > 0) {
            this.slowTimer--;
            if (this.slowTimer <= 0) {
                this.slowAmount = 1;
            }
        }
        
        // 경로 따라 이동
        if (this.pathIndex < path.length - 1) {
            const target = path[this.pathIndex + 1];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                this.pathIndex++;
            } else {
                const moveSpeed = this.speed * this.slowAmount;
                this.x += (dx / distance) * moveSpeed;
                this.y += (dy / distance) * moveSpeed;
            }
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // 데미지 파티클
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(this.x, this.y, '#ff0000', 'damage'));
        }
        
        return this.health <= 0;
    }
    
    applySlow(slowAmount, duration) {
        this.slowAmount = slowAmount;
        this.slowTimer = duration;
    }
    
    draw() {
        // 적 몸체
        ctx.fillStyle = this.stats.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 체력바
        const barWidth = this.stats.size * 2;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.stats.size - 8, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.stats.size - 8, barWidth * healthPercent, barHeight);
        
        // 슬로우 효과 표시
        if (this.slowTimer > 0) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.size + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 비행 유닛 표시
        if (this.stats.flying) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - 5, this.stats.size + 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    hasReachedEnd() {
        return this.pathIndex >= path.length - 1;
    }
}

// 투사체 클래스
class Projectile {
    constructor(startX, startY, targetX, targetY, towerType, stats) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.towerType = towerType;
        this.stats = stats;
        this.speed = 8;
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.velocityX = (dx / distance) * this.speed;
        this.velocityY = (dy / distance) * this.speed;
        
        this.trail = [];
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 궤적 추가
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        // 타겟 근처에 도달했는지 확인
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            this.explode();
            return true; // 제거 신호
        }
        
        // 화면 밖으로 나갔는지 확인
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            return true; // 제거 신호
        }
        
        return false;
    }
    
    explode() {
        if (this.stats.splash) {
            // 스플래시 데미지
            for (let enemy of enemies) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.stats.splashRadius) {
                    const killed = enemy.takeDamage(this.stats.damage);
                    if (killed) {
                        gold += enemy.stats.reward;
                        score += enemy.stats.reward * 10;
                    }
                }
            }
            
            // 폭발 파티클
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, '#ff6b6b', 'explosion'));
            }
        } else {
            // 단일 타겟 데미지
            for (let enemy of enemies) {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= 20) {
                    const killed = enemy.takeDamage(this.stats.damage);
                    if (killed) {
                        gold += enemy.stats.reward;
                        score += enemy.stats.reward * 10;
                    }
                    
                    // 특수 효과 적용
                    if (this.stats.slow) {
                        enemy.applySlow(this.stats.slowAmount, this.stats.slowDuration);
                    }
                    
                    if (!this.stats.piercing) {
                        break; // 관통이 아니면 첫 번째 적만 타격
                    }
                }
            }
        }
    }
    
    draw() {
        // 궤적 그리기
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.stats.projectileColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
        }
        
        // 투사체 그리기
        ctx.fillStyle = this.stats.projectileColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color, type = 'normal') {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 6;
        this.dy = (Math.random() - 0.5) * 6;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 4 + 2;
        this.type = type;
        
        if (type === 'explosion') {
            this.dx *= 2;
            this.dy *= 2;
            this.life = 20;
            this.maxLife = 20;
        } else if (type === 'muzzle') {
            this.life = 10;
            this.maxLife = 10;
        }
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life--;
        
        if (this.type === 'damage') {
            this.dy -= 0.5; // 위로 올라감
        } else {
            this.dy += 0.2; // 중력
        }
        
        this.dx *= 0.98; // 공기 저항
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
// 경로 그리기
function drawPath() {
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        if (i === 0) {
            ctx.moveTo(path[i].x, path[i].y);
        } else {
            ctx.lineTo(path[i].x, path[i].y);
        }
    }
    ctx.stroke();
    
    // 경로 테두리
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 35;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        if (i === 0) {
            ctx.moveTo(path[i].x, path[i].y);
        } else {
            ctx.lineTo(path[i].x, path[i].y);
        }
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    
    // 시작점과 끝점 표시
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(path[0].x, path[0].y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(path[path.length - 1].x, path[path.length - 1].y, 20, 0, Math.PI * 2);
    ctx.fill();
}

// 배경 그리기
function drawBackground() {
    // 잔디 배경
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 잔디 텍스처
    ctx.fillStyle = '#2ecc71';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }
}

// 웨이브 생성
function spawnWave() {
    const waveEnemies = getWaveEnemies(currentWave);
    let spawnDelay = 0;
    
    waveEnemies.forEach((enemyType, index) => {
        setTimeout(() => {
            enemies.push(new Enemy(enemyType));
        }, spawnDelay);
        spawnDelay += 1000; // 1초 간격으로 생성
    });
    
    waveInProgress = true;
}

// 웨이브별 적 구성
function getWaveEnemies(wave) {
    const enemies = [];
    const baseCount = 5 + wave * 2;
    
    for (let i = 0; i < baseCount; i++) {
        if (wave < 3) {
            enemies.push('basic');
        } else if (wave < 6) {
            enemies.push(Math.random() < 0.7 ? 'basic' : 'fast');
        } else if (wave < 10) {
            const rand = Math.random();
            if (rand < 0.4) enemies.push('basic');
            else if (rand < 0.7) enemies.push('fast');
            else enemies.push('tank');
        } else {
            const rand = Math.random();
            if (rand < 0.3) enemies.push('basic');
            else if (rand < 0.5) enemies.push('fast');
            else if (rand < 0.8) enemies.push('tank');
            else enemies.push('flying');
        }
    }
    
    return enemies;
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    // 타워 업데이트
    towers.forEach(tower => tower.update());
    
    // 적 업데이트
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        
        // 적이 끝에 도달했는지 확인
        if (enemy.hasReachedEnd()) {
            lives--;
            enemies.splice(i, 1);
            
            if (lives <= 0) {
                gameOver();
                return;
            }
        }
        
        // 죽은 적 제거
        if (enemy.health <= 0) {
            enemies.splice(i, 1);
        }
    }
    
    // 투사체 업데이트
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        if (projectile.update()) {
            projectiles.splice(i, 1);
        }
    }
    
    // 파티클 업데이트
    particles.forEach(particle => particle.update());
    particles = particles.filter(particle => !particle.isDead());
    
    // 웨이브 완료 확인
    if (waveInProgress && enemies.length === 0) {
        waveInProgress = false;
        currentWave++;
        gold += 20; // 웨이브 완료 보너스
    }
    
    updateDisplay();
}

// 게임 그리기
function draw() {
    drawBackground();
    drawPath();
    
    // 게임 객체들 그리기
    towers.forEach(tower => tower.draw());
    enemies.forEach(enemy => enemy.draw());
    projectiles.forEach(projectile => projectile.draw());
    particles.forEach(particle => particle.draw());
    
    // 타워 설치 미리보기
    if (selectedTowerType && !selectedTower) {
        drawTowerPreview();
    }
}

// 타워 미리보기 그리기
function drawTowerPreview() {
    const rect = canvas.getBoundingClientRect();
    const mouseX = lastMouseX;
    const mouseY = lastMouseY;
    
    if (mouseX && mouseY && canPlaceTower(mouseX, mouseY)) {
        const stats = towerTypes[selectedTowerType];
        
        // 미리보기 타워
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = stats.color;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // 사거리 표시
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, stats.range, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }
}

// 타워 설치 가능 여부 확인
function canPlaceTower(x, y) {
    // 경로와 너무 가까운지 확인
    for (let point of path) {
        const dx = x - point.x;
        const dy = y - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40) return false;
    }
    
    // 다른 타워와 너무 가까운지 확인
    for (let tower of towers) {
        const dx = x - tower.x;
        const dy = y - tower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) return false;
    }
    
    return true;
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 마우스 이벤트
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (selectedTowerType) {
        // 타워 설치
        const stats = towerTypes[selectedTowerType];
        if (gold >= stats.cost && canPlaceTower(mouseX, mouseY)) {
            towers.push(new Tower(mouseX, mouseY, selectedTowerType));
            gold -= stats.cost;
            selectedTowerType = null;
            updateTowerButtons();
        }
    } else {
        // 타워 선택
        selectedTower = null;
        for (let tower of towers) {
            const dx = mouseX - tower.x;
            const dy = mouseY - tower.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 25) {
                selectedTower = tower;
                showUpgradePanel();
                break;
            }
        }
        
        if (!selectedTower) {
            hideUpgradePanel();
        }
    }
});

// UI 함수들
function selectTower(type) {
    selectedTowerType = selectedTowerType === type ? null : type;
    selectedTower = null;
    hideUpgradePanel();
    updateTowerButtons();
}

function updateTowerButtons() {
    document.querySelectorAll('.tower-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (selectedTowerType) {
        document.querySelector(`[onclick="selectTower('${selectedTowerType}')"]`).classList.add('selected');
    }
}

function showUpgradePanel() {
    const panel = document.getElementById('upgradePanel');
    const upgradePrice = selectedTower.stats.cost * selectedTower.level;
    const sellPrice = selectedTower.getSellPrice();
    
    document.getElementById('upgradePrice').textContent = upgradePrice;
    document.getElementById('sellPrice').textContent = sellPrice;
    
    panel.style.display = 'block';
}

function hideUpgradePanel() {
    document.getElementById('upgradePanel').style.display = 'none';
}

function upgradeTower() {
    if (selectedTower && selectedTower.upgrade()) {
        showUpgradePanel(); // 가격 업데이트
    }
}

function sellTower() {
    if (selectedTower) {
        gold += selectedTower.getSellPrice();
        towers = towers.filter(tower => tower !== selectedTower);
        selectedTower = null;
        hideUpgradePanel();
    }
}

function startWave() {
    if (!waveInProgress && gameRunning) {
        spawnWave();
    }
}

function gameOver() {
    gameRunning = false;
    
    document.getElementById('finalWave').textContent = currentWave;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function updateDisplay() {
    document.getElementById('lives').textContent = lives;
    document.getElementById('gold').textContent = gold;
    document.getElementById('score').textContent = score;
    document.getElementById('currentWave').textContent = currentWave;
    document.getElementById('enemiesLeft').textContent = enemies.length;
    
    const status = waveInProgress ? '진행 중' : '대기 중';
    document.getElementById('waveStatus').textContent = status;
}

// 게임 제어 함수들
function startGame() {
    gameRunning = true;
    gameLoop();
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
    lives = 20;
    gold = 100;
    score = 0;
    currentWave = 1;
    waveInProgress = false;
    selectedTowerType = null;
    selectedTower = null;
    
    towers = [];
    enemies = [];
    projectiles = [];
    particles = [];
    
    document.getElementById('gameOver').style.display = 'none';
    hideUpgradePanel();
    updateTowerButtons();
    updateDisplay();
}

// 초기화
updateDisplay();
startGame();