// 궁수 게임 JavaScript

class ArcheryGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.score = 0;
        this.arrows = 10;
        this.bestScore = parseInt(localStorage.getItem('archeryBestScore')) || 0;
        this.accuracy = 0;
        this.totalShots = 0;
        this.hits = 0;
        
        this.gameRunning = false;
        this.isAiming = false;
        this.isShooting = false;
        this.showTrajectoryMode = false;
        
        this.archer = { x: 100, y: 400 };
        this.target = { x: 650, y: 300, radius: 80 };
        this.wind = { x: 0, y: 0 };
        this.difficulty = 'easy';
        
        this.angle = 45;
        this.power = 0;
        this.maxPower = 100;
        
        this.arrows_flying = [];
        this.particles = [];
        this.shotHistory = [];
        
        this.difficultySettings = {
            easy: { windStrength: 2, targetSize: 80, arrowCount: 15 },
            medium: { windStrength: 4, targetSize: 60, arrowCount: 12 },
            hard: { windStrength: 6, targetSize: 45, arrowCount: 10 },
            expert: { windStrength: 8, targetSize: 30, arrowCount: 8 }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateWind();
        this.updateDisplay();
        this.gameLoop();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning || this.isShooting) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 각도 계산 (궁수에서 마우스까지)
            const dx = mouseX - this.archer.x;
            const dy = this.archer.y - mouseY; // Y축 반전
            this.angle = Math.atan2(dy, dx) * 180 / Math.PI;
            this.angle = Math.max(-30, Math.min(60, this.angle)); // 각도 제한
            
            this.updateAngleDisplay();
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.gameRunning || this.arrows <= 0 || this.isShooting) return;
            
            this.isAiming = true;
            this.power = 0;
            this.chargePower();
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isAiming) return;
            
            this.isAiming = false;
            this.shootArrow();
        });
        
        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (!this.isAiming && !this.isShooting && this.arrows > 0) {
                        this.isAiming = true;
                        this.power = 0;
                        this.chargePower();
                    }
                    break;
                case 'r':
                    this.resetGame();
                    break;
                case 't':
                    this.showTrajectory();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === ' ' && this.isAiming) {
                this.isAiming = false;
                this.shootArrow();
            }
        });
    }
    
    chargePower() {
        if (!this.isAiming) return;
        
        this.power = Math.min(this.maxPower, this.power + 2);
        this.updatePowerDisplay();
        
        if (this.power < this.maxPower) {
            requestAnimationFrame(() => this.chargePower());
        }
    }
    
    shootArrow() {
        if (this.arrows <= 0) return;
        
        this.isShooting = true;
        this.arrows--;
        this.totalShots++;
        
        const angleRad = this.angle * Math.PI / 180;
        const velocity = this.power * 0.15;
        
        const arrow = {
            x: this.archer.x + 30,
            y: this.archer.y - 10,
            vx: Math.cos(angleRad) * velocity,
            vy: -Math.sin(angleRad) * velocity,
            trail: [],
            rotation: this.angle
        };
        
        this.arrows_flying.push(arrow);
        this.power = 0;
        this.updateDisplay();
        
        // 슛 사운드 효과 (시각적)
        this.createShootEffect();
        
        setTimeout(() => {
            this.isShooting = false;
        }, 500);
    }
    
    createShootEffect() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.archer.x + 30,
                y: this.archer.y - 10,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 60 + 15}, 100%, 50%)`
            });
        }
    }
    
    updateArrows() {
        for (let i = this.arrows_flying.length - 1; i >= 0; i--) {
            const arrow = this.arrows_flying[i];
            
            // 궤적 저장
            arrow.trail.push({ x: arrow.x, y: arrow.y });
            if (arrow.trail.length > 20) {
                arrow.trail.shift();
            }
            
            // 물리 계산
            arrow.vy += 0.2; // 중력
            arrow.vx += this.wind.x * 0.01; // 바람 영향
            arrow.vy += this.wind.y * 0.01;
            
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            
            // 회전 계산
            arrow.rotation = Math.atan2(arrow.vy, arrow.vx) * 180 / Math.PI;
            
            // 과녁 충돌 검사
            const distToTarget = Math.sqrt(
                Math.pow(arrow.x - this.target.x, 2) + 
                Math.pow(arrow.y - this.target.y, 2)
            );
            
            if (distToTarget <= this.target.radius && arrow.vy > 0) {
                this.hitTarget(arrow, distToTarget);
                this.arrows_flying.splice(i, 1);
                continue;
            }
            
            // 경계 검사
            if (arrow.x > this.canvas.width || arrow.y > this.canvas.height || 
                arrow.x < 0 || arrow.y < 0) {
                this.missTarget(arrow);
                this.arrows_flying.splice(i, 1);
            }
        }
    }
    
    hitTarget(arrow, distance) {
        this.hits++;
        
        // 점수 계산 (중심에 가까울수록 높은 점수)
        const maxDistance = this.target.radius;
        const accuracy = 1 - (distance / maxDistance);
        let points = Math.floor(accuracy * 100);
        
        // 보너스 점수
        if (distance <= 10) {
            points += 100; // 불스아이
            this.showAchievement('🎯 불스아이! +' + (points) + '점!');
        } else if (distance <= 20) {
            points += 50; // 내부 링
            this.showAchievement('🏹 훌륭해요! +' + points + '점!');
        } else if (distance <= 40) {
            points += 25; // 중간 링
        }
        
        // 연속 히트 보너스
        if (this.shotHistory.length > 0 && this.shotHistory[this.shotHistory.length - 1].hit) {
            points += 10;
        }
        
        this.score += points;
        
        // 기록 저장
        this.shotHistory.push({
            shot: this.totalShots,
            hit: true,
            points: points,
            distance: Math.floor(distance),
            wind: `${Math.floor(this.wind.x)}, ${Math.floor(this.wind.y)}`
        });
        
        // 히트 이펙트
        this.createHitEffect(this.target.x, this.target.y);
        
        this.updateDisplay();
        this.updateShotHistory();
        
        // 새로운 바람 생성
        this.generateWind();
    }
    
    missTarget(arrow) {
        this.shotHistory.push({
            shot: this.totalShots,
            hit: false,
            points: 0,
            distance: '빗나감',
            wind: `${Math.floor(this.wind.x)}, ${Math.floor(this.wind.y)}`
        });
        
        this.updateShotHistory();
        this.generateWind();
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 60,
                maxLife: 60,
                color: `hsl(${Math.random() * 60 + 300}, 100%, 50%)`
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // 중력
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    generateWind() {
        const strength = this.difficultySettings[this.difficulty].windStrength;
        this.wind.x = (Math.random() - 0.5) * strength;
        this.wind.y = (Math.random() - 0.5) * strength * 0.5; // 세로 바람은 약하게
        
        this.updateWindDisplay();
    }
    
    updateWindDisplay() {
        const windIndicator = document.getElementById('windIndicator');
        const windSpeed = Math.sqrt(this.wind.x * this.wind.x + this.wind.y * this.wind.y);
        
        let windDirection = '';
        if (Math.abs(this.wind.x) > Math.abs(this.wind.y)) {
            windDirection = this.wind.x > 0 ? '→' : '←';
        } else {
            windDirection = this.wind.y > 0 ? '↓' : '↑';
        }
        
        windIndicator.innerHTML = `💨 바람: ${windDirection} ${windSpeed.toFixed(1)}`;
    }
    
    updateAngleDisplay() {
        document.getElementById('angleDisplay').textContent = Math.floor(this.angle) + '°';
        document.getElementById('angleIndicator').style.transform = `rotate(${-this.angle}deg)`;
    }
    
    updatePowerDisplay() {
        const powerFill = document.getElementById('powerFill');
        const percentage = (this.power / this.maxPower) * 100;
        powerFill.style.height = percentage + '%';
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('arrows').textContent = this.arrows;
        document.getElementById('bestScore').textContent = this.bestScore;
        
        if (this.totalShots > 0) {
            this.accuracy = Math.floor((this.hits / this.totalShots) * 100);
            document.getElementById('accuracy').textContent = this.accuracy;
        }
        
        // 최고 기록 업데이트
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('archeryBestScore', this.bestScore);
        }
    }
    
    updateShotHistory() {
        const historyDiv = document.getElementById('shotHistory');
        historyDiv.innerHTML = '';
        
        const recentShots = this.shotHistory.slice(-5).reverse();
        
        recentShots.forEach(shot => {
            const entry = document.createElement('div');
            entry.className = 'shot-entry';
            entry.innerHTML = `
                <span>슛 ${shot.shot}</span>
                <span>${shot.hit ? '🎯' : '❌'}</span>
                <span>${shot.points}점</span>
            `;
            historyDiv.appendChild(entry);
        });
        
        if (this.shotHistory.length === 0) {
            historyDiv.innerHTML = '<div style="text-align: center; color: #666; font-style: italic;">게임을 시작해서 화살을 쏴보세요!</div>';
        }
    }
    
    showAchievement(message) {
        const achievement = document.getElementById('achievement');
        achievement.textContent = message;
        achievement.style.display = 'block';
        
        setTimeout(() => {
            achievement.style.display = 'none';
        }, 2000);
    }
    
    draw() {
        // 배경 그리기
        this.ctx.fillStyle = 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 하늘 그라디언트
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 구름 그리기
        this.drawClouds();
        
        // 과녁 그리기
        this.drawTarget();
        
        // 궁수 그리기
        this.drawArcher();
        
        // 조준선 그리기
        if (this.gameRunning && !this.isShooting) {
            this.drawAimLine();
        }
        
        // 궤적 표시 모드
        if (this.showTrajectoryMode) {
            this.drawTrajectoryPreview();
        }
        
        // 화살 그리기
        this.drawArrows();
        
        // 파티클 그리기
        this.drawParticles();
        
        // 바람 표시
        this.drawWindIndicator();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // 구름 1
        this.ctx.beginPath();
        this.ctx.arc(150, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(180, 80, 40, 0, Math.PI * 2);
        this.ctx.arc(210, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 구름 2
        this.ctx.beginPath();
        this.ctx.arc(500, 120, 25, 0, Math.PI * 2);
        this.ctx.arc(525, 120, 35, 0, Math.PI * 2);
        this.ctx.arc(550, 120, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawTarget() {
        const rings = [
            { radius: this.target.radius, color: '#ffffff' },
            { radius: this.target.radius * 0.8, color: '#000000' },
            { radius: this.target.radius * 0.6, color: '#0066cc' },
            { radius: this.target.radius * 0.4, color: '#ff0000' },
            { radius: this.target.radius * 0.2, color: '#ffff00' }
        ];
        
        rings.forEach(ring => {
            this.ctx.fillStyle = ring.color;
            this.ctx.beginPath();
            this.ctx.arc(this.target.x, this.target.y, ring.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 중심점
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.target.x, this.target.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawArcher() {
        this.ctx.save();
        this.ctx.translate(this.archer.x, this.archer.y);
        
        // 몸
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(-10, -30, 20, 40);
        
        // 머리
        this.ctx.fillStyle = '#ffdbac';
        this.ctx.beginPath();
        this.ctx.arc(0, -40, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 활
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(20, -20, 25, -Math.PI/3, Math.PI/3, false);
        this.ctx.stroke();
        
        // 활시위
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(20 + 25 * Math.cos(-Math.PI/3), -20 + 25 * Math.sin(-Math.PI/3));
        this.ctx.lineTo(20 + 25 * Math.cos(Math.PI/3), -20 + 25 * Math.sin(Math.PI/3));
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawAimLine() {
        if (!this.gameRunning) return;
        
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const angleRad = this.angle * Math.PI / 180;
        const length = 100;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.archer.x + 30, this.archer.y - 10);
        this.ctx.lineTo(
            this.archer.x + 30 + Math.cos(angleRad) * length,
            this.archer.y - 10 - Math.sin(angleRad) * length
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawTrajectoryPreview() {
        if (!this.gameRunning) return;
        
        const angleRad = this.angle * Math.PI / 180;
        const velocity = 50 * 0.15; // 중간 파워로 계산
        
        let x = this.archer.x + 30;
        let y = this.archer.y - 10;
        let vx = Math.cos(angleRad) * velocity;
        let vy = -Math.sin(angleRad) * velocity;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        for (let i = 0; i < 100; i++) {
            vy += 0.2; // 중력
            vx += this.wind.x * 0.01; // 바람
            vy += this.wind.y * 0.01;
            
            x += vx;
            y += vy;
            
            if (x > this.canvas.width || y > this.canvas.height) break;
            
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawArrows() {
        this.arrows_flying.forEach(arrow => {
            // 궤적 그리기
            if (arrow.trail.length > 1) {
                this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(arrow.trail[0].x, arrow.trail[0].y);
                
                for (let i = 1; i < arrow.trail.length; i++) {
                    this.ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
                }
                this.ctx.stroke();
            }
            
            // 화살 그리기
            this.ctx.save();
            this.ctx.translate(arrow.x, arrow.y);
            this.ctx.rotate(arrow.rotation * Math.PI / 180);
            
            // 화살대
            this.ctx.fillStyle = '#8b4513';
            this.ctx.fillRect(-15, -1, 30, 2);
            
            // 화살촉
            this.ctx.fillStyle = '#c0c0c0';
            this.ctx.beginPath();
            this.ctx.moveTo(15, 0);
            this.ctx.lineTo(10, -3);
            this.ctx.lineTo(10, 3);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 깃털
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.moveTo(-15, 0);
            this.ctx.lineTo(-20, -2);
            this.ctx.lineTo(-18, 0);
            this.ctx.lineTo(-20, 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawWindIndicator() {
        if (Math.abs(this.wind.x) < 0.5 && Math.abs(this.wind.y) < 0.5) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = 50;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + this.wind.x * 10, centerY + this.wind.y * 10);
        this.ctx.stroke();
        
        // 화살표 끝
        const angle = Math.atan2(this.wind.y, this.wind.x);
        const arrowLength = 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + this.wind.x * 10, centerY + this.wind.y * 10);
        this.ctx.lineTo(
            centerX + this.wind.x * 10 - arrowLength * Math.cos(angle - Math.PI/6),
            centerY + this.wind.y * 10 - arrowLength * Math.sin(angle - Math.PI/6)
        );
        this.ctx.moveTo(centerX + this.wind.x * 10, centerY + this.wind.y * 10);
        this.ctx.lineTo(
            centerX + this.wind.x * 10 - arrowLength * Math.cos(angle + Math.PI/6),
            centerY + this.wind.y * 10 - arrowLength * Math.sin(angle + Math.PI/6)
        );
        this.ctx.stroke();
    }
    
    gameLoop() {
        this.updateArrows();
        this.updateParticles();
        this.draw();
        
        // 게임 종료 체크
        if (this.gameRunning && this.arrows <= 0 && this.arrows_flying.length === 0) {
            this.endGame();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGame() {
        this.gameRunning = true;
        const settings = this.difficultySettings[this.difficulty];
        this.arrows = settings.arrowCount;
        this.target.radius = settings.targetSize;
        this.score = 0;
        this.totalShots = 0;
        this.hits = 0;
        this.accuracy = 0;
        this.shotHistory = [];
        this.arrows_flying = [];
        this.particles = [];
        
        this.generateWind();
        this.updateDisplay();
        this.updateShotHistory();
        
        this.showAchievement('🏹 게임 시작! 과녁을 맞춰보세요!');
    }
    
    endGame() {
        this.gameRunning = false;
        
        let message = `게임 종료! 최종 점수: ${this.score}점`;
        if (this.score > this.bestScore) {
            message += ' 🏆 새로운 기록!';
        }
        
        this.showAchievement(message);
    }
    
    resetGame() {
        this.gameRunning = false;
        this.arrows_flying = [];
        this.particles = [];
        this.shotHistory = [];
        this.score = 0;
        this.arrows = this.difficultySettings[this.difficulty].arrowCount;
        this.totalShots = 0;
        this.hits = 0;
        this.accuracy = 0;
        this.power = 0;
        
        this.updateDisplay();
        this.updateShotHistory();
        this.updatePowerDisplay();
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        // 난이도 버튼 업데이트
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // 게임 리셋
        this.resetGame();
        
        this.showAchievement(`난이도: ${difficulty.toUpperCase()}`);
    }
    
    showTrajectory() {
        this.showTrajectoryMode = !this.showTrajectoryMode;
        
        if (this.showTrajectoryMode) {
            this.showAchievement('궤적 표시 ON');
        } else {
            this.showAchievement('궤적 표시 OFF');
        }
    }
    
    nextTarget() {
        if (!this.gameRunning) return;
        
        // 과녁 위치 랜덤 변경
        this.target.x = 500 + Math.random() * 200;
        this.target.y = 200 + Math.random() * 200;
        
        this.generateWind();
        this.showAchievement('새로운 과녁 위치!');
    }
}

// 게임 인스턴스 생성
const archeryGame = new ArcheryGame();

// 전역 함수들
function startGame() {
    archeryGame.startGame();
}

function resetGame() {
    archeryGame.resetGame();
}

function setDifficulty(difficulty) {
    archeryGame.setDifficulty(difficulty);
}

function showTrajectory() {
    archeryGame.showTrajectory();
}

function nextTarget() {
    archeryGame.nextTarget();
}