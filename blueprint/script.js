// セクション切り替え機能
function showSection(sectionId) {
    // 全てのセクションを非表示
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 指定されたセクションを表示
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // ナビゲーションリンクのアクティブ状態を更新
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // クリックされたリンクをアクティブにする
    const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // ページトップにスクロール（モバイル対応）
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // URL更新（履歴に追加しない）
    history.replaceState(null, null, `#${sectionId}`);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    // URLのハッシュをチェック
    const hash = window.location.hash.substring(1);
    
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        // デフォルトで概要セクションを表示
        showSection('overview');
    }
    
    // ブラウザの戻る/進むボタン対応
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        } else {
            showSection('overview');
        }
    });
    
    // キーボードナビゲーション対応
    document.addEventListener('keydown', function(e) {
        // Alt + 数字キーでステップに移動
        if (e.altKey && e.key >= '1' && e.key <= '8') {
            e.preventDefault();
            const stepNumber = e.key;
            showSection(`step${stepNumber}`);
        }
        
        // Alt + H で概要に移動
        if (e.altKey && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            showSection('overview');
        }
        
        // 矢印キーでナビゲーション
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const currentSection = document.querySelector('.content-section.active');
            if (currentSection) {
                const currentId = currentSection.id;
                let nextSectionId = null;
                
                const sectionOrder = [
                    'overview', 'step1', 'step2', 'step3', 'step4',
                    'step5', 'step6', 'step7', 'step8', 'authentication', 'ui-design', 'site-layout'
                ];
                
                const currentIndex = sectionOrder.indexOf(currentId);
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    nextSectionId = sectionOrder[currentIndex - 1];
                } else if (e.key === 'ArrowRight' && currentIndex < sectionOrder.length - 1) {
                    nextSectionId = sectionOrder[currentIndex + 1];
                }
                
                if (nextSectionId) {
                    e.preventDefault();
                    showSection(nextSectionId);
                }
            }
        }
    });
    
    // プログレスバーの実装
    createProgressBar();
    updateProgressBar();
});

// プログレスバーを作成
function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-text">進捗: <span id="progress-percentage">0</span>%</div>
    `;
    
    // プログレスバーのスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        .progress-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 10px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 4px;
        }
        
        .progress-text {
            font-size: 0.9rem;
            color: #666;
            font-weight: 500;
            min-width: 80px;
        }
        
        body {
            padding-top: 60px;
        }
        
        .header {
            margin-top: 60px;
        }
        
        .sidebar {
            top: 180px;
            height: calc(100vh - 180px);
        }
        
        @media (max-width: 768px) {
            .progress-container {
                padding: 8px 15px;
            }
            
            .progress-text {
                font-size: 0.8rem;
                min-width: 70px;
            }
            
            body {
                padding-top: 50px;
            }
            
            .header {
                margin-top: 50px;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.insertBefore(progressContainer, document.body.firstChild);
}

// プログレスバーを更新
function updateProgressBar() {
    const totalSections = 12; // overview + 8 steps + authentication + ui-design + site-layout
    const currentSection = document.querySelector('.content-section.active');
    
    if (currentSection) {
        const sectionOrder = [
            'overview', 'step1', 'step2', 'step3', 'step4',
            'step5', 'step6', 'step7', 'step8', 'authentication', 'ui-design', 'site-layout'
        ];
        
        const currentIndex = sectionOrder.indexOf(currentSection.id);
        const percentage = Math.round(((currentIndex + 1) / totalSections) * 100);
        
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressFill && progressPercentage) {
            progressFill.style.width = `${percentage}%`;
            progressPercentage.textContent = percentage;
        }
    }
}

// セクション表示時にプログレスバーも更新
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    updateProgressBar();
};

// 印刷機能
function printPage() {
    window.print();
}

// エクスポート機能（PDF生成のプレースホルダー）
function exportToPDF() {
    alert('PDF エクスポート機能は開発中です。\n現在はブラウザの印刷機能をご利用ください。');
}

// ツールチップ機能
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// ダークモード切り替え（オプション機能）
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// ダークモードの初期化
function initDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// ページ読み込み完了後の追加初期化
window.addEventListener('load', function() {
    initTooltips();
    initDarkMode();
    
    // スムーズスクロールの改善
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
});

// 検索機能（将来の拡張用）
function searchContent(query) {
    // プレースホルダー: 実際の検索機能は将来実装
    console.log('検索クエリ:', query);
}