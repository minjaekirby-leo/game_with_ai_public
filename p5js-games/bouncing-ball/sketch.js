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