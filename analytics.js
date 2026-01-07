// Google Analytics 모듈 - 프로덕션 환경에서만 작동
(function() {
    // 허용된 도메인 체크
    const allowedDomains = [
        'minjaekirby-leo.github.io'
    ];
    
    const currentDomain = window.location.hostname;
    const isProduction = allowedDomains.includes(currentDomain);
    
    if (!isProduction) {
        console.log('개발 환경 감지 - Google Analytics 비활성화됨');
        console.log('현재 도메인:', currentDomain);
        console.log('허용된 도메인:', allowedDomains);
        
        // 개발 환경에서는 더미 gtag 함수 제공
        window.gtag = function() {
            console.log('Analytics (개발모드):', arguments);
        };
        return;
    }

    // 프로덕션 환경에서만 Google Analytics 로드
    console.log('프로덕션 환경 감지 - Google Analytics 활성화됨');
    console.log('현재 도메인:', currentDomain);
    
    // Google Analytics 스크립트 동적 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-5VTPFHVTSS';
    document.head.appendChild(script);

    // gtag 함수 초기화
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-5VTPFHVTSS');

    // 전역에서 사용할 수 있도록 gtag 함수 노출
    window.gtag = gtag;

    console.log('Google Analytics 로드 완료');
})();