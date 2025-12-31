// 게임 데이터
const questions = [
    { emoji: '🐶', answers: ['강아지', '개', '멍멍이', '고양이'], correct: 0 },
    { emoji: '🐱', answers: ['고양이', '강아지', '토끼', '햄스터'], correct: 0 },
    { emoji: '🍎', answers: ['사과', '오렌지', '바나나', '포도'], correct: 0 },
    { emoji: '🚗', answers: ['자동차', '기차', '비행기', '배'], correct: 0 },
    { emoji: '🌞', answers: ['태양', '달', '별', '구름'], correct: 0 },
    { emoji: '🏠', answers: ['집', '학교', '병원', '상점'], correct: 0 },
    { emoji: '📚', answers: ['책', '연필', '지우개', '가방'], correct: 0 },
    { emoji: '⚽', answers: ['축구공', '농구공', '야구공', '테니스공'], correct: 0 },
    { emoji: '🎂', answers: ['케이크', '빵', '쿠키', '도넛'], correct: 0 },
    { emoji: '🌸', answers: ['꽃', '나무', '풀', '잎'], correct: 0 },
    { emoji: '🐟', answers: ['물고기', '새', '나비', '벌'], correct: 0 },
    { emoji: '🎵', answers: ['음악', '그림', '춤', '노래'], correct: 0 },
    { emoji: '⭐', answers: ['별', '태양', '달', '구름'], correct: 0 },
    { emoji: '🍕', answers: ['피자', '햄버거', '치킨', '파스타'], correct: 0 },
    { emoji: '🎈', answers: ['풍선', '공', '비누방울', '구름'], correct: 0 }
];

// 게임 상태
let gameRunning = false;
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let timeLeft = 15;
let timer;
let currentQuestion;
let totalQuestions = 10;

// DOM 요소들
const drawingArea = document.getElementById('drawingArea');
const questionText = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const resultMessage = document.getElementById('resultMessage');
const timerDisplay = document.getElementById('timer');

// 게임 시작
function startGame() {
    gameRunning = true;
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    
    // 문제 섞기
    shuffleArray(questions);
    
    updateStats();
    nextQuestion();
}

// 배열 섞기 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 다음 문제
function nextQuestion() {
    if (!gameRunning) return;
    
    if (currentQuestionIndex >= totalQuestions) {
        endGame();
        return;
    }
    
    currentQuestion = questions[currentQuestionIndex];
    
    // 선택지 섞기
    const shuffledAnswers = [...currentQuestion.answers];
    shuffleArray(shuffledAnswers);
    
    // 정답 인덱스 찾기
    const correctAnswer = currentQuestion.answers[currentQuestion.correct];
    const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer);
    
    // UI 업데이트
    drawingArea.textContent = currentQuestion.emoji;
    drawingArea.style.animation = 'bounceIn 0.6s ease';
    
    // 선택지 생성
    optionsContainer.innerHTML = '';
    shuffledAnswers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = answer;
        button.onclick = () => selectAnswer(index, newCorrectIndex);
        optionsContainer.appendChild(button);
    });
    
    // 결과 메시지 숨기기
    resultMessage.style.display = 'none';
    
    // 타이머 시작
    startTimer();
    
    // 통계 업데이트
    updateStats();
}

// 답 선택
function selectAnswer(selectedIndex, correctIndex) {
    if (!gameRunning) return;
    
    clearInterval(timer);
    
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === correctIndex;
    
    if (isCorrect) {
        buttons[selectedIndex].classList.add('correct');
        score += 10 + streak; // 연속 정답 보너스
        streak++;
        showResult('정답입니다! 🎉', 'correct');
        
        // 축하 효과
        createConfetti();
    } else {
        buttons[selectedIndex].classList.add('wrong');
        buttons[correctIndex].classList.add('correct');
        streak = 0;
        showResult('틀렸습니다! 😅 정답은 "' + questions[currentQuestionIndex].answers[questions[currentQuestionIndex].correct] + '"입니다.', 'wrong');
    }
    
    // 버튼 비활성화
    buttons.forEach(btn => btn.onclick = null);
    
    currentQuestionIndex++;
    updateStats();
    
    // 2초 후 다음 문제
    setTimeout(() => {
        if (gameRunning) {
            nextQuestion();
        }
    }, 2000);
}

// 타이머 시작
function startTimer() {
    timeLeft = 15;
    updateTimer();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            selectAnswer(-1, 0); // 시간 초과로 오답 처리
        }
    }, 1000);
}

// 타이머 업데이트
function updateTimer() {
    timerDisplay.textContent = `시간: ${timeLeft}초`;
    timerDisplay.style.color = timeLeft <= 5 ? '#e74c3c' : '#333';
    
    if (timeLeft <= 5) {
        timerDisplay.style.animation = 'pulse 0.5s infinite';
    } else {
        timerDisplay.style.animation = 'none';
    }
}

// 결과 메시지 표시
function showResult(message, type) {
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${type}`;
    resultMessage.style.display = 'block';
}

// 통계 업데이트
function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('streak').textContent = streak;
}

// 게임 종료
function endGame() {
    gameRunning = false;
    clearInterval(timer);
    
    const percentage = (score / (totalQuestions * 10)) * 100;
    let message = `게임 완료! 🎊\n최종 점수: ${score}점\n정답률: ${percentage.toFixed(1)}%`;
    
    if (percentage >= 90) {
        message += '\n🏆 완벽해요!';
    } else if (percentage >= 70) {
        message += '\n🌟 잘했어요!';
    } else if (percentage >= 50) {
        message += '\n👍 괜찮아요!';
    } else {
        message += '\n💪 다시 도전해보세요!';
    }
    
    drawingArea.textContent = '🎯';
    questionText.textContent = '게임 완료!';
    optionsContainer.innerHTML = '';
    showResult(message, percentage >= 70 ? 'correct' : 'wrong');
    timerDisplay.textContent = '';
}

// 게임 리셋
function resetGame() {
    gameRunning = false;
    clearInterval(timer);
    currentQuestionIndex = 0;
    score = 0;
    streak = 0;
    
    drawingArea.textContent = '🎯';
    questionText.textContent = '이 그림은 무엇일까요?';
    optionsContainer.innerHTML = '';
    resultMessage.style.display = 'none';
    timerDisplay.textContent = '시간: 15초';
    
    updateStats();
}

// 축하 효과 (간단한 애니메이션)
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '1000';
            confetti.style.animation = 'fall 3s linear forwards';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes fall {
        0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 초기화
updateStats();