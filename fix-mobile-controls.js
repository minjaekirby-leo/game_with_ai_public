const fs = require('fs');
const path = require('path');

// 개선된 모바일 터치 컨트롤 코드
const improvedMobileControls = `
        // 모바일 터치 컨트롤 (개선 버전)
        let touchStartX = 0;
        let touchStartY = 0;
        let touchActive = false;
        let lastTouchTime = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            touchStartY = touch.clientY - rect.top;
            touchActive = true;
            lastTouchTime = Date.now();
            
            // 빠른 탭 = 발사/액션
            if (typeof keys !== 'undefined') {
                keys[' '] = true;
                keys['Space'] = true;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!touchActive) return;
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const dx = touchX - touchStartX;
            const dy = touchY - touchStartY;
            
            // 최소 이동 거리 체크
            if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
            
            if (typeof keys !== 'undefined') {
                // 모든 키 초기화
                keys['ArrowLeft'] = false;
                keys['ArrowRight'] = false;
                keys['ArrowUp'] = false;
                keys['ArrowDown'] = false;
                keys['a'] = false;
                keys['A'] = false;
                keys['d'] = false;
                keys['D'] = false;
                keys['w'] = false;
                keys['W'] = false;
                keys['s'] = false;
                keys['S'] = false;
                
                // 방향 결정 (가장 큰 변화량 기준)
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        keys['ArrowRight'] = true;
                        keys['d'] = true;
                        keys['D'] = true;
                    } else {
                        keys['ArrowLeft'] = true;
                        keys['a'] = true;
                        keys['A'] = true;
                    }
                } else {
                    if (dy > 0) {
                        keys['ArrowDown'] = true;
                        keys['s'] = true;
                        keys['S'] = true;
                    } else {
                        keys['ArrowUp'] = true;
                        keys['w'] = true;
                        keys['W'] = true;
                    }
                }
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchActive = false;
            
            // 짧은 탭이면 발사만 하고 이동 키는 해제
            const touchDuration = Date.now() - lastTouchTime;
            if (touchDuration < 200) {
                // 짧은 탭 - 발사만
                setTimeout(() => {
                    if (typeof keys !== 'undefined') {
                        keys[' '] = false;
                        keys['Space'] = false;
                    }
                }, 100);
            } else {
                // 긴 터치 - 모든 키 해제
                if (typeof keys !== 'undefined') {
                    keys['ArrowLeft'] = false;
                    keys['ArrowRight'] = false;
                    keys['ArrowUp'] = false;
                    keys['ArrowDown'] = false;
                    keys['a'] = false;
                    keys['A'] = false;
                    keys['d'] = false;
                    keys['D'] = false;
                    keys['w'] = false;
                    keys['W'] = false;
                    keys['s'] = false;
                    keys['S'] = false;
                    keys[' '] = false;
                    keys['Space'] = false;
                }
            }
        });
`;

// 게임 폴더들
const gameFolders = [
    'new-games',
    'canvas-games',
    'creative-games',
    'advanced-games',
    'p5js-games'
];

let processedCount = 0;
let skippedCount = 0;

function fixMobileControls(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 기존 모바일 터치 컨트롤 코드 찾기
        const touchStartPattern = /\/\/ 모바일 터치 컨트롤[\s\S]*?canvas\.addEventListener\('touchend'[\s\S]*?\}\);/;
        
        if (!touchStartPattern.test(content)) {
            console.log(`⏭️  터치 컨트롤 없음: ${filePath}`);
            skippedCount++;
            return;
        }
        
        // 기존 코드 제거하고 새 코드로 교체
        content = content.replace(touchStartPattern, improvedMobileControls.trim());
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 수정 완료: ${filePath}`);
        processedCount++;
        
    } catch (error) {
        console.log(`❌ 오류: ${filePath} - ${error.message}`);
        skippedCount++;
    }
}

function processDirectory(dirPath) {
    try {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (item === 'index.html') {
                fixMobileControls(fullPath);
            }
        });
    } catch (error) {
        console.log(`❌ 폴더 오류: ${dirPath} - ${error.message}`);
    }
}

console.log('🔧 모바일 터치 컨트롤 수정 시작...\n');

gameFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
        console.log(`\n📁 처리 중: ${folder}`);
        processDirectory(folder);
    }
});

console.log(`\n\n✨ 완료!`);
console.log(`✅ 수정된 게임: ${processedCount}개`);
console.log(`⏭️  건너뛴 게임: ${skippedCount}개`);
console.log(`🎮 총 처리: ${processedCount + skippedCount}개`);
