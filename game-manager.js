// 게임 관리 시스템
class GameManager {
    constructor() {
        this.games = this.loadGames();
        this.initializeDefaultGames();
    }

    // 로컬 스토리지에서 게임 데이터 로드
    loadGames() {
        const saved = localStorage.getItem('gameManagerData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            newGames: [],
            bestGames: [],
            allGames: []
        };
    }

    // 게임 데이터 저장
    saveGames() {
        localStorage.setItem('gameManagerData', JSON.stringify(this.games));
    }

    // 기본 게임들 초기화
    initializeDefaultGames() {
        if (this.games.bestGames.length === 0) {
            this.games.bestGames = [
                {
                    id: 'frog-jump',
                    title: '개구리 점프 게임',
                    description: '스페이스바로 점프 파워를 조절해서 연꽃잎에 착지하세요!',
                    icon: '🐸',
                    tech: '물리 시뮬레이션',
                    url: 'advanced-games/frog-jump/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'zombie-survival',
                    title: '좀비 서바이벌',
                    description: '좀비들을 피하면서 무기로 사격하세요!',
                    icon: '🧟‍♂️',
                    tech: '액션 서바이벌',
                    url: 'new-games/zombie-survival/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'chemistry-lab',
                    title: '화학 실험실',
                    description: '원소들을 조합해서 새로운 화합물을 만드세요!',
                    icon: '🧪',
                    tech: '교육용 시뮬레이션',
                    url: 'new-games/chemistry-lab/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'maze-escape',
                    title: '미로 탈출',
                    description: '복잡한 미로에서 출구를 찾아 탈출하세요!',
                    icon: '🌀',
                    tech: '미로 알고리즘',
                    url: 'new-games/maze-escape/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'word-search',
                    title: '단어 찾기',
                    description: '글자 격자에서 숨어있는 단어들을 찾아보세요!',
                    icon: '🔍',
                    tech: '단어 퍼즐',
                    url: 'new-games/word-search/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'superhero',
                    title: '슈퍼히어로 게임',
                    description: '슈퍼히어로가 되어 도시를 구하세요!',
                    icon: '🦸‍♂️',
                    tech: '액션 어드벤처',
                    url: 'new-games/superhero/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'retro-arcade',
                    title: '레트로 아케이드',
                    description: '80년대 아케이드 게임의 향수를 느껴보세요!',
                    icon: '🎮',
                    tech: '레트로 게임',
                    url: 'new-games/retro-arcade/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'trampoline-jump',
                    title: '트램펄린 점프',
                    description: '트램펄린에서 높이 점프해서 공중 묘기를 해보세요!',
                    icon: '🎪',
                    tech: '점프 시뮬레이션',
                    url: 'new-games/trampoline-jump/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'car-parking',
                    title: '자동차 주차',
                    description: '좁은 공간에 자동차를 주차해보세요!',
                    icon: '🚗',
                    tech: '물리 엔진',
                    url: 'new-games/car-parking/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'math-puzzle',
                    title: '수학 퍼즐',
                    description: '다양한 수학 문제를 풀어보세요!',
                    icon: '🧮',
                    tech: '교육용 퍼즐',
                    url: 'new-games/math-puzzle/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'tetris',
                    title: '테트리스',
                    description: '떨어지는 블록들을 회전시키고 배치해서 가로줄을 완성하세요!',
                    icon: '🧩',
                    tech: '클래식 퍼즐 게임',
                    url: 'new-games/tetris/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'flappy-bird',
                    title: '플래피 버드',
                    description: '스페이스바나 클릭으로 새를 날게 해서 파이프 사이를 통과하세요!',
                    icon: '🐦',
                    tech: '물리 시뮬레이션',
                    url: 'new-games/flappy-bird/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'pixel-art-editor',
                    title: '픽셀 아트 에디터',
                    description: '16x16 캔버스에서 픽셀 아트를 그려보세요!',
                    icon: '🎨',
                    tech: '그래픽 에디터',
                    url: 'creative-games/pixel-art-editor/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'tower-defense',
                    title: '타워 디펜스',
                    description: '적들이 기지에 도달하지 못하도록 타워를 설치하여 방어하세요!',
                    icon: '🏰',
                    tech: '전략과 알고리즘',
                    url: 'advanced-games/tower-defense/index.html',
                    addedDate: new Date().toISOString()
                }
            ];
        }

        if (this.games.newGames.length === 0) {
            this.games.newGames = [
                {
                    id: 'pacman',
                    title: '팩맨 게임',
                    description: '클래식 팩맨! 점을 먹고 유령을 피하세요!',
                    icon: '🟡',
                    tech: '클래식 아케이드',
                    url: 'new-games/pacman/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'castle-builder',
                    title: '성 건설',
                    description: '다양한 블록으로 멋진 성을 건설하세요! (무한 블록)',
                    icon: '🏰',
                    tech: '건축 시뮬레이션',
                    url: 'new-games/castle-builder/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'whack-a-mole',
                    title: '두더지 잡기',
                    description: '구멍에서 나오는 두더지를 빠르게 클릭하세요!',
                    icon: '🎯',
                    tech: '반응 속도 게임',
                    url: 'new-games/whack-a-mole/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'mini-rpg',
                    title: '미니 RPG 던전',
                    description: '던전을 탐험하고 몬스터를 물리치며 레벨업하세요!',
                    icon: '🏰',
                    tech: 'RPG 어드벤처',
                    url: 'new-games/mini-rpg/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'platformer',
                    title: '플랫포머 어드벤처',
                    description: '점프하고 달려서 코인을 모으고 골에 도달하세요!',
                    icon: '🎮',
                    tech: '플랫폼 액션',
                    url: 'new-games/platformer/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'fishing-game',
                    title: '낚시 게임',
                    description: '파워를 조절해서 낚시줄을 던지고 물고기를 잡으세요!',
                    icon: '🎣',
                    tech: '타이밍 게임',
                    url: 'new-games/fishing-game/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'ninja-game',
                    title: '닌자 게임',
                    description: '닌자가 되어 적들을 물리치고 임무를 완수하세요!',
                    icon: '🥷',
                    tech: '액션 어드벤처',
                    url: 'new-games/ninja-game/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'wave-surfing',
                    title: '파도타기 서핑',
                    description: '파도를 타면서 장애물을 피하고 트릭을 성공시키세요!',
                    icon: '🌊',
                    tech: '서핑 시뮬레이션',
                    url: 'new-games/wave-surfing/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'theater-stage',
                    title: '연극 무대',
                    description: '배우들을 조종해서 연극 공연을 성공시키세요!',
                    icon: '🎭',
                    tech: '연극 시뮬레이션',
                    url: 'new-games/theater-stage/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'space-exploration',
                    title: '우주 탐험',
                    description: '우주선으로 행성들을 탐험하고 자원을 수집하세요!',
                    icon: '🚀',
                    tech: '우주 시뮬레이션',
                    url: 'new-games/space-exploration/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'beach-volleyball',
                    title: '해변 배구',
                    description: '모래사장에서 배구 경기를 즐겨보세요!',
                    icon: '🏖️',
                    tech: '스포츠 시뮬레이션',
                    url: 'new-games/beach-volleyball/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'bowling',
                    title: '볼링 게임',
                    description: '마우스로 방향과 힘을 조절해서 볼링핀을 쓰러뜨리세요!',
                    icon: '🎳',
                    tech: '물리 시뮬레이션',
                    url: 'new-games/bowling/index.html',
                    addedDate: new Date().toISOString()
                }
            ];
        }

        if (this.games.allGames.length === 0) {
            this.games.allGames = [
                {
                    id: 'bouncing-ball',
                    title: '튀는 공 게임',
                    description: '마우스를 움직여서 공을 따라가보세요!',
                    icon: '🏀',
                    tech: 'p5.js 라이브러리',
                    url: 'p5js-games/bouncing-ball/index.html',
                    addedDate: new Date().toISOString()
                },
                {
                    id: 'snake-game',
                    title: '뱀 게임',
                    description: '화살표 키로 뱀을 조종해서 빨간 사과를 먹어보세요!',
                    icon: '🐍',
                    tech: 'HTML5 Canvas',
                    url: 'canvas-games/snake-game/index.html',
                    addedDate: new Date().toISOString()
                }
            ];
        }

        this.saveGames();
    }

    // 새 게임 추가
    addNewGame(gameData) {
        const newGame = {
            ...gameData,
            id: this.generateId(),
            addedDate: new Date().toISOString()
        };

        this.games.newGames.push(newGame);
        this.saveGames();
        this.updateDisplay();
        
        // 7일 후 자동 이동 설정
        this.scheduleGamePromotion(newGame.id);
        
        return newGame.id;
    }

    // ID 생성
    generateId() {
        return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 7일 후 게임을 베스트 게임으로 이동
    scheduleGamePromotion(gameId) {
        const promotionTime = 7 * 24 * 60 * 60 * 1000; // 7일
        
        setTimeout(() => {
            this.promoteGameToBest(gameId);
        }, promotionTime);
    }

    // 게임을 베스트 게임으로 승격
    promoteGameToBest(gameId) {
        const gameIndex = this.games.newGames.findIndex(game => game.id === gameId);
        if (gameIndex !== -1) {
            const game = this.games.newGames.splice(gameIndex, 1)[0];
            this.games.bestGames.push(game);
            this.saveGames();
            this.updateDisplay();
            
            // 알림 표시
            this.showPromotionNotification(game.title);
        }
    }

    // 승격 알림 표시
    showPromotionNotification(gameTitle) {
        const notification = document.createElement('div');
        notification.className = 'promotion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 게임 승격!</h3>
                <p>"${gameTitle}"이(가) 추천 베스트 게임으로 승격되었습니다!</p>
                <button onclick="this.parentElement.parentElement.remove()">확인</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // 만료된 게임 확인 및 처리
    checkExpiredGames() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        this.games.newGames = this.games.newGames.filter(game => {
            const addedDate = new Date(game.addedDate);
            if (addedDate < sevenDaysAgo) {
                // 베스트 게임으로 이동
                this.games.bestGames.push(game);
                return false;
            }
            return true;
        });

        this.saveGames();
    }

    // 게임 삭제
    removeGame(gameId, category) {
        const gameArray = this.games[category];
        const index = gameArray.findIndex(game => game.id === gameId);
        if (index !== -1) {
            gameArray.splice(index, 1);
            this.saveGames();
            this.updateDisplay();
        }
    }

    // 게임 편집
    editGame(gameId, category, newData) {
        const gameArray = this.games[category];
        const game = gameArray.find(game => game.id === gameId);
        if (game) {
            Object.assign(game, newData);
            this.saveGames();
            this.updateDisplay();
        }
    }

    // 화면 업데이트
    updateDisplay() {
        this.renderNewGames();
        this.renderBestGames();
        this.renderAllGames();
    }

    // 새로운 게임 코너 렌더링
    renderNewGames() {
        const container = document.getElementById('new-games-grid');
        if (!container) return;

        container.innerHTML = '';

        this.games.newGames.forEach(game => {
            const gameCard = this.createGameCard(game, 'new');
            container.appendChild(gameCard);
        });

        // 새 게임이 없으면 메시지 표시
        if (this.games.newGames.length === 0) {
            container.innerHTML = `
                <div class="no-games-message">
                    <p>🎮 새로운 게임이 곧 추가될 예정입니다!</p>
                    <p>기대해 주세요!</p>
                </div>
            `;
        }
    }

    // 베스트 게임 렌더링
    renderBestGames() {
        const container = document.getElementById('best-games-grid');
        if (!container) return;

        container.innerHTML = '';

        this.games.bestGames.forEach(game => {
            const gameCard = this.createGameCard(game, 'best');
            container.appendChild(gameCard);
        });
    }

    // 모든 게임 렌더링
    renderAllGames() {
        const container = document.getElementById('all-games-grid');
        if (!container) return;

        container.innerHTML = '';

        // 기존 정적 게임들 추가
        const staticGames = [
            {
                id: 'bouncing-ball',
                title: '튀는 공 게임',
                description: '마우스를 움직여서 공을 따라가보세요!<br>클릭하면 공의 색깔이 바뀌고, 스페이스바로 속도를 바꿀 수 있어요.',
                icon: '🏀',
                tech: 'p5.js 라이브러리',
                url: 'p5js-games/bouncing-ball/index.html'
            },
            {
                id: 'simple-pong',
                title: '퐁 게임',
                description: '마우스로 패들을 조종해서 컴퓨터와 대결하세요!<br>5점을 먼저 얻는 사람이 승리해요.',
                icon: '🏓',
                tech: 'p5.js 라이브러리',
                url: 'p5js-games/simple-pong/index.html'
            },
            {
                id: 'snake-game',
                title: '뱀 게임',
                description: '화살표 키로 뱀을 조종해서 빨간 사과를 먹어보세요!<br>벽이나 자신의 몸에 부딪히면 게임 오버예요.',
                icon: '🐍',
                tech: 'HTML5 Canvas',
                url: 'canvas-games/snake-game/index.html'
            },
            {
                id: 'catch-game',
                title: '물체 잡기 게임',
                description: '마우스로 바구니를 움직여서 떨어지는 물체들을 잡아보세요!<br>사과와 보석은 점수를 주고, 폭탄은 점수를 빼요.',
                icon: '🎯',
                tech: 'HTML5 Canvas',
                url: 'canvas-games/catch-game/index.html'
            },
            {
                id: 'block-breaker',
                title: '블록 깨기 게임',
                description: '마우스로 패들을 조종해서 공을 튕겨 모든 블록을 깨트리세요!<br>화려한 파티클 효과와 함께 즐겨보세요.',
                icon: '🧱',
                tech: 'Scratch 스타일',
                url: 'scratch-style/block-breaker/index.html'
            },
            {
                id: 'star-collector',
                title: '별 수집 게임',
                description: '우주선을 조종해서 별을 수집하고 운석을 피하세요!<br>파워업을 먹으면 잠시 무적이 됩니다.',
                icon: '🚀',
                tech: '객체 지향 프로그래밍',
                url: 'new-games/star-collector/index.html'
            },
            {
                id: 'drawing-quiz',
                title: '그림 맞추기 게임',
                description: '이모지 그림을 보고 정답을 맞춰보세요!<br>시간 제한이 있으니 빨리 생각해보세요.',
                icon: '🎨',
                tech: '배열과 랜덤 함수',
                url: 'new-games/drawing-quiz/index.html'
            },
            {
                id: 'puzzle-15',
                title: '15 퍼즐 게임',
                description: '숫자 타일을 움직여서 1부터 15까지 순서대로 배열하세요!<br>난이도를 선택할 수 있어요.',
                icon: '🧩',
                tech: '2차원 배열과 알고리즘',
                url: 'new-games/puzzle-15/index.html'
            },
            {
                id: 'racing-game',
                title: '레이싱 게임',
                description: '자동차를 조종해서 다른 차들과 장애물을 피하세요!<br>미니맵과 속도계가 있어요.',
                icon: '🏎️',
                tech: '물리 시뮬레이션',
                url: 'new-games/racing-game/index.html'
            },
            {
                id: 'rhythm-game',
                title: '리듬 게임',
                description: 'A, S, D, F 키로 떨어지는 노트를 정확한 타이밍에 누르세요!<br>Perfect, Great, Good 판정이 있어요.',
                icon: '🎵',
                tech: '타이밍과 동기화',
                url: 'new-games/rhythm-game/index.html'
            },
            {
                id: 'memory-cards',
                title: '메모리 카드 게임',
                description: '같은 그림의 카드 2장을 찾아서 모든 쌍을 맞추세요!<br>3가지 난이도로 도전해보세요!',
                icon: '🧠',
                tech: '배열과 상태 관리',
                url: 'advanced-games/memory-cards/index.html'
            },
            {
                id: 'surfing-game',
                title: '서핑 게임',
                description: '파도를 타면서 트릭을 성공시키고 장애물을 피하세요!<br>날씨 시스템과 콤보 시스템이 있어요!',
                icon: '🏄‍♂️',
                tech: '복잡한 물리 효과',
                url: 'advanced-games/surfing-game/index.html'
            },
            {
                id: 'circus-games',
                title: '서커스 게임 모음',
                description: '공중그네, 저글링, 줄타기, 동물조련까지!<br>4가지 미니게임을 한 번에 즐겨보세요!',
                icon: '🎪',
                tech: '미니게임 시스템',
                url: 'advanced-games/circus-games/index.html'
            },
            {
                id: 'wizard-spells',
                title: '마법사 주문 게임',
                description: '마법사가 보여주는 원소 패턴을 기억하고 따라해보세요!<br>6가지 원소로 강력한 마법을 시전하세요!',
                icon: '🧙‍♂️',
                tech: '패턴 기억 게임',
                url: 'creative-games/wizard-spells/index.html'
            },
            {
                id: 'helicopter-game',
                title: '헬리콥터 게임',
                description: '스페이스바로 헬리콥터를 조종해서 장애물을 피하세요!<br>연료와 바람을 고려해서 안전하게 착륙하세요!',
                icon: '🚁',
                tech: '물리 시뮬레이션',
                url: 'creative-games/helicopter-game/index.html'
            },
            {
                id: 'pizza-maker',
                title: '피자 만들기 게임',
                description: '손님이 주문한 피자를 정확하게 만들어 주세요!<br>다양한 토핑으로 맛있는 피자를 완성하세요!',
                icon: '🍕',
                tech: '요리 시뮬레이션',
                url: 'creative-games/pizza-maker/index.html'
            },
            {
                id: 'archery-game',
                title: '궁수 게임',
                description: '마우스로 각도와 힘을 조절해서 과녁을 맞춰보세요!<br>바람의 영향을 고려해서 정확하게 쏘세요!',
                icon: '🏹',
                tech: '물리 계산',
                url: 'creative-games/archery-game/index.html'
            }
        ];

        // 정적 게임들 렌더링
        staticGames.forEach(game => {
            const gameCard = this.createStaticGameCard(game);
            container.appendChild(gameCard);
        });
        
        // 동적 게임들 추가 (새로운 게임, 베스트 게임, 일반 게임)
        const dynamicGames = [...this.games.newGames, ...this.games.bestGames, ...this.games.allGames];
        
        dynamicGames.forEach(game => {
            const gameCard = this.createGameCard(game, 'all');
            container.appendChild(gameCard);
        });
    }

    // 게임 카드 생성
    createGameCard(game, type) {
        const card = document.createElement('div');
        
        let cardClass = 'game-card';
        let cardStyle = '';
        
        if (type === 'new') {
            cardClass += ' new-game-card';
            cardStyle = 'background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(255, 255, 255, 0.15)); border: 2px solid rgba(76, 175, 80, 0.4); box-shadow: 0 8px 25px rgba(76, 175, 80, 0.2);';
        } else if (type === 'best') {
            cardClass += ' best-game';
            cardStyle = 'background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 255, 0.15)); border: 2px solid rgba(255, 215, 0, 0.4); box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);';
        }

        card.className = cardClass;
        card.style.cssText = cardStyle + ' position: relative; overflow: hidden;';

        // 새 게임 배지
        const badge = type === 'new' ? '<div class="new-badge">NEW!</div>' : '';
        const titleColor = type === 'new' ? '#4CAF50' : (type === 'best' ? '#ffd700' : '');
        const buttonStyle = type === 'new' ? 
            'background: linear-gradient(45deg, #4CAF50, #8BC34A); color: white; font-weight: bold; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);' :
            (type === 'best' ? 
                'background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);' :
                '');

        card.innerHTML = `
            ${badge}
            <span class="game-icon">${game.icon}</span>
            <h3 class="game-title" style="color: ${titleColor};">${game.title}</h3>
            <p class="game-description">${game.description}</p>
            <div class="game-tech">${game.tech}</div>
            <a href="${game.url}" class="play-button" style="${buttonStyle}">게임 시작 🚀</a>
        `;

        return card;
    }

    // 정적 게임 카드 생성 (기존 스타일 유지)
    createStaticGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.style.cssText = 'position: relative; overflow: hidden;';

        card.innerHTML = `
            <span class="game-icon">${game.icon}</span>
            <h2 class="game-title">${game.title}</h2>
            <p class="game-description">${game.description}</p>
            <div class="game-tech">${game.tech}</div>
            <a href="${game.url}" class="play-button">게임 시작 🚀</a>
        `;

        return card;
    }

    // 관리자 패널 표시
    showAdminPanel() {
        const panel = document.createElement('div');
        panel.className = 'admin-panel';
        panel.innerHTML = `
            <div class="admin-content">
                <h2>🎮 게임 관리 패널</h2>
                <div class="admin-tabs">
                    <button class="tab-btn active" onclick="gameManager.showTab('add')">새 게임 추가</button>
                    <button class="tab-btn" onclick="gameManager.showTab('manage')">게임 관리</button>
                    <button class="tab-btn" onclick="gameManager.showTab('stats')">통계</button>
                </div>
                <div id="admin-tab-content">
                    ${this.getAddGameForm()}
                </div>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">닫기</button>
            </div>
        `;
        
        document.body.appendChild(panel);
    }

    // 새 게임 추가 폼
    getAddGameForm() {
        return `
            <div class="add-game-form">
                <h3>새 게임 추가</h3>
                <form onsubmit="gameManager.handleAddGame(event)">
                    <input type="text" id="game-title" placeholder="게임 제목" required>
                    <textarea id="game-description" placeholder="게임 설명" required></textarea>
                    <input type="text" id="game-icon" placeholder="게임 아이콘 (이모지)" required>
                    <input type="text" id="game-tech" placeholder="기술 스택" required>
                    <input type="text" id="game-url" placeholder="게임 URL" required>
                    <button type="submit">게임 추가</button>
                </form>
            </div>
        `;
    }

    // 새 게임 추가 처리
    handleAddGame(event) {
        event.preventDefault();
        
        const gameData = {
            title: document.getElementById('game-title').value,
            description: document.getElementById('game-description').value,
            icon: document.getElementById('game-icon').value,
            tech: document.getElementById('game-tech').value,
            url: document.getElementById('game-url').value
        };

        this.addNewGame(gameData);
        
        // 폼 리셋
        event.target.reset();
        
        // 성공 메시지
        alert('새 게임이 추가되었습니다! 7일 후 자동으로 베스트 게임으로 승격됩니다.');
    }

    // 탭 전환
    showTab(tabName) {
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        const content = document.getElementById('admin-tab-content');
        
        switch(tabName) {
            case 'add':
                content.innerHTML = this.getAddGameForm();
                break;
            case 'manage':
                content.innerHTML = this.getManageGamesContent();
                break;
            case 'stats':
                content.innerHTML = this.getStatsContent();
                break;
        }
    }

    // 게임 관리 컨텐츠
    getManageGamesContent() {
        return `
            <div class="manage-games">
                <h3>게임 관리</h3>
                <div class="game-categories">
                    <div class="category">
                        <h4>새로운 게임 (${this.games.newGames.length}개)</h4>
                        ${this.games.newGames.map(game => `
                            <div class="manage-game-item">
                                <span>${game.icon} ${game.title}</span>
                                <button onclick="gameManager.removeGame('${game.id}', 'newGames')">삭제</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="category">
                        <h4>베스트 게임 (${this.games.bestGames.length}개)</h4>
                        ${this.games.bestGames.map(game => `
                            <div class="manage-game-item">
                                <span>${game.icon} ${game.title}</span>
                                <button onclick="gameManager.removeGame('${game.id}', 'bestGames')">삭제</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // 통계 컨텐츠
    getStatsContent() {
        const totalGames = this.games.newGames.length + this.games.bestGames.length + this.games.allGames.length;
        
        return `
            <div class="stats">
                <h3>게임 통계</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>전체 게임</h4>
                        <p class="stat-number">${totalGames}</p>
                    </div>
                    <div class="stat-item">
                        <h4>새로운 게임</h4>
                        <p class="stat-number">${this.games.newGames.length}</p>
                    </div>
                    <div class="stat-item">
                        <h4>베스트 게임</h4>
                        <p class="stat-number">${this.games.bestGames.length}</p>
                    </div>
                    <div class="stat-item">
                        <h4>일반 게임</h4>
                        <p class="stat-number">${this.games.allGames.length}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// 전역 게임 매니저 인스턴스
let gameManager;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Game Manager 초기화 중...');
    gameManager = new GameManager();
    
    // 만료된 게임 확인
    gameManager.checkExpiredGames();
    
    // 화면 업데이트
    gameManager.updateDisplay();
    console.log('✅ Game Manager 초기화 완료');
    console.log('💡 관리자 패널: Ctrl+Shift+A 키를 눌러 열 수 있습니다.');
    
    // 매일 만료 게임 확인
    setInterval(() => {
        gameManager.checkExpiredGames();
    }, 24 * 60 * 60 * 1000); // 24시간마다
});

// 관리자 패널 단축키 (Ctrl+Shift+A)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        console.log('🔧 관리자 패널 열기');
        if (gameManager) {
            gameManager.showAdminPanel();
        }
    }
});