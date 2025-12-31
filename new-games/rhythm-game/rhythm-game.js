// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let combo = 0;
let maxCombo = 0;
let totalNotes = 0;
let hitNotes = 0;
let currentSong = 'easy';

// 게임 설정
const lanes = 4;
const laneWidth = canvas.width / lanes;
const hitLineY = canvas.height - 100;
const noteSpeed = 3;

// 키 매핑
const keyMap = {
    'KeyA': 0,
    'KeyS': 1,
    'KeyD': 2,
    'KeyF': 3
};

const keyNames = ['A', 'S', 'D', 'F'];
const laneColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];

// 게임 객체들
let notes = [];
let particles = [];
let hitEffects = [];

// 곡 패턴들
const songPatterns = {
    easy: [
        // 간단한 패턴 (4박자 기준)
        { lane: 0, time: 1000 },
        { lane: 1, time: 1500 },
        { lane: 2, time: 2000 },
        { lane: 3, time: 2500 },
        { lane: 0, time: 3000 },
        { lane: 2, time: 3500 },
        { lane: 1, time: 4000 },
        { lane: 3, time: 4500 },
        { lane: 0, time: 5000 },
        { lane: 1, time: 5250 },
        { lane: 2, time: 5500 },
        { lane: 3, time: 5750 },
        { lane: 1, time: 6000 },
        { lane: 3, time: 6500 },
        { lane: 0, time: 7000 },
        { lane: 2, time: 7500 }
    ],
    medium: [
        // 중간 난이도
        { lane: 0, time: 500 },
        { lane: 2, time: 750 },
        { lane: 1, time: 1000 },
        { lane: 3, time: 1250 },
        { lane: 0, time: 1500 },
        { lane: 1, time: 1625 },
        { lane: 2, time: 1750 },
        { lane: 3, time: 2000 },
        { lane: 1, time: 2250 },
        { lane: 0, time: 2375 },
        { lane: 3, time: 2500 },
        { lane: 2, time: 2750 },
        { lane: 0, time: 3000 },
        { lane: 1, time: 3125 },
        { lane: 3, time: 3250 },
        { lane: 2, time: 3500 },
        { lane: 0, time: 3750 },
        { lane: 1, time: 3875 },
        { lane: 2, time: 4000 },
        { lane: 3, time: 4250 }
    ],
    hard: [
        // 어려운 패턴
        { lane: 0, time: 300 },
        { lane: 1, time: 400 },
        { lane: 2, time: 500 },
        { lane: 3, time: 600 },
        { lane: 0, time: 700 },
        { lane: 2, time: 775 },
        { lane: 1, time: 850 },
        { lane: 3, time: 925 },
        { lane: 0, time: 1000 },
        { lane: 1, time: 1075 },
        { lane: 2, time: 1150 },
        { lane: 3, time: 1225 },
        { lane: 1, time: 1300 },
        { lane: 0, time: 1375 },
        { lane: 3, time: 1450 },
        { lane: 2, time: 1525 },
        { lane: 0, time: 1600 },
        { lane: 1, time: 1650 },
        { lane: 2, time: 1700 },
        { lane: 3, time: 1750 },
        { lane: 0, time: 1800 },
        { lane: 2, time: 1850 },
        { lane: 1, time: 1900 },
        { lane: 3, time: 1950 },
        { lane: 0, time: 2000 }
    ]
};

// 노트 클래스
class Note {
    constructor(lane, targetTime) {
        this.lane = lane;
        this.x = lane * laneWidth + laneWidth / 2;
        this.y = -50;
        this.targetTime = targetTime;
        this.width = laneWidth - 20;
        this.height = 20;
        this.hit = false;
        this.missed = false;
    }
    
    update(currentTime) {
        // 시간 기반으로 위치 계산
        const timeToHit = this.targetTime - currentTime;
        const totalTime = 2000; // 2초 전에 나타남
        
        if (timeToHit <= totalTime && timeToHit >= -500) {
            const progress = 1 - (timeToHit / totalTime);
            this.y = -50 + (hitLineY + 25) * progress;
        }
        
        // Miss 판정
        if (timeToHit < -200 && !this.hit) {
            this.missed = true;
            combo = 0;
        }
    }
    
    draw() {
        if (this.hit || this.missed) return;
        
        ctx.save();
        
        // 노트 그리기
        const gradient = ctx.createLinearGradient(this.x - this.width/2, this.y, this.x + this.width/2, this.y + this.height);
        gradient.addColorStop(0, laneColors[this.lane]);
        gradient.addColorStop(1, this.darkenColor(laneColors[this.lane], 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // 노트 테두리
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y, this.width, this.height);
        
        // 노트 반짝임
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x - this.width/2 + 5, this.y + 2, this.width - 10, 4);
        
        ctx.restore();
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(1, 2), 16) - amount * 255);
        const g = Math.max(0, parseInt(hex.substr(3, 2), 16) - amount * 255);
        const b = Math.max(0, parseInt(hex.substr(5, 2), 16) - amount * 255);
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    checkHit(currentTime) {
        const timeDiff = Math.abs(this.targetTime - currentTime);
        
        if (timeDiff <= 50) return 'perfect';
        if (timeDiff <= 100) return 'great';
        if (timeDiff <= 150) return 'good';
        return null;
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.dx = (Math.random() - 0.5) * 10;
        this.dy = (Math.random() - 0.5) * 10 - 5;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 5 + 2;
    }
    
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.dy += 0.3; // 중력
        this.life--;
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

// 히트 이펙트 클래스
class HitEffect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 30;
        this.maxLife = 30;
        this.scale = 0;
    }
    
    update() {
        this.life--;
        this.scale = Math.sin((1 - this.life / this.maxLife) * Math.PI) * 2;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        
        // 타입별 다른 색상
        const colors = {
            perfect: '#ffff00',
            great: '#4ecdc4',
            good: '#96ceb4'
        };
        
        ctx.fillStyle = colors[this.type] || '#ffffff';
        ctx.font = '20px Comic Sans MS';
        ctx.textAlign = 'center';
        ctx.fillText(this.type.toUpperCase(), 0, 0);
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// 게임 초기화
let gameStartTime = 0;
let patternIndex = 0;

// 배경 그리기
function drawBackground() {
    // 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 레인 구분선
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 1; i < lanes; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.stroke();
    }
    
    // 히트 라인
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, hitLineY);
    ctx.lineTo(canvas.width, hitLineY);
    ctx.stroke();
    
    // 레인 하이라이트
    for (let i = 0; i < lanes; i++) {
        const keyPressed = document.getElementById(`key${keyNames[i]}`).classList.contains('active');
        if (keyPressed) {
            ctx.fillStyle = `rgba(${hexToRgb(laneColors[i])}, 0.3)`;
            ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);
        }
    }
}

// 색상 변환 함수
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '255, 255, 255';
}

// 노트 생성
function spawnNotes(currentTime) {
    const pattern = songPatterns[currentSong];
    
    while (patternIndex < pattern.length) {
        const noteData = pattern[patternIndex];
        const spawnTime = gameStartTime + noteData.time;
        
        if (currentTime >= spawnTime - 2000) { // 2초 전에 생성
            notes.push(new Note(noteData.lane, spawnTime));
            patternIndex++;
        } else {
            break;
        }
    }
}

// 키 입력 처리
function handleKeyPress(lane) {
    const currentTime = Date.now();
    
    // 해당 레인의 노트 찾기
    let hitNote = null;
    let bestTimeDiff = Infinity;
    
    for (let note of notes) {
        if (note.lane === lane && !note.hit && !note.missed) {
            const timeDiff = Math.abs(note.targetTime - currentTime);
            if (timeDiff < bestTimeDiff && timeDiff <= 150) {
                bestTimeDiff = timeDiff;
                hitNote = note;
            }
        }
    }
    
    if (hitNote) {
        const hitType = hitNote.checkHit(currentTime);
        if (hitType) {
            hitNote.hit = true;
            hitNotes++;
            combo++;
            maxCombo = Math.max(maxCombo, combo);
            
            // 점수 계산
            const baseScore = { perfect: 100, great: 50, good: 25 }[hitType];
            const comboBonus = Math.floor(combo / 10);
            score += baseScore + comboBonus;
            
            // 이펙트 생성
            createParticles(hitNote.x, hitLineY, laneColors[lane]);
            hitEffects.push(new HitEffect(hitNote.x, hitLineY - 30, hitType));
            
            updateDisplay();
        }
    } else {
        // Miss (잘못된 타이밍)
        combo = 0;
        updateDisplay();
    }
}

// 파티클 생성
function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    const currentTime = Date.now();
    
    // 노트 생성
    spawnNotes(currentTime);
    
    // 노트 업데이트
    notes.forEach(note => note.update(currentTime));
    
    // 파티클 업데이트
    particles.forEach(particle => particle.update());
    particles = particles.filter(particle => !particle.isDead());
    
    // 히트 이펙트 업데이트
    hitEffects.forEach(effect => effect.update());
    hitEffects = hitEffects.filter(effect => !effect.isDead());
    
    // Miss된 노트 제거
    const missedNotes = notes.filter(note => note.missed);
    totalNotes += missedNotes.length;
    notes = notes.filter(note => !note.missed && !note.hit);
    
    // 히트된 노트 카운트
    const hitNotesThisFrame = notes.filter(note => note.hit).length;
    totalNotes += hitNotesThisFrame;
    notes = notes.filter(note => !note.hit);
    
    // 게임 종료 체크
    if (patternIndex >= songPatterns[currentSong].length && notes.length === 0) {
        endGame();
    }
}

// 게임 그리기
function draw() {
    drawBackground();
    
    // 노트 그리기
    notes.forEach(note => note.draw());
    
    // 파티클 그리기
    particles.forEach(particle => particle.draw());
    
    // 히트 이펙트 그리기
    hitEffects.forEach(effect => effect.draw());
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('combo').textContent = combo;
    document.getElementById('maxCombo').textContent = maxCombo;
    
    const accuracy = totalNotes > 0 ? Math.round((hitNotes / totalNotes) * 100) : 100;
    document.getElementById('accuracy').textContent = accuracy;
    document.getElementById('accuracyFill').style.width = accuracy + '%';
}

// 곡 선택
function selectSong(song) {
    currentSong = song;
    
    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.song-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// 게임 종료
function endGame() {
    gameRunning = false;
    
    const accuracy = totalNotes > 0 ? Math.round((hitNotes / totalNotes) * 100) : 100;
    let grade = 'F';
    
    if (accuracy >= 95) grade = 'S';
    else if (accuracy >= 90) grade = 'A';
    else if (accuracy >= 80) grade = 'B';
    else if (accuracy >= 70) grade = 'C';
    else if (accuracy >= 60) grade = 'D';
    
    setTimeout(() => {
        alert(`게임 완료!\n점수: ${score}\n정확도: ${accuracy}%\n최대 콤보: ${maxCombo}\n등급: ${grade}`);
    }, 1000);
}

// 게임 제어 함수들
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameStartTime = Date.now();
        patternIndex = 0;
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
    combo = 0;
    maxCombo = 0;
    totalNotes = 0;
    hitNotes = 0;
    patternIndex = 0;
    
    notes = [];
    particles = [];
    hitEffects = [];
    
    updateDisplay();
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    if (keyMap.hasOwnProperty(e.code)) {
        const lane = keyMap[e.code];
        const keyElement = document.getElementById(`key${keyNames[lane]}`);
        keyElement.classList.add('active');
        
        if (gameRunning && !gamePaused) {
            handleKeyPress(lane);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (keyMap.hasOwnProperty(e.code)) {
        const lane = keyMap[e.code];
        const keyElement = document.getElementById(`key${keyNames[lane]}`);
        keyElement.classList.remove('active');
    }
});

// 초기화
updateDisplay();