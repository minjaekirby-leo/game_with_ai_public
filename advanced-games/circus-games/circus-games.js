// 현재 활성 게임
let currentGame = null;

// 게임 선택
function selectGame(gameType) {
    // 모든 게임 영역 숨기기
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    
    // 게임 선택 화면 숨기기
    document.getElementById('gameSelection').style.display = 'none';
    
    // 선택된 게임 표시
    document.getElementById(gameType + 'Game').classList.add('active');
    
    currentGame = gameType;
    
    // 게임별 초기화
    switch(gameType) {
        case 'trapeze':
            initTrapeze();
            break;
        case 'juggling':
            initJuggling();
            break;
        case 'tightrope':
            initTightrope();
            break;
        case 'animals':
            initAnimals();
            break;
    }
}

// 게임 선택으로 돌아가기
function backToSelection() {
    // 모든 게임 영역 숨기기
    document.querySelectorAll('.game-area').forEach(area => {
        area.classList.remove('active');
    });
    
    // 게임 선택 화면 표시
    document.getElementById('gameSelection').style.display = 'block';
    
    // 현재 게임 정리
    if (currentGame) {
        stopCurrentGame();
    }
    
    currentGame = null;
}

// 현재 게임 정지
function stopCurrentGame() {
    switch(currentGame) {
        case 'trapeze':
            trapezeRunning = false;
            break;
        case 'juggling':
            jugglingRunning = false;
            break;
        case 'tightrope':
            tightropeRunning = false;
            break;
        case 'animals':
            animalRunning = false;
            break;
    }
}

// ===========================================
// 1. 공중 그네 게임
// ===========================================

let trapezeRunning = false;
let trapezeScore = 0;
let trapezeSuccess = 0;
let trapezeFails = 0;
let trapezeCanvas, trapezeCtx;

// 그네 객체들
let leftTrapeze = { x: 150, y: 50, angle: 0, speed: 0.05, length: 150 };
let rightTrapeze = { x: 450, y: 50, angle: Math.PI, speed: -0.05, length: 150 };
let performer = { onTrapeze: 'left', x: 0, y: 0, inAir: false, velocityX: 0, velocityY: 0 };

function initTrapeze() {
    trapezeCanvas = document.getElementById('trapezeCanvas');
    trapezeCtx = trapezeCanvas.getContext('2d');
    resetTrapeze();
}

function startTrapeze() {
    trapezeRunning = true;
    trapezeLoop();
}

function resetTrapeze() {
    trapezeRunning = false;
    trapezeScore = 0;
    trapezeSuccess = 0;
    trapezeFails = 0;
    
    leftTrapeze.angle = 0;
    rightTrapeze.angle = Math.PI;
    performer.onTrapeze = 'left';
    performer.inAir = false;
    
    updateTrapezeDisplay();
}

function trapezeLoop() {
    if (!trapezeRunning) return;
    
    updateTrapeze();
    drawTrapeze();
    
    requestAnimationFrame(trapezeLoop);
}

function updateTrapeze() {
    // 그네 움직임
    leftTrapeze.angle += leftTrapeze.speed;
    rightTrapeze.angle += rightTrapeze.speed;
    
    // 그네 위치 계산
    leftTrapeze.endX = leftTrapeze.x + Math.sin(leftTrapeze.angle) * leftTrapeze.length;
    leftTrapeze.endY = leftTrapeze.y + Math.cos(leftTrapeze.angle) * leftTrapeze.length;
    
    rightTrapeze.endX = rightTrapeze.x + Math.sin(rightTrapeze.angle) * rightTrapeze.length;
    rightTrapeze.endY = rightTrapeze.y + Math.cos(rightTrapeze.angle) * rightTrapeze.length;
    
    // 공연자 위치 업데이트
    if (performer.onTrapeze === 'left') {
        performer.x = leftTrapeze.endX;
        performer.y = leftTrapeze.endY;
    } else if (performer.onTrapeze === 'right') {
        performer.x = rightTrapeze.endX;
        performer.y = rightTrapeze.endY;
    } else if (performer.inAir) {
        // 공중에서 물리 적용
        performer.x += performer.velocityX;
        performer.y += performer.velocityY;
        performer.velocityY += 0.3; // 중력
        
        // 오른쪽 그네 잡기 시도
        const dx = performer.x - rightTrapeze.endX;
        const dy = performer.y - rightTrapeze.endY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
            performer.onTrapeze = 'right';
            performer.inAir = false;
            trapezeSuccess++;
            trapezeScore += 100;
            updateTrapezeDisplay();
        }
        
        // 바닥에 떨어짐
        if (performer.y > trapezeCanvas.height - 50) {
            trapezeFails++;
            performer.onTrapeze = 'left';
            performer.inAir = false;
            leftTrapeze.angle = 0;
            updateTrapezeDisplay();
        }
    }
}

function drawTrapeze() {
    // 배경
    trapezeCtx.fillStyle = '#000033';
    trapezeCtx.fillRect(0, 0, trapezeCanvas.width, trapezeCanvas.height);
    
    // 그네 줄
    trapezeCtx.strokeStyle = '#8B4513';
    trapezeCtx.lineWidth = 3;
    
    trapezeCtx.beginPath();
    trapezeCtx.moveTo(leftTrapeze.x, leftTrapeze.y);
    trapezeCtx.lineTo(leftTrapeze.endX, leftTrapeze.endY);
    trapezeCtx.stroke();
    
    trapezeCtx.beginPath();
    trapezeCtx.moveTo(rightTrapeze.x, rightTrapeze.y);
    trapezeCtx.lineTo(rightTrapeze.endX, rightTrapeze.endY);
    trapezeCtx.stroke();
    
    // 그네 바
    trapezeCtx.fillStyle = '#FFD700';
    trapezeCtx.fillRect(leftTrapeze.endX - 20, leftTrapeze.endY - 5, 40, 10);
    trapezeCtx.fillRect(rightTrapeze.endX - 20, rightTrapeze.endY - 5, 40, 10);
    
    // 공연자
    trapezeCtx.fillStyle = '#FF6B6B';
    trapezeCtx.beginPath();
    trapezeCtx.arc(performer.x, performer.y, 8, 0, Math.PI * 2);
    trapezeCtx.fill();
    
    // 안전망
    trapezeCtx.strokeStyle = '#FFFFFF';
    trapezeCtx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
        trapezeCtx.beginPath();
        trapezeCtx.moveTo(i * 60, trapezeCanvas.height - 50);
        trapezeCtx.lineTo((i + 1) * 60, trapezeCanvas.height - 30);
        trapezeCtx.stroke();
    }
}

function updateTrapezeDisplay() {
    document.getElementById('trapezeScore').textContent = trapezeScore;
    document.getElementById('trapezeSuccess').textContent = trapezeSuccess;
    document.getElementById('trapezeFails').textContent = trapezeFails;
}

// 키보드 이벤트 (공중 그네)
document.addEventListener('keydown', (e) => {
    if (currentGame === 'trapeze' && e.code === 'Space' && trapezeRunning) {
        if (performer.onTrapeze === 'left') {
            // 그네에서 뛰어내리기
            performer.onTrapeze = null;
            performer.inAir = true;
            performer.velocityX = Math.sin(leftTrapeze.angle) * 8;
            performer.velocityY = Math.cos(leftTrapeze.angle) * 8;
        }
    }
});

// ===========================================
// 2. 저글링 게임
// ===========================================

let jugglingRunning = false;
let jugglingScore = 0;
let jugglingCombo = 0;
let jugglingCanvas, jugglingCtx;
let balls = [];
let juggler = { x: 300, y: 350, width: 40, height: 60 };

function initJuggling() {
    jugglingCanvas = document.getElementById('jugglingCanvas');
    jugglingCtx = jugglingCanvas.getContext('2d');
    resetJuggling();
}

function startJuggling() {
    jugglingRunning = true;
    
    // 초기 공들 생성
    for (let i = 0; i < 3; i++) {
        balls.push({
            x: 280 + i * 20,
            y: 300,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: -Math.random() * 5 - 5,
            radius: 15,
            color: ['#ff6b6b', '#4ecdc4', '#45b7d1'][i],
            caught: false
        });
    }
    
    jugglingLoop();
}

function resetJuggling() {
    jugglingRunning = false;
    jugglingScore = 0;
    jugglingCombo = 0;
    balls = [];
    updateJugglingDisplay();
}

function jugglingLoop() {
    if (!jugglingRunning) return;
    
    updateJuggling();
    drawJuggling();
    
    requestAnimationFrame(jugglingLoop);
}

function updateJuggling() {
    // 공들 업데이트
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        ball.velocityY += 0.3; // 중력
        
        // 저글러와 충돌 검사
        const dx = ball.x - juggler.x;
        const dy = ball.y - juggler.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30 && ball.velocityY > 0 && !ball.caught) {
            ball.caught = true;
            jugglingCombo++;
            jugglingScore += 10 * jugglingCombo;
            
            // 공을 다시 던지기
            setTimeout(() => {
                ball.velocityX = (Math.random() - 0.5) * 6;
                ball.velocityY = -Math.random() * 8 - 8;
                ball.caught = false;
            }, 200);
        }
        
        // 바닥에 떨어짐
        if (ball.y > jugglingCanvas.height) {
            balls.splice(i, 1);
            jugglingCombo = 0;
        }
    }
    
    updateJugglingDisplay();
}

function drawJuggling() {
    // 배경
    jugglingCtx.fillStyle = '#2c3e50';
    jugglingCtx.fillRect(0, 0, jugglingCanvas.width, jugglingCanvas.height);
    
    // 저글러
    jugglingCtx.fillStyle = '#e74c3c';
    jugglingCtx.fillRect(juggler.x - juggler.width/2, juggler.y - juggler.height, juggler.width, juggler.height);
    
    // 저글러 머리
    jugglingCtx.fillStyle = '#f39c12';
    jugglingCtx.beginPath();
    jugglingCtx.arc(juggler.x, juggler.y - juggler.height - 15, 15, 0, Math.PI * 2);
    jugglingCtx.fill();
    
    // 공들
    balls.forEach(ball => {
        jugglingCtx.fillStyle = ball.color;
        jugglingCtx.beginPath();
        jugglingCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        jugglingCtx.fill();
        
        // 반짝임 효과
        jugglingCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        jugglingCtx.beginPath();
        jugglingCtx.arc(ball.x - 5, ball.y - 5, 5, 0, Math.PI * 2);
        jugglingCtx.fill();
    });
}

function updateJugglingDisplay() {
    document.getElementById('jugglingScore').textContent = jugglingScore;
    document.getElementById('ballCount').textContent = balls.length;
    document.getElementById('jugglingCombo').textContent = jugglingCombo;
}

// 마우스 이벤트 (저글링)
document.addEventListener('mousemove', (e) => {
    if (currentGame === 'juggling' && jugglingRunning) {
        const rect = jugglingCanvas.getBoundingClientRect();
        juggler.x = e.clientX - rect.left;
    }
});

// ===========================================
// 3. 줄타기 게임
// ===========================================

let tightropeRunning = false;
let tightropeDistance = 0;
let balance = 50;
let walkSpeed = 0;
let tightropeCanvas, tightropeCtx;
let walker = { x: 50, y: 200, tilt: 0 };
let keys = {};

function initTightrope() {
    tightropeCanvas = document.getElementById('tightropeCanvas');
    tightropeCtx = tightropeCanvas.getContext('2d');
    resetTightrope();
}

function startTightrope() {
    tightropeRunning = true;
    tightropeLoop();
}

function resetTightrope() {
    tightropeRunning = false;
    tightropeDistance = 0;
    balance = 50;
    walkSpeed = 0;
    walker.x = 50;
    walker.tilt = 0;
    updateTightropeDisplay();
}

function tightropeLoop() {
    if (!tightropeRunning) return;
    
    updateTightrope();
    drawTightrope();
    
    requestAnimationFrame(tightropeLoop);
}

function updateTightrope() {
    // 균형 변화
    balance += (Math.random() - 0.5) * 2;
    
    // 키 입력에 따른 균형 조절
    if (keys.KeyA) {
        balance += 3;
        walkSpeed += 0.1;
    }
    if (keys.KeyD) {
        balance -= 3;
        walkSpeed += 0.1;
    }
    
    // 균형 제한
    balance = Math.max(0, Math.min(100, balance));
    
    // 걷기 속도 계산
    const balanceFromCenter = Math.abs(balance - 50);
    walkSpeed = Math.max(0, 2 - balanceFromCenter * 0.05);
    
    // 앞으로 이동
    walker.x += walkSpeed;
    tightropeDistance += walkSpeed * 0.1;
    
    // 기울기 계산
    walker.tilt = (balance - 50) * 0.02;
    
    // 떨어짐 확인
    if (balance <= 5 || balance >= 95) {
        tightropeRunning = false;
    }
    
    // 성공 확인
    if (walker.x >= tightropeCanvas.width - 50) {
        tightropeRunning = false;
        alert('성공! 줄타기를 완주했습니다!');
    }
    
    updateTightropeDisplay();
}

function drawTightrope() {
    // 배경
    tightropeCtx.fillStyle = '#87CEEB';
    tightropeCtx.fillRect(0, 0, tightropeCanvas.width, tightropeCanvas.height);
    
    // 줄
    tightropeCtx.strokeStyle = '#8B4513';
    tightropeCtx.lineWidth = 5;
    tightropeCtx.beginPath();
    tightropeCtx.moveTo(0, 250);
    tightropeCtx.lineTo(tightropeCanvas.width, 250);
    tightropeCtx.stroke();
    
    // 줄타기 선수
    tightropeCtx.save();
    tightropeCtx.translate(walker.x, walker.y);
    tightropeCtx.rotate(walker.tilt);
    
    // 몸체
    tightropeCtx.fillStyle = '#e74c3c';
    tightropeCtx.fillRect(-10, 0, 20, 40);
    
    // 머리
    tightropeCtx.fillStyle = '#f39c12';
    tightropeCtx.beginPath();
    tightropeCtx.arc(0, -10, 10, 0, Math.PI * 2);
    tightropeCtx.fill();
    
    // 균형봉
    tightropeCtx.strokeStyle = '#FFD700';
    tightropeCtx.lineWidth = 3;
    tightropeCtx.beginPath();
    tightropeCtx.moveTo(-30, 10);
    tightropeCtx.lineTo(30, 10);
    tightropeCtx.stroke();
    
    tightropeCtx.restore();
    
    // 균형 표시기
    const balanceBarWidth = 200;
    const balanceBarX = tightropeCanvas.width - balanceBarWidth - 20;
    const balanceBarY = 20;
    
    tightropeCtx.fillStyle = '#333';
    tightropeCtx.fillRect(balanceBarX, balanceBarY, balanceBarWidth, 20);
    
    const balanceIndicatorX = balanceBarX + (balance / 100) * balanceBarWidth;
    tightropeCtx.fillStyle = balance > 30 && balance < 70 ? '#2ecc71' : '#e74c3c';
    tightropeCtx.fillRect(balanceIndicatorX - 5, balanceBarY - 5, 10, 30);
}

function updateTightropeDisplay() {
    document.getElementById('tightropeDistance').textContent = Math.floor(tightropeDistance);
    document.getElementById('balance').textContent = Math.floor(balance);
    document.getElementById('walkSpeed').textContent = walkSpeed.toFixed(1);
}

// 키보드 이벤트 (줄타기)
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// ===========================================
// 4. 동물 조련 게임
// ===========================================

let animalRunning = false;
let animalScore = 0;
let animalLevel = 1;
let animalTime = 30;
let animalCanvas, animalCtx;
let animals = [];
let commands = [];

function initAnimals() {
    animalCanvas = document.getElementById('animalCanvas');
    animalCtx = animalCanvas.getContext('2d');
    resetAnimals();
}

function startAnimals() {
    animalRunning = true;
    animalTime = 30;
    
    // 동물들 생성
    animals = [
        { type: 'lion', x: 150, y: 300, action: 'idle', actionTime: 0, emoji: '🦁' },
        { type: 'elephant', x: 300, y: 300, action: 'idle', actionTime: 0, emoji: '🐘' },
        { type: 'bear', x: 450, y: 300, action: 'idle', actionTime: 0, emoji: '🐻' }
    ];
    
    animalLoop();
    
    // 타이머
    const timer = setInterval(() => {
        animalTime--;
        if (animalTime <= 0 || !animalRunning) {
            clearInterval(timer);
            animalRunning = false;
        }
        updateAnimalDisplay();
    }, 1000);
}

function resetAnimals() {
    animalRunning = false;
    animalScore = 0;
    animalLevel = 1;
    animalTime = 30;
    animals = [];
    commands = [];
    updateAnimalDisplay();
}

function animalLoop() {
    if (!animalRunning) return;
    
    updateAnimals();
    drawAnimals();
    
    requestAnimationFrame(animalLoop);
}

function updateAnimals() {
    animals.forEach(animal => {
        if (animal.actionTime > 0) {
            animal.actionTime--;
            if (animal.actionTime <= 0) {
                animal.action = 'idle';
            }
        }
    });
    
    // 명령 처리
    commands.forEach((command, index) => {
        command.time--;
        if (command.time <= 0) {
            commands.splice(index, 1);
        }
    });
}

function drawAnimals() {
    // 배경
    animalCtx.fillStyle = '#8B4513';
    animalCtx.fillRect(0, 0, animalCanvas.width, animalCanvas.height);
    
    // 무대
    animalCtx.fillStyle = '#DAA520';
    animalCtx.fillRect(50, 250, animalCanvas.width - 100, 100);
    
    // 동물들
    animals.forEach(animal => {
        animalCtx.font = '40px Arial';
        animalCtx.textAlign = 'center';
        
        let y = animal.y;
        if (animal.action === 'jump') {
            y -= Math.sin(animal.actionTime * 0.3) * 30;
        } else if (animal.action === 'spin') {
            animalCtx.save();
            animalCtx.translate(animal.x, animal.y);
            animalCtx.rotate(animal.actionTime * 0.2);
            animalCtx.fillText(animal.emoji, 0, 0);
            animalCtx.restore();
            return;
        }
        
        animalCtx.fillText(animal.emoji, animal.x, y);
        
        // 액션 표시
        if (animal.action !== 'idle') {
            animalCtx.font = '16px Comic Sans MS';
            animalCtx.fillStyle = '#FFD700';
            animalCtx.fillText(animal.action.toUpperCase() + '!', animal.x, y - 60);
        }
    });
    
    // 명령 표시
    commands.forEach((command, index) => {
        animalCtx.font = '20px Comic Sans MS';
        animalCtx.fillStyle = '#FF6B6B';
        animalCtx.fillText(command.text, 50, 50 + index * 25);
    });
}

function commandJump() {
    if (!animalRunning) return;
    
    const lion = animals.find(a => a.type === 'lion');
    if (lion && lion.action === 'idle') {
        lion.action = 'jump';
        lion.actionTime = 60;
        animalScore += 10;
        commands.push({ text: '🦁 점프 성공!', time: 60 });
        updateAnimalDisplay();
    }
}

function commandSpin() {
    if (!animalRunning) return;
    
    const elephant = animals.find(a => a.type === 'elephant');
    if (elephant && elephant.action === 'idle') {
        elephant.action = 'spin';
        elephant.actionTime = 120;
        animalScore += 15;
        commands.push({ text: '🐘 회전 성공!', time: 60 });
        updateAnimalDisplay();
    }
}

function commandDance() {
    if (!animalRunning) return;
    
    const bear = animals.find(a => a.type === 'bear');
    if (bear && bear.action === 'idle') {
        bear.action = 'dance';
        bear.actionTime = 90;
        animalScore += 12;
        commands.push({ text: '🐻 춤 성공!', time: 60 });
        updateAnimalDisplay();
    }
}

function updateAnimalDisplay() {
    document.getElementById('animalScore').textContent = animalScore;
    document.getElementById('animalLevel').textContent = animalLevel;
    document.getElementById('animalTime').textContent = animalTime;
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 게임 선택 화면 표시
    document.getElementById('gameSelection').style.display = 'block';
});