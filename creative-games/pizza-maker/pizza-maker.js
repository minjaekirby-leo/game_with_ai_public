// 피자 만들기 게임 JavaScript

class PizzaMaker {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.completedPizzas = 0;
        this.satisfaction = 100;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.currentOrder = null;
        this.selectedIngredient = null;
        this.pizzaToppings = [];
        this.hasSauce = false;
        
        this.customers = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓'];
        
        this.recipes = {
            margherita: {
                name: '마르게리타',
                ingredients: ['sauce', 'cheese', 'tomato'],
                points: 100,
                emoji: '🍕'
            },
            pepperoni: {
                name: '페퍼로니',
                ingredients: ['sauce', 'cheese', 'pepperoni'],
                points: 120,
                emoji: '🍕'
            },
            hawaiian: {
                name: '하와이안',
                ingredients: ['sauce', 'cheese', 'pineapple', 'bacon'],
                points: 150,
                emoji: '🍍'
            },
            vegetarian: {
                name: '베지테리안',
                ingredients: ['sauce', 'cheese', 'mushroom', 'pepper', 'onion'],
                points: 140,
                emoji: '🥬'
            },
            supreme: {
                name: '슈프림',
                ingredients: ['sauce', 'cheese', 'pepperoni', 'mushroom', 'pepper', 'olive'],
                points: 200,
                emoji: '👑'
            }
        };
        
        this.ingredientEmojis = {
            sauce: '🍅',
            cheese: '🧀',
            pepperoni: '🍕',
            mushroom: '🍄',
            pepper: '🫑',
            onion: '🧅',
            tomato: '🍅',
            olive: '🫒',
            bacon: '🥓',
            pineapple: '🍍'
        };
        
        this.timer = null;
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.createSparkles();
    }
    
    startGame() {
        this.gameRunning = true;
        this.timeLeft = 60;
        this.generateOrder();
        this.startTimer();
        this.showFeedback('게임 시작! 첫 번째 주문을 확인하세요! 🍕', 'success');
    }
    
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                document.getElementById('timer').style.color = '#f44336';
                document.getElementById('timer').style.animation = 'pulse 0.5s infinite';
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    timeUp() {
        clearInterval(this.timer);
        this.satisfaction = Math.max(0, this.satisfaction - 20);
        this.showFeedback('시간 초과! 손님이 화났어요! 😠', 'error');
        
        if (this.satisfaction <= 0) {
            this.gameOver();
        } else {
            setTimeout(() => {
                this.nextOrder();
            }, 2000);
        }
    }
    
    generateOrder() {
        const recipeKeys = Object.keys(this.recipes);
        const randomRecipe = recipeKeys[Math.floor(Math.random() * recipeKeys.length)];
        this.currentOrder = this.recipes[randomRecipe];
        
        // 랜덤 손님 선택
        const randomCustomer = this.customers[Math.floor(Math.random() * this.customers.length)];
        document.getElementById('customer').textContent = randomCustomer;
        
        // 주문 표시
        const orderDetails = document.getElementById('orderDetails');
        orderDetails.innerHTML = `
            <h3>주문서 ${this.currentOrder.emoji}</h3>
            <p><strong>${this.currentOrder.name}</strong></p>
            <p>필요한 재료: ${this.currentOrder.ingredients.map(ing => this.ingredientEmojis[ing]).join(' + ')}</p>
            <p>보상: ${this.currentOrder.points}점</p>
        `;
        
        this.timeLeft = Math.max(30, 60 - this.level * 5); // 레벨이 올라갈수록 시간 단축
        document.getElementById('timer').style.color = '#d32f2f';
        document.getElementById('timer').style.animation = 'none';
    }
    
    selectIngredient(ingredient) {
        // 이전 선택 해제
        document.querySelectorAll('.ingredient-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 새로운 선택
        this.selectedIngredient = ingredient;
        document.querySelector(`[data-ingredient="${ingredient}"]`).classList.add('selected');
        
        this.showFeedback(`${this.ingredientEmojis[ingredient]} ${ingredient} 선택됨!`, 'success');
    }
    
    addSauce() {
        if (!this.gameRunning) {
            this.showFeedback('먼저 게임을 시작하세요!', 'error');
            return;
        }
        
        if (!this.hasSauce) {
            this.hasSauce = true;
            this.pizzaToppings.push('sauce');
            
            // 피자 베이스에 소스 색상 추가
            const pizzaBase = document.getElementById('pizzaBase');
            pizzaBase.style.background = 'radial-gradient(circle, #ff6b6b 60%, #deb887 100%)';
            
            this.showFeedback('토마토 소스를 발랐어요! 🍅', 'success');
        } else if (this.selectedIngredient) {
            this.addTopping();
        } else {
            this.showFeedback('재료를 먼저 선택하세요!', 'error');
        }
    }
    
    addTopping() {
        if (!this.selectedIngredient) {
            this.showFeedback('재료를 먼저 선택하세요!', 'error');
            return;
        }
        
        if (!this.hasSauce && this.selectedIngredient !== 'sauce') {
            this.showFeedback('먼저 소스를 발라야 해요!', 'error');
            return;
        }
        
        // 토핑 추가
        this.pizzaToppings.push(this.selectedIngredient);
        this.createToppingVisual(this.selectedIngredient);
        
        this.showFeedback(`${this.ingredientEmojis[this.selectedIngredient]} 추가됨!`, 'success');
        
        // 선택 해제
        document.querySelectorAll('.ingredient-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.selectedIngredient = null;
    }
    
    createToppingVisual(ingredient) {
        const pizzaBase = document.getElementById('pizzaBase');
        const topping = document.createElement('div');
        topping.className = 'topping';
        topping.textContent = this.ingredientEmojis[ingredient];
        
        // 랜덤 위치 (피자 안쪽에)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60 + 20; // 20-80px 반지름
        const x = Math.cos(angle) * radius + 90; // 중심에서 오프셋
        const y = Math.sin(angle) * radius + 90;
        
        topping.style.left = x + 'px';
        topping.style.top = y + 'px';
        topping.style.width = '20px';
        topping.style.height = '20px';
        topping.style.fontSize = '16px';
        topping.style.display = 'flex';
        topping.style.alignItems = 'center';
        topping.style.justifyContent = 'center';
        
        // 애니메이션 효과
        topping.style.transform = 'scale(0)';
        pizzaBase.appendChild(topping);
        
        setTimeout(() => {
            topping.style.transform = 'scale(1)';
        }, 100);
    }
    
    servePizza() {
        if (!this.gameRunning || !this.currentOrder) {
            this.showFeedback('주문이 없어요!', 'error');
            return;
        }
        
        const orderIngredients = [...this.currentOrder.ingredients].sort();
        const pizzaIngredients = [...this.pizzaToppings].sort();
        
        // 정확도 계산
        let correctIngredients = 0;
        let totalRequired = orderIngredients.length;
        
        orderIngredients.forEach(ingredient => {
            if (pizzaIngredients.includes(ingredient)) {
                correctIngredients++;
            }
        });
        
        // 추가 재료 페널티
        const extraIngredients = pizzaIngredients.length - totalRequired;
        const accuracy = correctIngredients / totalRequired;
        
        if (accuracy === 1 && extraIngredients === 0) {
            // 완벽한 피자
            const bonus = Math.floor(this.timeLeft / 10) * 10;
            const totalPoints = this.currentOrder.points + bonus;
            this.score += totalPoints;
            this.completedPizzas++;
            this.satisfaction = Math.min(100, this.satisfaction + 10);
            
            this.showFeedback(`완벽해요! +${totalPoints}점 (시간 보너스: +${bonus}) 🌟`, 'success');
            
            if (this.completedPizzas % 3 === 0) {
                this.level++;
                this.showFeedback(`레벨 업! 레벨 ${this.level}! 🎉`, 'success');
            }
        } else if (accuracy >= 0.7) {
            // 괜찮은 피자
            const points = Math.floor(this.currentOrder.points * accuracy);
            this.score += points;
            this.completedPizzas++;
            this.satisfaction = Math.max(0, this.satisfaction - 5);
            
            this.showFeedback(`괜찮아요! +${points}점 (정확도: ${Math.floor(accuracy * 100)}%) 😊`, 'success');
        } else {
            // 잘못된 피자
            this.satisfaction = Math.max(0, this.satisfaction - 15);
            this.showFeedback(`틀렸어요! 손님이 불만족해요! 😞`, 'error');
        }
        
        this.updateDisplay();
        
        if (this.satisfaction <= 0) {
            this.gameOver();
        } else {
            setTimeout(() => {
                this.nextOrder();
            }, 2000);
        }
    }
    
    nextOrder() {
        this.clearPizza();
        this.generateOrder();
        this.startTimer();
    }
    
    clearPizza() {
        const pizzaBase = document.getElementById('pizzaBase');
        pizzaBase.style.background = '#deb887';
        pizzaBase.innerHTML = '';
        
        this.pizzaToppings = [];
        this.hasSauce = false;
        this.selectedIngredient = null;
        
        document.querySelectorAll('.ingredient-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    skipOrder() {
        if (!this.gameRunning) return;
        
        this.satisfaction = Math.max(0, this.satisfaction - 10);
        this.showFeedback('주문을 건너뛰었어요! 만족도 -10% 😕', 'error');
        
        if (this.satisfaction <= 0) {
            this.gameOver();
        } else {
            this.nextOrder();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        this.showFeedback(`게임 오버! 최종 점수: ${this.score}점, 완성한 피자: ${this.completedPizzas}개 🍕`, 'error');
        
        // 게임 리셋
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }
    
    resetGame() {
        this.level = 1;
        this.score = 0;
        this.completedPizzas = 0;
        this.satisfaction = 100;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.currentOrder = null;
        
        this.clearPizza();
        this.updateDisplay();
        
        document.getElementById('orderDetails').innerHTML = `
            <h3>주문서</h3>
            <p>게임을 시작해서 첫 번째 주문을 받아보세요!</p>
        `;
        document.getElementById('customer').textContent = '👨‍🍳';
        document.getElementById('timer').textContent = '60';
        document.getElementById('feedback').style.display = 'none';
    }
    
    updateDisplay() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('completedPizzas').textContent = this.completedPizzas;
        document.getElementById('satisfaction').textContent = this.satisfaction;
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        feedback.style.display = 'block';
        
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 3000);
    }
    
    createSparkles() {
        // 배경에 반짝이는 효과 추가
        setInterval(() => {
            if (Math.random() < 0.3) {
                const sparkle = document.createElement('div');
                sparkle.textContent = ['✨', '🌟', '💫'][Math.floor(Math.random() * 3)];
                sparkle.style.position = 'fixed';
                sparkle.style.left = Math.random() * window.innerWidth + 'px';
                sparkle.style.top = Math.random() * window.innerHeight + 'px';
                sparkle.style.fontSize = '20px';
                sparkle.style.pointerEvents = 'none';
                sparkle.style.zIndex = '-1';
                sparkle.style.animation = 'sparkleFloat 3s ease-out forwards';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    sparkle.remove();
                }, 3000);
            }
        }, 1000);
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleFloat {
        0% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(-100px) scale(0.5); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// 게임 인스턴스 생성
const pizzaGame = new PizzaMaker();

// 전역 함수들
function startGame() {
    pizzaGame.startGame();
}

function servePizza() {
    pizzaGame.servePizza();
}

function clearPizza() {
    pizzaGame.clearPizza();
}

function skipOrder() {
    pizzaGame.skipOrder();
}

function selectIngredient(ingredient) {
    pizzaGame.selectIngredient(ingredient);
}

function addSauce() {
    pizzaGame.addSauce();
}

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (!pizzaGame.gameRunning) return;
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            pizzaGame.servePizza();
            break;
        case 'c':
            pizzaGame.clearPizza();
            break;
        case 's':
            pizzaGame.skipOrder();
            break;
    }
});