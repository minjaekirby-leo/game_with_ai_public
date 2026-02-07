const fs = require('fs');
const path = require('path');

// 모바일 반응형 CSS 코드
const responsiveCSS = `
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 1.8rem;
            }
            
            .header p {
                font-size: 0.9rem;
            }
            
            canvas {
                max-width: 100%;
                height: auto;
                touch-action: none;
            }
            
            .controls, .game-info {
                flex-direction: column;
                gap: 10px;
            }
            
            button {
                padding: 10px 15px;
                font-size: 0.9rem;
            }
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

function addResponsiveCSSToFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 이미 모바일 반응형 CSS가 있는지 확인
        if (content.includes('@media (max-width: 768px)') || 
            content.includes('touch-action: none')) {
            console.log(`⏭️  이미 있음: ${filePath}`);
            skippedCount++;
            return;
        }
        
        // </style> 태그 바로 앞에 삽입
        const styleEndIndex = content.indexOf('</style>');
        if (styleEndIndex === -1) {
            console.log(`⚠️  스타일 태그 없음: ${filePath}`);
            skippedCount++;
            return;
        }
        
        // 반응형 CSS 삽입
        const newContent = content.slice(0, styleEndIndex) + 
                          responsiveCSS + 
                          '\n    ' + content.slice(styleEndIndex);
        
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
                addResponsiveCSSToFile(fullPath);
            }
        });
    } catch (error) {
        console.log(`❌ 폴더 오류: ${dirPath} - ${error.message}`);
    }
}

console.log('🎨 모바일 반응형 CSS 추가 시작...\n');

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
