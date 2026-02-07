// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 모바일 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 캔버스 크기 조정
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight * 0.6);
    
    // 정사각형 유지
    const size = Math.min(maxWidth, maxHeight);
    
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // 실제 캔버스 크기는 고정 (렌더링 품질 유지)
    canvas.width = 600;
    canvas.height = 600;
}

// 게임 상태
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let lives = 3;
let bestScore = localStorage.getItem('pacmanBestScore') || 0;

// 게임 설정
const CELL_SIZE = 20;
const ROWS = 30;
const COLS = 30;

// 미로 맵 (1: 벽, 0: 빈공간, 2: 점, 3: 파워펠릿)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,2,1,1,2,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 팩맨 객체
const pacman = {
    x: 14,
    y: 15,
    direction: 0, // 0: 정지, 1: 위, 2: 아래, 3: 왼쪽, 4: 오른쪽
    nextDirection: 0,
    mouthOpen: true,
    mouthTimer: 0
};

// 유령 객체들
const ghosts = [
    { x: 14, y: 9, direction: 1, color: '#FF0000', mode: 'chase', modeTimer: 0 },
    { x: 13, y: 9, direction: 2, color: '#FFB8FF', mode: 'chase', modeTimer: 0 },
    { x: 15, y: 9, direction: 3, color: '#00FFFF', mode: 'chase', modeTimer: 0 },
    { x: 16, y: 9, direction: 4, color: '#FFB852', mode: 'chase', modeTimer: 0 }
];

// 파워 모드
let powerMode = false;
let powerTimer = 0;
const POWER_DURATION = 300; // 5초 (60fps 기준)

// 모바일 컨트롤
let mobileControls = {
    up: false,
    down: false,
    left: false,
    right: false
};

// 키보드 입력
const keys = {};

// 게임 초기화
function initGame() {
    // 팩맨 초기 위치
    pacman.x = 14;
    pacman.y = 15;
    pacman.direction = 0;
    pacman.nextDirection = 0;
    
    // 유령 초기 위치
    ghosts[0] = { x: 14, y: 9, direction: 1, color: '#FF0000', mode: 'chase', modeTimer: 0 };
    ghosts[1] = { x: 13, y: 9, direction: 2, color: '#FFB8FF', mode: 'chase', modeTimer: 0 };
    ghosts[2] = { x: 15, y: 9, direction: 3, color: '#00FFFF', mode: 'chase', modeTimer: 0 };
    ghosts[3] = { x: 16, y: 9, direction: 4, color: '#FFB852', mode: 'chase', modeTimer: 0 };
    
    powerMode = false;
    powerTimer = 0;
}

// 미로 그리기
function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (maze[row][col] === 1) {
                // 벽
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                ctx.strokeStyle = '#4040FF';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            } else if (maze[row][col] === 2) {
                // 점
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (maze[row][col] === 3) {
                // 파워 펠릿
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// 팩맨 그리기
function drawPacman() {
    const x = pacman.x * CELL_SIZE + CELL_SIZE/2;
    const y = pacman.y * CELL_SIZE + CELL_SIZE/2;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    if (pacman.mouthOpen) {
        let startAngle = 0;
        let endAngle = Math.PI * 2;
        
        // 방향에 따른 입 각도
        if (pacman.direction === 4) { // 오른쪽
            startAngle = Math.PI * 0.2;
            endAngle = Math.PI * 1.8;
        } else if (pacman.direction === 3) { // 왼쪽
            startAngle = Math.PI * 1.2;
            endAngle = Math.PI * 0.8;
        } else if (pacman.direction === 1) { // 위
            startAngle = Math.PI * 1.7;
            endAngle = Math.PI * 1.3;
        } else if (pacman.direction === 2) { // 아래
            startAngle = Math.PI * 0.7;
            endAngle = Math.PI * 0.3;
        }
        
        ctx.arc(x, y, CELL_SIZE/2 - 2, startAngle, endAngle);
        ctx.lineTo(x, y);
    } else {
        ctx.arc(x, y, CELL_SIZE/2 - 2, 0, Math.PI * 2);
    }
    
    ctx.fill();
    
    // 눈
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
}

// 유령 그리기
function drawGhosts() {
    ghosts.forEach(ghost => {
        const x = ghost.x * CELL_SIZE + CELL_SIZE/2;
        const y = ghost.y * CELL_SIZE + CELL_SIZE/2;
        
        // 파워 모드일 때 색상 변경
        if (powerMode) {
            ctx.fillStyle = '#0000FF';
        } else {
            ctx.fillStyle = ghost.color;
        }
        
        // 유령 몸체
        ctx.beginPath();
        ctx.arc(x, y - 2, CELL_SIZE/2 - 2, Math.PI, 0);
        ctx.rect(x - CELL_SIZE/2 + 2, y - 2, CELL_SIZE - 4, CELL_SIZE/2);
        ctx.fill();
        
        // 유령 하단 지그재그
        ctx.beginPath();
        ctx.moveTo(x - CELL_SIZE/2 + 2, y + CELL_SIZE/2 - 2);
        for (let i = 0; i < 4; i++) {
            const zigX = x - CELL_SIZE/2 + 2 + (i * (CELL_SIZE - 4) / 4);
            const zigY = y + CELL_SIZE/2 - 2 + (i % 2 === 0 ? -4 : 0);
            ctx.lineTo(zigX, zigY);
        }
        ctx.lineTo(x + CELL_SIZE/2 - 2, y + CELL_SIZE/2 - 2);
        ctx.lineTo(x + CELL_SIZE/2 - 2, y - 2);
        ctx.fill();
        
        // 눈
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x - 4, y - 4, 1, 0, Math.PI * 2);
        ctx.arc(x + 4, y - 4, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 이동 가능 여부 확인
function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return maze[y][x] !== 1;
}

// 팩맨 업데이트
function updatePacman() {
    // 입 애니메이션
    pacman.mouthTimer++;
    if (pacman.mouthTimer > 10) {
        pacman.mouthOpen = !pacman.mouthOpen;
        pacman.mouthTimer = 0;
    }
    
    // 방향 변경 시도
    if (pacman.nextDirection !== 0) {
        let newX = pacman.x;
        let newY = pacman.y;
        
        if (pacman.nextDirection === 1) newY--; // 위
        else if (pacman.nextDirection === 2) newY++; // 아래
        else if (pacman.nextDirection === 3) newX--; // 왼쪽
        else if (pacman.nextDirection === 4) newX++; // 오른쪽
        
        if (canMove(newX, newY)) {
            pacman.direction = pacman.nextDirection;
            pacman.nextDirection = 0;
        }
    }
    
    // 이동
    if (pacman.direction !== 0) {
        let newX = pacman.x;
        let newY = pacman.y;
        
        if (pacman.direction === 1) newY--; // 위
        else if (pacman.direction === 2) newY++; // 아래
        else if (pacman.direction === 3) newX--; // 왼쪽
        else if (pacman.direction === 4) newX++; // 오른쪽
        
        // 터널 효과 (좌우 끝에서 반대편으로)
        if (newX < 0) newX = COLS - 1;
        else if (newX >= COLS) newX = 0;
        
        if (canMove(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
            
            // 점 먹기
            if (maze[pacman.y][pacman.x] === 2) {
                maze[pacman.y][pacman.x] = 0;
                score += 10;
                
                // 모든 점을 먹었는지 확인
                if (checkLevelComplete()) {
                    nextLevel();
                }
            }
            // 파워 펠릿 먹기
            else if (maze[pacman.y][pacman.x] === 3) {
                maze[pacman.y][pacman.x] = 0;
                score += 50;
                powerMode = true;
                powerTimer = POWER_DURATION;
            }
        } else {
            pacman.direction = 0; // 벽에 부딪히면 정지
        }
    }
}

// 유령 업데이트
function updateGhosts() {
    ghosts.forEach(ghost => {
        // 간단한 AI: 랜덤하게 방향 변경
        if (Math.random() < 0.1) {
            const directions = [1, 2, 3, 4];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
        
        let newX = ghost.x;
        let newY = ghost.y;
        
        if (ghost.direction === 1) newY--; // 위
        else if (ghost.direction === 2) newY++; // 아래
        else if (ghost.direction === 3) newX--; // 왼쪽
        else if (ghost.direction === 4) newX++; // 오른쪽
        
        // 터널 효과
        if (newX < 0) newX = COLS - 1;
        else if (newX >= COLS) newX = 0;
        
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        } else {
            // 벽에 부딪히면 반대 방향으로
            if (ghost.direction === 1) ghost.direction = 2;
            else if (ghost.direction === 2) ghost.direction = 1;
            else if (ghost.direction === 3) ghost.direction = 4;
            else if (ghost.direction === 4) ghost.direction = 3;
        }
    });
}

// 충돌 검사
function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        if (pacman.x === ghost.x && pacman.y === ghost.y) {
            if (powerMode) {
                // 유령을 잡음
                score += 200;
                // 유령을 원래 위치로 되돌림
                ghost.x = 14 + (index - 1.5);
                ghost.y = 9;
            } else {
                // 팩맨이 죽음
                lives--;
                if (lives <= 0) {
                    gameOver();
                } else {
                    // 팩맨을 원래 위치로
                    pacman.x = 14;
                    pacman.y = 15;
                    pacman.direction = 0;
                }
            }
        }
    });
}

// 레벨 완료 확인
function checkLevelComplete() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 2 || maze[row][col] === 3) {
                return false;
            }
        }
    }
    return true;
}

// 다음 레벨
function nextLevel() {
    level++;
    // 미로 리셋 (간단히 점들만 다시 배치)
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 0) {
                // 빈 공간에 점 배치 (일부만)
                if (Math.random() < 0.7) {
                    maze[row][col] = 2;
                }
            }
        }
    }
    
    // 파워 펠릿 재배치
    maze[2][1] = 3;
    maze[2][28] = 3;
    maze[15][1] = 3;
    maze[15][28] = 3;
    
    initGame();
}

// 게임 업데이트
function update() {
    if (!gameRunning || gamePaused) return;
    
    updatePacman();
    updateGhosts();
    checkCollisions();
    
    // 파워 모드 타이머
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
        }
    }
    
    updateDisplay();
}

// 게임 그리기
function draw() {
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMaze();
    drawPacman();
    drawGhosts();
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
        localStorage.setItem('pacmanBestScore', bestScore);
        document.getElementById('newRecord').style.display = 'block';
    } else {
        document.getElementById('newRecord').style.display = 'none';
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOver').style.display = 'block';
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('bestScore').textContent = bestScore;
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
    level = 1;
    lives = 3;
    
    // 미로 초기화
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 0) {
                maze[row][col] = 2; // 빈 공간을 점으로
            }
        }
    }
    
    initGame();
    document.getElementById('gameOver').style.display = 'none';
    updateDisplay();
    draw(); // 초기 화면 그리기
}

// 키보드 이벤트
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (gameRunning && !gamePaused) {
        if (e.code === 'ArrowUp') {
            pacman.nextDirection = 1;
            e.preventDefault();
        } else if (e.code === 'ArrowDown') {
            pacman.nextDirection = 2;
            e.preventDefault();
        } else if (e.code === 'ArrowLeft') {
            pacman.nextDirection = 3;
            e.preventDefault();
        } else if (e.code === 'ArrowRight') {
            pacman.nextDirection = 4;
            e.preventDefault();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// 모바일 버튼 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    if (upBtn) {
        upBtn.addEventListener('touchstart', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 1;
        }, { passive: true });
        upBtn.addEventListener('click', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 1;
        });
    }
    
    if (downBtn) {
        downBtn.addEventListener('touchstart', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 2;
        }, { passive: true });
        downBtn.addEventListener('click', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 2;
        });
    }
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 3;
        }, { passive: true });
        leftBtn.addEventListener('click', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 3;
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 4;
        }, { passive: true });
        rightBtn.addEventListener('click', () => {
            if (gameRunning && !gamePaused) pacman.nextDirection = 4;
        });
    }
});

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// 초기화
resizeCanvas();
initGame();
updateDisplay();
draw();