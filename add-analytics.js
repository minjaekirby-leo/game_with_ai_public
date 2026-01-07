#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 모든 HTML 파일에 Google Analytics를 추가하는 스크립트
function addAnalyticsToHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // 재귀적으로 하위 디렉토리 탐색
            addAnalyticsToHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
            // HTML 파일 처리
            processHtmlFile(filePath);
        }
    });
}

function processHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 이미 analytics.js가 포함되어 있는지 확인
        if (content.includes('analytics.js')) {
            console.log(`이미 적용됨: ${filePath}`);
            return;
        }
        
        // analytics.js 상대 경로 계산
        const relativePath = getRelativePath(filePath);
        const analyticsScript = `    <!-- Google Analytics -->\n    <script src="${relativePath}analytics.js"></script>\n    `;
        
        // <title> 태그 다음에 analytics 스크립트 추가
        if (content.includes('<title>')) {
            const titleEndIndex = content.indexOf('</title>') + '</title>'.length;
            const beforeTitle = content.substring(0, titleEndIndex);
            const afterTitle = content.substring(titleEndIndex);
            
            content = beforeTitle + '\n' + analyticsScript + afterTitle;
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`적용 완료: ${filePath}`);
        } else {
            console.log(`<title> 태그를 찾을 수 없음: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`오류 발생 ${filePath}:`, error.message);
    }
}

function getRelativePath(htmlFilePath) {
    // HTML 파일에서 루트 디렉토리까지의 상대 경로 계산
    const depth = htmlFilePath.split(path.sep).length - 1;
    return '../'.repeat(depth);
}

// 스크립트 실행
console.log('모든 HTML 파일에 Google Analytics 추가 중...');
addAnalyticsToHtmlFiles('.');
console.log('완료!');