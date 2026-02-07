const fs = require('fs');
const path = require('path');

// 모바일 터치 컨트롤 코드
const mobileControlsCode = `
        // 모바일 터치 컨트롤
        let touchStartX = 0;
        let touchStartY = 0;
        let touchActive = false;
        
        if (canvas) {
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                touchStartX = (touch.clientX - rect.left) * (canvas.width / rect.width);
                touchStartY = (touch.clientY - rect.top) * (canvas.height / rect.height);
                touchActive = true;
                
                // 터치로 발사/액션 (상단 1/3 터치 시)
                if (touchStartY < canvas.height / 3) {
                    if (typeof keys !== 'undefined') {
                        keys[' '] = true;
                        keys['Space'] = true;
                    }
                }
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!touchActive) return;
                
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
                const touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);
                
                const dx = touchX - touchStartX;
                const dy = touchY - touchStartY;
                
                if (typeof keys !== 'undefined') {
                    // 방향 결정 (가장 큰 변화량 기준)
                    if (Math.abs(dx) > Math.abs(dy)) {
                        if (dx > 20) {
                            keys['ArrowRight'] = true;
                            keys['d'] = true;
                            keys['D'] = true;
                            keys['ArrowLeft'] = false;
                            keys['a'] = false;
                            keys['A'] = false;
                        } else if (dx < -20) {
                            keys['ArrowLeft'] = true;
                            keys['a'] = true;
                            keys['A'] = true;
                            keys['ArrowRight'] = false;
                            keys['d'] = false;
                            keys['D'] = false;
                        }
                    } else {
                        if (dy > 20) {
                            keys['ArrowDown'] = true;
                            keys['s'] = true;
                            keys['S'] = true;
                            keys['ArrowUp'] = false;
                            keys['w'] = false;
                            keys['W'] = false;
                        } else if (dy < -20) {
                            keys['ArrowUp'] = true;
                            keys['w'] = true;
                            keys['W'] = true;
                            keys['ArrowDown'] = false;
                            keys['s'] = false;
                            keys['S'] = false;
                        }
                    }
                }
            });
            
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                touchActive = false;
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
            });
        }
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

function addMobileControlsToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 이미 모바일 컨트롤이 있는지 확인
        if (content.includes('touchstart') || content.includes('모바일 터치 컨트롤')) {
            console.log(`⏭️  이미 있음: ${filePath}`);
            skippedCount++;
            return;
        }
        
        // </script> 태그 바로 앞에 삽입
        const scriptEndIndex = content.lastIndexOf('</script>');
        if (scriptEndIndex === -1) {
            console.log(`⚠️  스크립트 태그 없음: ${filePath}`);
            skippedCount++;
            return;
        }
        
        // 모바일 컨트롤 코드 삽입
        const newContent = content.slice(0, scriptEndIndex) + 
                          mobileControlsCode + 
                          '\n    ' + content.slice(scriptEndIndex);
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ 추가 완료: ${filePath}`);
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
                addMobileControlsToFile(fullPath);
            }
        });
    } catch (error) {
        console.log(`❌ 폴더 오류: ${dirPath} - ${error.message}`);
    }
}

console.log('🚀 모바일 터치 컨트롤 추가 시작...\n');

gameFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
        console.log(`\n📁 처리 중: ${folder}`);
        processDirectory(folder);
    }
});

console.log(`\n\n✨ 완료!`);
console.log(`✅ 추가된 게임: ${processedCount}개`);
console.log(`⏭️  건너뛴 게임: ${skippedCount}개`);
console.log(`📱 총 처리: ${processedCount + skippedCount}개`);
