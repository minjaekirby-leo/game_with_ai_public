# Google Analytics 설정 가이드

## 현재 상태
- ✅ 메인 페이지 (index.html)에 Google Analytics 적용 완료
- ✅ analytics.js 모듈 생성 완료 (프로덕션 환경에서만 작동)
- ✅ 자동화 스크립트 준비 완료

## 환경별 작동 방식
### 🚀 프로덕션 환경 (집계됨)
- **도메인**: `minjaekirby-leo.github.io`
- **상태**: Google Analytics 활성화
- **로그**: "프로덕션 환경 감지 - Google Analytics 활성화됨"

### 💻 개발 환경 (집계 안됨)
- **도메인**: `localhost`, `127.0.0.1`, `file://` 등
- **상태**: Google Analytics 비활성화
- **로그**: "개발 환경 감지 - Google Analytics 비활성화됨"
- **더미 함수**: 개발 중에도 gtag 함수 사용 가능 (콘솔에만 출력)

## 파일 구조
```
├── analytics.js          # Google Analytics 모듈 (도메인 체크 포함)
├── add-analytics.js       # Node.js 자동화 스크립트
├── add-analytics.sh       # Bash 자동화 스크립트
└── index.html            # 메인 페이지 (이미 적용됨)
```

## 모든 페이지에 적용하는 방법

### 방법 1: Bash 스크립트 사용 (권장)
```bash
./add-analytics.sh
```

### 방법 2: Node.js 스크립트 사용
```bash
node add-analytics.js
```

## 수동으로 개별 페이지에 적용하는 방법
각 HTML 파일의 `<title>` 태그 다음에 아래 코드를 추가:

```html
<!-- Google Analytics -->
<script src="../../analytics.js"></script>
```

**주의**: 상대 경로는 파일의 위치에 따라 조정해야 합니다.
- 루트 디렉토리: `analytics.js`
- 1단계 하위: `../analytics.js`
- 2단계 하위: `../../analytics.js`

## Google Analytics 추적 ID
현재 설정된 추적 ID: `G-5VTPFHVTSS`

## 확인 방법
### 개발 환경에서
1. 브라우저에서 페이지 열기
2. 개발자 도구 > Console 탭에서 "개발 환경 감지 - Google Analytics 비활성화됨" 메시지 확인

### 프로덕션 환경에서
1. https://minjaekirby-leo.github.io 에서 페이지 열기
2. 개발자 도구 > Console 탭에서 "프로덕션 환경 감지 - Google Analytics 활성화됨" 메시지 확인
3. Network 탭에서 gtag.js 로드 확인

## 주의사항
- 스크립트 실행 전 백업 권장
- 이미 적용된 파일은 자동으로 건너뜀
- 모든 HTML 파일이 `<title>` 태그를 가지고 있어야 함
- 로컬 개발 시에는 Analytics가 작동하지 않으므로 데이터 오염 방지