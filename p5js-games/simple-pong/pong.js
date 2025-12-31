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
        ballX = paddleWidth + ballSize/2; // 공이 패들에 끼지 않게
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
    ballSpeedX = -ballSpeedX; // 방향 바꾸기
    ballSpeedY = random(-3, 3);
}

// 스페이스바로 게임 재시작
function keyPressed() {
    if (key === ' ') {
        playerScore = 0;
        computerScore = 0;
        resetBall();
        loop();
    }
}