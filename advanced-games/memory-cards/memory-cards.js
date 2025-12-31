// 게임 상태
let gameRunning = false;
let currentDifficulty = 'easy';
let moves = 0;
let matches = 0;
let totalPairs = 8;
let startTime = null;
let gameTimer = null;
let flippedCards = [];
let cards = [];
let canFlip = true;

// 난이도별 설정
const difficultySettings = {
    easy: { size: 4, pairs: 8 },
    medium: { size: 6, pairs: 18 },
    hard: { size: 8, pairs: 32 }
};

// 카드 이모지들
const cardEmojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
    '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
    '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
    '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎',
    '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡',
    '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅',
    '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪'
];

// DOM 요소들
const cardsGrid = document.getElementById('cardsGrid');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const totalPairsDisplay = document.getElementById('totalPairs');
const timeDisplay = document.getElementById('time');
const winMessage = document.getElementById('winMessage');

// 카드 생성
function createCards() {
    const settings = difficultySettings[currentDifficulty];
    totalPairs = settings.pairs;
    
    // 필요한 만큼의 이모지 선택
    const selectedEmojis = cardEmojis.slice(0, totalPairs);
    
    // 각 이모지를 2개씩 만들어서 카드 배열 생성
    cards = [];
    selectedEmojis.forEach((emoji, index) => {
        cards.push({ id: index, emoji: emoji, matched: false });
        cards.push({ id: index, emoji: emoji, matched: false });
    });
    
    // 카드 섞기
    shuffleArray(cards);
}

// 배열 섞기
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 카드 그리드 렌더링
function renderCards() {
    const settings = difficultySettings[currentDifficulty];
    
    // 그리드 클래스 업데이트
    cardsGrid.className = `cards-grid ${currentDifficulty}`;
    
    // 카드 HTML 생성
    cardsGrid.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.onclick = () => flipCard(index);
        
        cardElement.innerHTML = `
            <div class="card-back">❓</div>
            <div class="card-front">${card.emoji}</div>
        `;
        
        cardsGrid.appendChild(cardElement);
    });
}

// 카드 뒤집기
function flipCard(index) {
    if (!canFlip || !gameRunning) return;
    
    const card = cards[index];
    const cardElement = cardsGrid.children[index];
    
    // 이미 뒤집힌 카드나 매치된 카드는 무시
    if (cardElement.classList.contains('flipped') || card.matched) return;
    
    // 카드 뒤집기
    cardElement.classList.add('flipped');
    flippedCards.push({ index, card, element: cardElement });
    
    // 게임 시작 시간 기록
    if (startTime === null) {
        startTime = Date.now();
        startTimer();
    }
    
    // 2장이 뒤집혔을 때 확인
    if (flippedCards.length === 2) {
        moves++;
        updateDisplay();
        canFlip = false;
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

// 매치 확인
function checkMatch() {
    const [first, second] = flippedCards;
    
    if (first.card.id === second.card.id) {
        // 매치 성공
        first.card.matched = true;
        second.card.matched = true;
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        
        matches++;
        
        // 매치 파티클 효과
        createMatchParticles(first.element);
        createMatchParticles(second.element);
        
        // 승리 조건 확인
        if (matches === totalPairs) {
            setTimeout(() => {
                winGame();
            }, 500);
        }
    } else {
        // 매치 실패
        first.element.classList.add('wrong');
        second.element.classList.add('wrong');
        
        setTimeout(() => {
            first.element.classList.remove('flipped', 'wrong');
            second.element.classList.remove('flipped', 'wrong');
        }, 1000);
    }
    
    flippedCards = [];
    canFlip = true;
    updateDisplay();
}

// 매치 파티클 효과
function createMatchParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = '#2ecc71';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const angle = (i / 10) * Math.PI * 2;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particle.style.animation = `particleFly 1s ease-out forwards`;
        particle.style.setProperty('--vx', vx + 'px');
        particle.style.setProperty('--vy', vy + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
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

// 게임 승리
function winGame() {
    gameRunning = false;
    
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

// 난이도 설정
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    startGame();
}

// 힌트 보기
function showHint() {
    if (!gameRunning || flippedCards.length > 0) return;
    
    // 매치되지 않은 카드 중에서 같은 쌍 찾기
    const unmatchedCards = cards.map((card, index) => ({ card, index }))
                                .filter(item => !item.card.matched);
    
    // 같은 ID를 가진 카드 쌍 찾기
    for (let i = 0; i < unmatchedCards.length; i++) {
        for (let j = i + 1; j < unmatchedCards.length; j++) {
            if (unmatchedCards[i].card.id === unmatchedCards[j].card.id) {
                const firstElement = cardsGrid.children[unmatchedCards[i].index];
                const secondElement = cardsGrid.children[unmatchedCards[j].index];
                
                // 잠깐 하이라이트
                firstElement.style.boxShadow = '0 0 20px #ffff00';
                secondElement.style.boxShadow = '0 0 20px #ffff00';
                
                setTimeout(() => {
                    firstElement.style.boxShadow = '';
                    secondElement.style.boxShadow = '';
                }, 2000);
                
                return;
            }
        }
    }
}

// 카드 섞기
function shuffleCards() {
    if (gameRunning && flippedCards.length === 0) {
        shuffleArray(cards);
        renderCards();
    }
}

// 디스플레이 업데이트
function updateDisplay() {
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;
    totalPairsDisplay.textContent = totalPairs;
}

// 게임 시작
function startGame() {
    gameRunning = true;
    moves = 0;
    matches = 0;
    startTime = null;
    flippedCards = [];
    canFlip = true;
    
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    createCards();
    renderCards();
    updateDisplay();
    timeDisplay.textContent = '00:00';
    winMessage.style.display = 'none';
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFly {
        0% { 
            transform: translate(0, 0) scale(1); 
            opacity: 1; 
        }
        100% { 
            transform: translate(var(--vx), var(--vy)) scale(0); 
            opacity: 0; 
        }
    }
    
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

// 초기화
startGame();