// 게임 상태
let puzzle = [];
let emptyPos = { row: 3, col: 3 };
let moves = 0;
let startTime = null;
let gameTimer = null;
let currentDifficulty = 'easy';
let shuffleCount = { easy: 10, medium: 50, hard: 100 };

// DOM 요소들
const puzzleGrid = document.getElementById('puzzleGrid');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const difficultyDisplay = document.getElementById('difficulty');
const winMessage = document.getElementById('winMessage');

// 퍼즐 초기화
function initPuzzle() {
    puzzle = [];
    for (let row = 0; row < 4; row++) {
        puzzle[row] = [];
        for (let col = 0; col < 4; col++) {
            if (row === 3 && col === 3) {
                puzzle[row][col] = 0; // 빈 칸
            } else {
                puzzle[row][col] = row * 4 + col + 1;
            }
        }
    }
    emptyPos = { row: 3, col: 3 };
    moves = 0;
    startTime = null;
    updateDisplay();
    renderPuzzle();
}

// 퍼즐 렌더링
function renderPuzzle() {
    puzzleGrid.innerHTML = '';
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const tile = document.createElement('button');
            tile.className = 'puzzle-tile';
            
            if (puzzle[row][col] === 0) {
                tile.className += ' empty';
                tile.textContent = '';
            } else {
                tile.textContent = puzzle[row][col];
                
                // 이동 가능한 타일 표시
                if (isMoveable(row, col)) {
                    tile.className += ' moveable';
                }
                
                tile.onclick = () => moveTile(row, col);
            }
            
            puzzleGrid.appendChild(tile);
        }
    }
}

// 타일이 이동 가능한지 확인
function isMoveable(row, col) {
    const emptyRow = emptyPos.row;
    const emptyCol = emptyPos.col;
    
    return (
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
}

// 타일 이동
function moveTile(row, col) {
    if (!isMoveable(row, col)) return;
    
    // 게임 시작 시간 기록
    if (startTime === null) {
        startTime = Date.now();
        startTimer();
    }
    
    // 타일과 빈 칸 위치 교환
    puzzle[emptyPos.row][emptyPos.col] = puzzle[row][col];
    puzzle[row][col] = 0;
    emptyPos = { row, col };
    
    moves++;
    updateDisplay();
    renderPuzzle();
    
    // 승리 조건 확인
    if (checkWin()) {
        setTimeout(() => {
            showWinMessage();
        }, 300);
    }
}

// 승리 조건 확인
function checkWin() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const expectedValue = row === 3 && col === 3 ? 0 : row * 4 + col + 1;
            if (puzzle[row][col] !== expectedValue) {
                return false;
            }
        }
    }
    return true;
}

// 퍼즐 섞기
function shufflePuzzle() {
    const shuffles = shuffleCount[currentDifficulty];
    
    for (let i = 0; i < shuffles; i++) {
        const moveableTiles = [];
        
        // 이동 가능한 타일들 찾기
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (puzzle[row][col] !== 0 && isMoveable(row, col)) {
                    moveableTiles.push({ row, col });
                }
            }
        }
        
        // 랜덤하게 하나 선택해서 이동
        if (moveableTiles.length > 0) {
            const randomTile = moveableTiles[Math.floor(Math.random() * moveableTiles.length)];
            
            // 실제 이동 (moves 카운트 없이)
            puzzle[emptyPos.row][emptyPos.col] = puzzle[randomTile.row][randomTile.col];
            puzzle[randomTile.row][randomTile.col] = 0;
            emptyPos = { row: randomTile.row, col: randomTile.col };
        }
    }
    
    // 게임 상태 리셋
    moves = 0;
    startTime = null;
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    updateDisplay();
    renderPuzzle();
}

// 해답 보기 (자동 해결)
function solvePuzzle() {
    if (confirm('해답을 보시겠습니까? 현재 게임이 초기화됩니다.')) {
        initPuzzle();
    }
}

// 새 게임
function newGame() {
    initPuzzle();
    shufflePuzzle();
}

// 난이도 설정
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    difficultyDisplay.textContent = {
        easy: '쉬움',
        medium: '보통',
        hard: '어려움'
    }[difficulty];
}

// 타이머 시작
function startTimer() {
    gameTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 디스플레이 업데이트
function updateDisplay() {
    movesDisplay.textContent = moves;
    if (startTime === null) {
        timeDisplay.textContent = '00:00';
    }
}

// 승리 메시지 표시
function showWinMessage() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    const finalTime = startTime ? Date.now() - startTime : 0;
    const minutes = Math.floor(finalTime / 60000);
    const seconds = Math.floor((finalTime % 60000) / 1000);
    
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('finalTime').textContent = `${minutes}분 ${seconds}초`;
    
    winMessage.style.display = 'block';
    
    // 축하 효과
    createCelebration();
    
    // 5초 후 메시지 숨기기
    setTimeout(() => {
        winMessage.style.display = 'none';
    }, 5000);
}

// 축하 효과
function createCelebration() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1001';
            confetti.style.animation = `fall ${Math.random() * 2 + 3}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 50);
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        0% { 
            transform: translateY(-10px) rotate(0deg); 
            opacity: 1; 
        }
        100% { 
            transform: translateY(100vh) rotate(360deg); 
            opacity: 0; 
        }
    }
`;
document.head.appendChild(style);

// 키보드 조작 지원
document.addEventListener('keydown', (e) => {
    if (!startTime) return; // 게임이 시작되지 않았으면 무시
    
    let targetRow = emptyPos.row;
    let targetCol = emptyPos.col;
    
    switch(e.key) {
        case 'ArrowUp':
            targetRow = emptyPos.row + 1;
            break;
        case 'ArrowDown':
            targetRow = emptyPos.row - 1;
            break;
        case 'ArrowLeft':
            targetCol = emptyPos.col + 1;
            break;
        case 'ArrowRight':
            targetCol = emptyPos.col - 1;
            break;
        default:
            return;
    }
    
    // 유효한 위치인지 확인
    if (targetRow >= 0 && targetRow < 4 && targetCol >= 0 && targetCol < 4) {
        moveTile(targetRow, targetCol);
    }
    
    e.preventDefault();
});

// 게임 초기화
initPuzzle();