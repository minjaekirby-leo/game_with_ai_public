// 게임 상태
let gameRunning = false;
let level = 1;
let score = 0;
let streak = 0;
let mana = 100;
let currentPattern = [];
let playerInput = [];
let showingPattern = false;
let learnedSpells = [];

// 원소 정보
const elements = {
    fire: { symbol: '🔥', name: '불', color: '#ff5722' },
    water: { symbol: '💧', name: '물', color: '#2196f3' },
    earth: { symbol: '🌍', name: '땅', color: '#795548' },
    air: { symbol: '💨', name: '바람', color: '#9e9e9e' },
    light: { symbol: '✨', name: '빛', color: '#ffeb3b' },
    dark: { symbol: '🌑', name: '어둠', color: '#424242' }
};

// 마법 주문 데이터베이스
const spellDatabase = {
    // 1단계 주문 (1개 원소)
    'fire': { name: '화염구', effect: '적에게 화염 피해를 입힙니다', power: 10 },
    'water': { name: '치유의 물', effect: '체력을 회복합니다', power: 10 },
    'earth': { name: '대지의 방패', effect: '방어력을 증가시킵니다', power: 10 },
    'air': { name: '바람의 속도', effect: '이동 속도를 증가시킵니다', power: 10 },
    'light': { name: '빛의 축복', effect: '모든 능력치를 향상시킵니다', power: 10 },
    'dark': { name: '어둠의 저주', effect: '적의 능력치를 감소시킵니다', power: 10 },
    
    // 2단계 주문 (2개 원소)
    'fire,water': { name: '증기 폭발', effect: '강력한 증기로 광범위 피해', power: 25 },
    'fire,earth': { name: '용암 분출', effect: '용암으로 지속 피해', power: 30 },
    'water,earth': { name: '진흙 �늪', effect: '적의 움직임을 봉쇄', power: 20 },
    'air,fire': { name: '화염 회오리', effect: '회전하는 화염으로 다중 공격', power: 35 },
    'light,dark': { name: '균형의 마법', effect: '모든 상태를 초기화', power: 40 },
    
    // 3단계 주문 (3개 원소)
    'fire,water,earth': { name: '원소의 조화', effect: '모든 원소의 힘을 결합', power: 60 },
    'air,light,dark': { name: '시공간 균열', effect: '차원을 가르는 강력한 마법', power: 80 },
    'fire,air,light': { name: '태양의 분노', effect: '태양의 힘으로 모든 것을 태움', power: 100 }
};

// 게임 시작
function startGame() {
    gameRunning = true;
    level = 1;
    score = 0;
    streak = 0;
    mana = 100;
    playerInput = [];
    learnedSpells = [];
    
    updateDisplay();
    updateWizardMessage('새로운 마법 수련이 시작됩니다!');
    
    setTimeout(() => {
        generateNewPattern();
    }, 1000);
}

// 새로운 패턴 생성
function generateNewPattern() {
    const patternLength = Math.min(level + 1, 6); // 최대 6개까지
    currentPattern = [];
    
    const elementKeys = Object.keys(elements);
    for (let i = 0; i < patternLength; i++) {
        const randomElement = elementKeys[Math.floor(Math.random() * elementKeys.length)];
        currentPattern.push(randomElement);
    }
    
    playerInput = [];
    updatePlayerPattern();
    showPattern();
}

// 패턴 보여주기
function showPattern() {
    if (!gameRunning) return;
    
    showingPattern = true;
    updateWizardMessage('패턴을 잘 기억하세요!');
    
    const spellDisplay = document.getElementById('spellDisplay');
    spellDisplay.innerHTML = '';
    
    const patternContainer = document.createElement('div');
    patternContainer.className = 'spell-pattern';
    
    currentPattern.forEach((element, index) => {
        const symbolElement = document.createElement('div');
        symbolElement.className = `spell-symbol ${element}`;
        symbolElement.textContent = elements[element].symbol;
        patternContainer.appendChild(symbolElement);
        
        // 순차적으로 활성화 애니메이션
        setTimeout(() => {
            symbolElement.classList.add('active');
            playMagicSound(element);
            
            setTimeout(() => {
                symbolElement.classList.remove('active');
            }, 500);
        }, index * 600);
    });
    
    spellDisplay.appendChild(patternContainer);
    
    // 패턴 표시 완료 후
    setTimeout(() => {
        showingPattern = false;
        updateWizardMessage('이제 같은 패턴을 입력해보세요!');
        
        // 패턴을 흐리게 표시
        patternContainer.style.opacity = '0.3';
    }, currentPattern.length * 600 + 1000);
}

// 원소 입력
function inputElement(element) {
    if (!gameRunning || showingPattern) return;
    
    playerInput.push(element);
    updatePlayerPattern();
    playMagicSound(element);
    
    // 입력 완료 확인
    if (playerInput.length === currentPattern.length) {
        setTimeout(() => {
            checkPattern();
        }, 500);
    }
}

// 플레이어 패턴 업데이트
function updatePlayerPattern() {
    const playerPatternElement = document.getElementById('playerPattern');
    playerPatternElement.innerHTML = '';
    
    playerInput.forEach(element => {
        const symbolElement = document.createElement('div');
        symbolElement.className = `spell-symbol ${element}`;
        symbolElement.textContent = elements[element].symbol;
        playerPatternElement.appendChild(symbolElement);
    });
}

// 패턴 확인
function checkPattern() {
    const isCorrect = arraysEqual(currentPattern, playerInput);
    
    if (isCorrect) {
        // 성공
        streak++;
        const baseScore = currentPattern.length * 10;
        const bonusScore = streak * 5;
        score += baseScore + bonusScore;
        mana = Math.min(100, mana + 10);
        
        updateWizardMessage('훌륭합니다! 주문이 성공했습니다! ✨');
        
        // 새로운 주문 학습
        learnSpell(currentPattern);
        
        // 레벨업 확인
        if (streak % 3 === 0) {
            level++;
            updateWizardMessage(`레벨 업! 이제 ${level}레벨 마법사입니다! 🎉`);
        }
        
        // 성공 효과
        createMagicParticles('success');
        
        setTimeout(() => {
            generateNewPattern();
        }, 2000);
        
    } else {
        // 실패
        streak = 0;
        mana = Math.max(0, mana - 20);
        
        updateWizardMessage('주문이 실패했습니다... 다시 시도해보세요! 💥');
        
        // 실패 효과
        createMagicParticles('fail');
        
        // 패턴 다시 보여주기
        setTimeout(() => {
            showPattern();
        }, 2000);
    }
    
    updateDisplay();
}

// 배열 비교
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// 새로운 주문 학습
function learnSpell(pattern) {
    const patternKey = pattern.join(',');
    const spell = spellDatabase[patternKey];
    
    if (spell && !learnedSpells.some(s => s.pattern === patternKey)) {
        learnedSpells.push({
            pattern: patternKey,
            name: spell.name,
            effect: spell.effect,
            power: spell.power,
            elements: pattern.map(e => elements[e].symbol).join(' ')
        });
        
        updateSpellBook();
        updateWizardMessage(`새로운 주문을 배웠습니다: ${spell.name}! 🎓`);
    }
}

// 마법서 업데이트
function updateSpellBook() {
    const spellBook = document.getElementById('spellBook');
    spellBook.innerHTML = '';
    
    learnedSpells.forEach(spell => {
        const spellEntry = document.createElement('div');
        spellEntry.className = 'spell-entry';
        spellEntry.innerHTML = `
            <div>
                <strong>${spell.name}</strong>
                <div style="font-size: 0.8rem; opacity: 0.8;">${spell.effect}</div>
            </div>
            <div>
                <div>${spell.elements}</div>
                <div style="font-size: 0.8rem;">위력: ${spell.power}</div>
            </div>
        `;
        spellBook.appendChild(spellEntry);
    });
    
    if (learnedSpells.length === 0) {
        spellBook.innerHTML = '<div style="opacity: 0.6; text-align: center;">아직 배운 주문이 없습니다</div>';
    }
}

// 주문 시전
function castSpell() {
    if (playerInput.length === 0) {
        updateWizardMessage('먼저 원소를 선택해주세요!');
        return;
    }
    
    const patternKey = playerInput.join(',');
    const spell = spellDatabase[patternKey];
    
    if (spell) {
        if (mana >= spell.power) {
            mana -= spell.power;
            updateWizardMessage(`${spell.name} 시전! ${spell.effect} ⚡`);
            createMagicParticles('cast');
        } else {
            updateWizardMessage('마나가 부족합니다! 💫');
        }
    } else {
        updateWizardMessage('알 수 없는 주문입니다... 🤔');
        mana = Math.max(0, mana - 5);
    }
    
    updateDisplay();
}

// 입력 지우기
function clearInput() {
    playerInput = [];
    updatePlayerPattern();
    updateWizardMessage('입력을 지웠습니다.');
}

// 마법 효과 파티클 생성
function createMagicParticles(type) {
    const colors = {
        success: ['#4caf50', '#8bc34a', '#cddc39'],
        fail: ['#f44336', '#ff5722', '#ff9800'],
        cast: ['#9c27b0', '#e91e63', '#3f51b5']
    };
    
    const particleColors = colors[type] || colors.cast;
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.background = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            document.getElementById('magicEffects').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 3000);
        }, i * 100);
    }
}

// 마법 소리 효과 (시각적 피드백)
function playMagicSound(element) {
    const wizard = document.getElementById('wizard');
    const originalSize = wizard.style.fontSize || '4rem';
    
    wizard.style.fontSize = '4.5rem';
    wizard.style.filter = `drop-shadow(0 0 20px ${elements[element].color})`;
    
    setTimeout(() => {
        wizard.style.fontSize = originalSize;
        wizard.style.filter = 'none';
    }, 200);
}

// 마법사 메시지 업데이트
function updateWizardMessage(message) {
    document.getElementById('wizardMessage').textContent = message;
}

// 디스플레이 업데이트
function updateDisplay() {
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    document.getElementById('mana').textContent = mana;
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (!gameRunning || showingPattern) return;
    
    const keyMap = {
        '1': 'fire',
        '2': 'water',
        '3': 'earth',
        '4': 'air',
        '5': 'light',
        '6': 'dark'
    };
    
    if (keyMap[e.key]) {
        inputElement(keyMap[e.key]);
    } else if (e.key === 'Enter') {
        castSpell();
    } else if (e.key === 'Escape') {
        clearInput();
    } else if (e.key === ' ') {
        e.preventDefault();
        showPattern();
    }
});

// 초기화
function init() {
    updateDisplay();
    updateSpellBook();
    updateWizardMessage('마법 수련을 시작할 준비가 되었습니다!');
    
    // 배경 파티클 생성
    setInterval(() => {
        if (Math.random() < 0.3) {
            createMagicParticles('cast');
        }
    }, 3000);
}

// 페이지 로드 시 초기화
window.addEventListener('load', init);