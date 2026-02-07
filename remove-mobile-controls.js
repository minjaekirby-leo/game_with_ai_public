const fs = require('fs');
const path = require('path');

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

function removeMobileControls(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 모바일 터치 컨트롤 코드 패턴들
        const patterns = [
            /\/\/ 모바일 터치 컨트롤[\s\S]*?canvas\.addEventListener\('touchend'[\s\S]*?\}\);/g,
            /let touchStartX = 0;[\s\S]*?canvas\.addEventListener\('touchend'[\s\S]*?\}\);/g
        ];
        
        let modified = false;
        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                content = content.replace(pattern, '');
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ 제거 완료: ${filePath}`);
            processedCount++;
        } else {
            console.log(`⏭️  터치 컨트롤 없음: ${filePath}`);
            skippedCount++;
        }
        
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
                removeMobileControls(fullPath);
            }
        });
    } catch (error) {
        console.log(`❌ 폴더 오류: ${dirPath} - ${error.message}`);
    }
}

console.log('🗑️  모바일 터치 컨트롤 제거 시작...\n');

gameFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
        console.log(`\n📁 처리 중: ${folder}`);
        processDirectory(folder);
    }
});

console.log(`\n\n✨ 완료!`);
console.log(`✅ 제거된 게임: ${processedCount}개`);
console.log(`⏭️  건너뛴 게임: ${skippedCount}개`);
console.log(`🎮 총 처리: ${processedCount + skippedCount}개`);
