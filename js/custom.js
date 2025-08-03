// 自定义JavaScript功能增强

(function() {
    'use strict';

    // ===== 全局配置 =====
    const CONFIG = {
        scrollThreshold: 300,
        animationDuration: 300,
        lazyLoadThreshold: 0.1
    };

    // ===== 工具函数 =====
    const utils = {
        // 节流函数
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // 防抖函数
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 检查元素是否在视口中
        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // 平滑滚动到指定元素
        smoothScrollTo(element, duration = CONFIG.animationDuration) {
            const targetPosition = element.offsetTop;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        }
    };

    // ===== 返回顶部功能 =====
    class BackToTop {
        constructor() {
            this.button = null;
            this.init();
        }

        init() {
            this.createButton();
            this.bindEvents();
        }

        createButton() {
            this.button = document.createElement('div');
            this.button.className = 'back-to-top';
            this.button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 15l-6-6-6 6"/>
                </svg>
            `;
            this.button.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #3498db, #2ecc71);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
            `;
            document.body.appendChild(this.button);
        }

        bindEvents() {
            this.button.addEventListener('click', () => {
                utils.smoothScrollTo(document.body);
            });

            window.addEventListener('scroll', utils.throttle(() => {
                this.toggleVisibility();
            }, 100));
        }

        toggleVisibility() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > CONFIG.scrollThreshold) {
                this.button.style.opacity = '1';
                this.button.style.visibility = 'visible';
                this.button.style.transform = 'translateY(0)';
            } else {
                this.button.style.opacity = '0';
                this.button.style.visibility = 'hidden';
                this.button.style.transform = 'translateY(20px)';
            }
        }
    }

    // ===== 图片懒加载 =====
    class LazyLoader {
        constructor() {
            this.images = [];
            this.init();
        }

        init() {
            this.images = document.querySelectorAll('img[data-src]');
            this.bindEvents();
            this.loadVisibleImages();
        }

        bindEvents() {
            window.addEventListener('scroll', utils.throttle(() => {
                this.loadVisibleImages();
            }, 100));

            window.addEventListener('resize', utils.debounce(() => {
                this.loadVisibleImages();
            }, 250));
        }

        loadVisibleImages() {
            this.images.forEach(img => {
                if (this.isImageVisible(img)) {
                    this.loadImage(img);
                }
            });
        }

        isImageVisible(img) {
            const rect = img.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            return rect.top <= windowHeight * (1 + CONFIG.lazyLoadThreshold) && 
                   rect.bottom >= -windowHeight * CONFIG.lazyLoadThreshold;
        }

        loadImage(img) {
            const src = img.getAttribute('data-src');
            if (!src) return;

            // 创建新图片对象进行预加载
            const tempImage = new Image();
            tempImage.onload = () => {
                img.src = src;
                img.classList.add('fade-in-up');
                img.removeAttribute('data-src');
                this.images = Array.from(this.images).filter(i => i !== img);
            };
            tempImage.src = src;
        }
    }

    // ===== 代码高亮增强 =====
    class CodeHighlighter {
        constructor() {
            this.init();
        }

        init() {
            this.addCopyButtons();
            this.addLineNumbers();
            this.addSyntaxHighlighting();
        }

        addCopyButtons() {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                const button = document.createElement('button');
                button.className = 'copy-code-btn';
                button.innerHTML = '复制';
                button.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(52, 152, 219, 0.8);
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.3s ease;
                `;

                button.addEventListener('click', () => {
                    this.copyToClipboard(block.textContent, button);
                });

                block.parentElement.style.position = 'relative';
                block.parentElement.appendChild(button);
            });
        }

        copyToClipboard(text, button) {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '已复制!';
                button.style.background = 'rgba(46, 204, 113, 0.8)';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = 'rgba(52, 152, 219, 0.8)';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                button.innerHTML = '复制失败';
                button.style.background = 'rgba(231, 76, 60, 0.8)';
            });
        }

        addLineNumbers() {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                const lines = block.textContent.split('\n');
                if (lines.length > 1) {
                    const lineNumbers = document.createElement('div');
                    lineNumbers.className = 'line-numbers';
                    lineNumbers.style.cssText = `
                        position: absolute;
                        left: 10px;
                        top: 20px;
                        color: rgba(255, 255, 255, 0.5);
                        font-family: monospace;
                        font-size: 12px;
                        line-height: 1.5;
                        user-select: none;
                    `;
                    
                    lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
                    block.parentElement.appendChild(lineNumbers);
                }
            });
        }

        addSyntaxHighlighting() {
            // 简单的语法高亮
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                let code = block.innerHTML;
                
                // JavaScript 关键字高亮
                const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'async', 'await'];
                keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                    code = code.replace(regex, `<span style="color: #e74c3c; font-weight: bold;">${keyword}</span>`);
                });

                // 字符串高亮
                code = code.replace(/(['"`])(.*?)\1/g, '<span style="color: #2ecc71;">$&</span>');
                
                // 注释高亮
                code = code.replace(/(\/\/.*$)/gm, '<span style="color: #95a5a6; font-style: italic;">$1</span>');
                code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #95a5a6; font-style: italic;">$1</span>');

                block.innerHTML = code;
            });
        }
    }

    // ===== 搜索功能 =====
    class Search {
        constructor() {
            this.searchInput = null;
            this.searchResults = null;
            this.init();
        }

        init() {
            this.createSearchUI();
            this.bindEvents();
        }

        createSearchUI() {
            // 创建搜索输入框
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.placeholder = '搜索文章...';
            this.searchInput.className = 'search-input';
            this.searchInput.style.cssText = `
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #ecf0f1;
                border-radius: 25px;
                font-size: 14px;
                outline: none;
                transition: all 0.3s ease;
                margin-bottom: 20px;
            `;

            // 创建搜索结果容器
            this.searchResults = document.createElement('div');
            this.searchResults.className = 'search-results';
            this.searchResults.style.cssText = `
                display: none;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                max-height: 400px;
                overflow-y: auto;
            `;

            // 插入到页面中
            const container = document.querySelector('.sidebar') || document.body;
            container.insertBefore(this.searchInput, container.firstChild);
            container.insertBefore(this.searchResults, this.searchInput.nextSibling);
        }

        bindEvents() {
            this.searchInput.addEventListener('input', utils.debounce(() => {
                this.performSearch();
            }, 300));

            this.searchInput.addEventListener('focus', () => {
                this.searchInput.style.borderColor = '#3498db';
                this.searchInput.style.boxShadow = '0 0 0 3px rgba(52, 152, 219, 0.1)';
            });

            this.searchInput.addEventListener('blur', () => {
                this.searchInput.style.borderColor = '#ecf0f1';
                this.searchInput.style.boxShadow = 'none';
            });
        }

        performSearch() {
            const query = this.searchInput.value.trim().toLowerCase();
            if (query.length < 2) {
                this.hideResults();
                return;
            }

            const results = this.searchPosts(query);
            this.displayResults(results);
        }

        searchPosts(query) {
            const posts = document.querySelectorAll('.post-card, article');
            const results = [];

            posts.forEach(post => {
                const title = post.querySelector('h1, h2, h3, .post-title')?.textContent || '';
                const content = post.textContent || '';
                
                if (title.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
                    results.push({
                        title: title,
                        url: post.querySelector('a')?.href || '#',
                        excerpt: this.getExcerpt(content, query)
                    });
                }
            });

            return results;
        }

        getExcerpt(content, query) {
            const index = content.toLowerCase().indexOf(query);
            if (index === -1) return content.substring(0, 100) + '...';
            
            const start = Math.max(0, index - 50);
            const end = Math.min(content.length, index + 100);
            return '...' + content.substring(start, end) + '...';
        }

        displayResults(results) {
            if (results.length === 0) {
                this.searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #7f8c8d;">未找到相关结果</div>';
            } else {
                this.searchResults.innerHTML = results.map(result => `
                    <div class="search-result-item" style="padding: 15px; border-bottom: 1px solid #ecf0f1; cursor: pointer; transition: background 0.3s ease;">
                        <div style="font-weight: bold; color: #2c3e50; margin-bottom: 5px;">${result.title}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">${result.excerpt}</div>
                    </div>
                `).join('');

                // 绑定点击事件
                this.searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
                    item.addEventListener('click', () => {
                        window.location.href = results[index].url;
                    });
                });
            }

            this.searchResults.style.display = 'block';
        }

        hideResults() {
            this.searchResults.style.display = 'none';
        }
    }

    // ===== 主题切换功能 =====
    class ThemeSwitcher {
        constructor() {
            this.currentTheme = 'light';
            this.init();
        }

        init() {
            this.createThemeToggle();
            this.loadSavedTheme();
        }

        createThemeToggle() {
            const toggle = document.createElement('button');
            toggle.className = 'theme-toggle';
            toggle.innerHTML = '🌙';
            toggle.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                z-index: 1001;
            `;

            toggle.addEventListener('click', () => {
                this.toggleTheme();
            });

            document.body.appendChild(toggle);
        }

        toggleTheme() {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            this.saveTheme();
        }

        applyTheme() {
            const root = document.documentElement;
            const toggle = document.querySelector('.theme-toggle');

            if (this.currentTheme === 'dark') {
                root.style.setProperty('--bg-color', '#1a1a1a');
                root.style.setProperty('--text-color', '#ffffff');
                root.style.setProperty('--border-color', '#333333');
                toggle.innerHTML = '☀️';
            } else {
                root.style.setProperty('--bg-color', '#ffffff');
                root.style.setProperty('--text-color', '#2c3e50');
                root.style.setProperty('--border-color', '#ecf0f1');
                toggle.innerHTML = '🌙';
            }
        }

        saveTheme() {
            localStorage.setItem('theme', this.currentTheme);
        }

        loadSavedTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.currentTheme = savedTheme;
                this.applyTheme();
            }
        }
    }

    // ===== 页面加载动画 =====
    class PageLoader {
        constructor() {
            this.init();
        }

        init() {
            this.createLoader();
            this.bindEvents();
        }

        createLoader() {
            const loader = document.createElement('div');
            loader.className = 'page-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <div class="loader-text">加载中...</div>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease;
            `;

            const content = loader.querySelector('.loader-content');
            content.style.cssText = `
                text-align: center;
                color: white;
            `;

            const spinner = loader.querySelector('.spinner');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-top: 4px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            `;

            const text = loader.querySelector('.loader-text');
            text.style.cssText = `
                font-size: 16px;
                font-weight: 500;
            `;

            document.body.appendChild(loader);
        }

        bindEvents() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const loader = document.querySelector('.page-loader');
                    if (loader) {
                        loader.style.opacity = '0';
                        setTimeout(() => {
                            loader.remove();
                        }, 500);
                    }
                }, 1000);
            });
        }
    }

    // ===== 初始化所有功能 =====
    function init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFeatures);
        } else {
            initFeatures();
        }
    }

    function initFeatures() {
        new BackToTop();
        new LazyLoader();
        new CodeHighlighter();
        new Search();
        new ThemeSwitcher();
        new PageLoader();

        // 添加页面进入动画
        document.body.classList.add('fade-in-up');
    }

    // 启动应用
    init();

})(); 