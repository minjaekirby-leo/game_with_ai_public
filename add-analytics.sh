#!/bin/bash

# 모든 HTML 파일에 Google Analytics를 추가하는 스크립트

echo "모든 HTML 파일에 Google Analytics 추가 중..."

# 현재 디렉토리와 하위 디렉토리의 모든 HTML 파일 찾기
find . -name "*.html" -type f | while read -r file; do
    # 이미 analytics.js가 포함되어 있는지 확인
    if grep -q "analytics.js" "$file"; then
        echo "이미 적용됨: $file"
        continue
    fi
    
    # 파일의 깊이에 따른 상대 경로 계산
    depth=$(echo "$file" | tr -cd '/' | wc -c)
    relative_path=""
    for ((i=1; i<depth; i++)); do
        relative_path="../$relative_path"
    done
    
    # analytics.js 스크립트 태그 생성
    analytics_script="    <!-- Google Analytics -->\\n    <script src=\"${relative_path}analytics.js\"></script>\\n"
    
    # </title> 태그 다음에 analytics 스크립트 추가
    if grep -q "</title>" "$file"; then
        sed -i.bak "s|</title>|</title>\\n$analytics_script|" "$file"
        rm "$file.bak"  # 백업 파일 삭제
        echo "적용 완료: $file"
    else
        echo "<title> 태그를 찾을 수 없음: $file"
    fi
done

echo "완료!"