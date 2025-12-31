# p5.js Web Editor용 코드들

p5.js Web Editor (https://editor.p5js.org/)에서 바로 사용할 수 있는 코드들입니다.

## 1. 튀는 공 게임

새 스케치를 만들고 아래 코드를 `sketch.js`에 붙여넣으세요:

```javascript
// 공의 위치와 속도
let ballX = 200;
let ballY = 200;
let ballSpeedX = 3;
let ballSpeedY = 2;

// 공의 크기와 색깔
let ballSize = 50;
let ballColor;

function setup() {
    // 캔버스 만들기
    createCanvas(600, 400);
    
    // 처음 공 색깔 설정
    ballColor = color(255, 100, 100); // 빨간색
}

function draw() {
    // 배경 그리기
    background(50, 50, 100); // 어두운 파란색
    
    // 공 움직이기
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // 벽에 부딪히면 방향 바꾸기
    if (ballX > width - ballSize/2 || ballX < ballSize/2) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY > height - ballSize/2 || ballY < ballSize/2) {
        ballSpeedY = -ballSpeedY;
    }
    
    // 마우스 위치에 작은 원 그리기
    fill(255, 255, 0); // 노란색
    circle(mouseX, mouseY, 20);
    
    // 공 그리기
    fill(ballColor);
    circle(ballX, ballY, ballSize);
    
    // 점수 표시 (마우스와 공의 거리)
    let distance = dist(mouseX, mouseY, ballX, ballY);
    fill(255);
    textSize(20);
    text("거리: " + int(distance), 10, 30);
    
    if (distance < 50) {
        text("가까워요! 🎉", 10, 60);
    }
}

// 마우스 클릭하면 공 색깔 바꾸기
function mousePressed() {
    ballColor = color(random(255), random(255), random(255));
}

// 키보드로 공 속도 조절
function keyPressed() {
    if (key === ' ') { // 스페이스바
        ballSpeedX = random(-5, 5);
        ballSpeedY = random(-5, 5);
    }
}
```

## 2. 간단한 퐁 게임

새 스케치를 만들고 아래 코드를 `sketch.js`에 붙여넣으세요:

```javascript
// 공 변수들
let ballX, ballY;
let ballSpeedX = 4;
let ballSpeedY = 3;
let ballSize = 20;

// 패들 변수들
let paddleHeight = 80;
let paddleWidth = 15;
let playerY;
let computerY;
let computerSpeed = 2;

// 점수
let playerScore = 0;
let computerScore = 0;

function setup() {
    createCanvas(800, 400);
    
    // 공을 가운데에서 시작
    ballX = width / 2;
    ballY = height / 2;
    
    // 패들 위치 초기화
    playerY = height / 2;
    computerY = height / 2;
}

function draw() {
    background(0); // 검은 배경
    
    // 가운데 선 그리기
    stroke(255);
    for (let i = 0; i < height; i += 20) {
        line(width/2, i, width/2, i + 10);
    }
    
    // 공 움직이기
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    // 공이 위아래 벽에 부딪히면
    if (ballY < ballSize/2 || ballY > height - ballSize/2) {
        ballSpeedY = -ballSpeedY;
    }
    
    // 플레이어 패들 (마우스로 조종)
    playerY = mouseY;
    
    // 컴퓨터 패들 (공을 따라감)
    if (computerY < ballY - 35) {
        computerY += computerSpeed;
    } else if (computerY > ballY + 35) {
        computerY -= computerSpeed;
    }
    
    // 공과 패들 충돌 검사
    // 플레이어 패들
    if (ballX < paddleWidth + ballSize/2 && 
        ballY > playerY - paddleHeight/2 && 
        ballY < playerY + paddleHeight/2) {
        ballSpeedX = -ballSpeedX;
        ballX = paddleWidth + ballSize/2;
    }
    
    // 컴퓨터 패들
    if (ballX > width - paddleWidth - ballSize/2 && 
        ballY > computerY - paddleHeight/2 && 
        ballY < computerY + paddleHeight/2) {
        ballSpeedX = -ballSpeedX;
        ballX = width - paddleWidth - ballSize/2;
    }
    
    // 점수 계산
    if (ballX < 0) {
        computerScore++;
        resetBall();
    }
    if (ballX > width) {
        playerScore++;
        resetBall();
    }
    
    // 그리기
    noStroke();
    
    // 플레이어 패들 (왼쪽)
    fill(100, 255, 100);
    rect(0, playerY - paddleHeight/2, paddleWidth, paddleHeight);
    
    // 컴퓨터 패들 (오른쪽)
    fill(255, 100, 100);
    rect(width - paddleWidth, computerY - paddleHeight/2, paddleWidth, paddleHeight);
    
    // 공
    fill(255, 255, 100);
    circle(ballX, ballY, ballSize);
    
    // 점수 표시
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text(playerScore, width/4, 50);
    text(computerScore, 3*width/4, 50);
    
    // 게임 오버
    if (playerScore >= 5) {
        textSize(48);
        text("플레이어 승리! 🎉", width/2, height/2);
        noLoop();
    } else if (computerScore >= 5) {
        textSize(48);
        text("컴퓨터 승리! 😅", width/2, height/2);
        noLoop();
    }
}

function resetBall() {
    ballX = width / 2;
    ballY = height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = random(-3, 3);
}

function keyPressed() {
    if (key === ' ') {
        playerScore = 0;
        computerScore = 0;
        resetBall();
        loop();
    }
}
```