// CFO検索機能（デモ用）
function searchCFO() {
    alert('CFO検索画面に移動します\n\n※これはデモ画面です');
}

// 企業検索機能（デモ用）
function searchCompany() {
    alert('企業検索画面に移動します\n\n※これはデモ画面です');
}

// 登録・ログイン処理（デモ用）
function showLogin() {
    alert('ログイン画面を表示します\n\n※これはデモ画面です');
}

function showRegister() {
    alert('新規登録画面を表示します\n\n※これはデモ画面です');
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // ヘッダーボタンにイベントリスナーを追加（デスクトップ）
    const loginBtn = document.querySelector('.auth-buttons .btn-outline');
    const registerBtn = document.querySelector('.auth-buttons .btn-primary');
    
    if (loginBtn) loginBtn.addEventListener('click', showLogin);
    if (registerBtn) registerBtn.addEventListener('click', showRegister);
    
    // モバイルメニューのボタンにイベントリスナーを追加
    const mobileLoginBtn = document.querySelector('.mobile-auth-buttons .btn-outline');
    const mobileRegisterBtn = document.querySelector('.mobile-auth-buttons .btn-primary');
    
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', showLogin);
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', showRegister);
    
    // スムーズスクロールの初期化
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // モバイル対応：タッチイベント
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const threshold = 50;
        if (touchEndY < touchStartY - threshold) {
            // 上にスワイプ
        }
        if (touchEndY > touchStartY + threshold) {
            // 下にスワイプ
        }
    }
});

// アニメーション効果
function addScrollAnimation() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素を監視
    document.querySelectorAll('.hero-content, .feature-item').forEach(el => {
        observer.observe(el);
    });
}

// ページ読み込み完了後にアニメーション初期化
window.addEventListener('load', addScrollAnimation);

// ハンバーガーメニューの切り替え
function toggleMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    }
}