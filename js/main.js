    // DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const searchInput = document.getElementById('searchInput');
    const searchInputMobile = document.getElementById('searchInputMobile');
    const searchClear = document.getElementById('searchClear');
    const searchClearMobile = document.getElementById('searchClearMobile');
    const navItems = document.querySelectorAll('.nav-item.has-submenu');
    const subNavItems = document.querySelectorAll('.sub-nav-item');
    const contentItems = document.querySelectorAll('.content-item');
    const subCategoryContents = document.querySelectorAll('.sub-category-content');
    const subTabs = document.querySelectorAll('.sub-tab');
    const sections = document.querySelectorAll('.category-section:not(#search-results)');
    const contentArea = document.querySelector('.content');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    
    // 滚动锁定标记
    let isManualScroll = false;
    let scrollTimeout;
    
    // 主题切换功能
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // 更新按钮图标
        const icon = isDarkMode ? '☀️' : '🌙';
        if (themeToggle) themeToggle.textContent = icon;
        if (themeToggleMobile) themeToggleMobile.textContent = icon;
        
        // 保存主题偏好到localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
    
    // 从localStorage加载主题
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.textContent = '☀️';
            if (themeToggleMobile) themeToggleMobile.textContent = '☀️';
        }
    }
    
    // 绑定主题切换按钮事件
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }
    
    // 页面加载时应用保存的主题
    loadTheme();
    
    // 菜单按钮点击事件（移动端）
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // 点击内容区关闭菜单（移动端）
    if (contentArea) {
        contentArea.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    }

    // 二级菜单点击展开/收起
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const subNav = this.nextElementSibling;
            if (!subNav || !subNav.classList.contains('sub-nav')) return;
            
            // 切换展开状态
            const isExpanded = this.classList.contains('expanded');
            
            // 关闭所有其他展开的菜单，并移除激活状态
            navItems.forEach(nav => {
                nav.classList.remove('expanded');
                nav.classList.remove('active');
                const navSubNav = nav.nextElementSibling;
                if (navSubNav && navSubNav.classList.contains('sub-nav')) {
                    navSubNav.classList.remove('show');
                }
            });
            
            // 如果之前是收起状态，现在展开
            if (!isExpanded) {
                this.classList.add('expanded');
                this.classList.add('active');
                subNav.classList.add('show');
                
                // 激活对应的二级菜单项（第一个）
                const firstSubNavItem = subNav.querySelector('.sub-nav-item');
                if (firstSubNavItem) {
                    subNavItems.forEach(nav => nav.classList.remove('active'));
                    firstSubNavItem.classList.add('active');
                }
                
                // 移动端点击一级菜单跳转到对应section
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    const targetSection = document.getElementById(sectionId);
                    if (targetSection) {
                        // 标记为手动滚动
                        isManualScroll = true;
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            isManualScroll = false;
                        }, 500);
                        
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            } else {
                // 如果之前是展开状态，现在收起，移除active状态
                this.classList.remove('active');
            }
            
            // 移动端点击后关闭侧边栏
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    });

    // 二级菜单点击跳转
    subNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 清空搜索框（如果当前有搜索内容）
            const isMobile = window.innerWidth <= 768;
            const searchInputActive = isMobile ? searchInputMobile : searchInput;
            const clearButtonActive = isMobile ? searchClearMobile : searchClear;
            
            if (searchInputActive && searchInputActive.value.length > 0) {
                searchInputActive.value = '';
                handleSearch('');
                updateClearButton(searchInputActive, clearButtonActive);
            }
            
            // 更新激活状态
            subNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // 更新一级菜单激活状态
            const parentSubNav = this.closest('.sub-nav');
            const parentNavItem = parentSubNav.previousElementSibling;
            navItems.forEach(nav => nav.classList.remove('active'));
            if (parentNavItem) {
                parentNavItem.classList.add('active');
            }
            
            // 获取目标区域ID
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 检查是否是小分类内容
                if (targetElement.classList.contains('sub-category-content')) {
                    // 激活对应的小分类标签
                    const section = targetElement.closest('.category-section');
                    const sectionId = section.getAttribute('id');
                    const tabName = targetId.replace(`${sectionId}-`, '');
                    
                    section.querySelectorAll('.sub-tab').forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.getAttribute('data-tab') === tabName) {
                            tab.classList.add('active');
                        }
                    });
                    
                    section.querySelectorAll('.sub-category-content').forEach(content => {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    });
                    targetElement.classList.add('active');
                    targetElement.style.display = 'block';
                    
                    // 移动端：先关闭侧边栏，再滚动
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('show');
                        
                        // 延迟滚动，确保侧边栏关闭后再滚动
                        setTimeout(() => {
                            // 滚动到大分类的位置
                            const sectionElement = document.getElementById(sectionId);
                            if (sectionElement) {
                                // 标记为手动滚动
                                isManualScroll = true;
                                clearTimeout(scrollTimeout);
                                scrollTimeout = setTimeout(() => {
                                    isManualScroll = false;
                                }, 500);
                                
                                sectionElement.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }
                        }, 300);
                    } else {
                        // 桌面端：直接滚动
                        const sectionElement = document.getElementById(sectionId);
                        if (sectionElement) {
                            // 标记为手动滚动
                            isManualScroll = true;
                            clearTimeout(scrollTimeout);
                            scrollTimeout = setTimeout(() => {
                                isManualScroll = false;
                            }, 500);
                            
                            sectionElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                }
            }
        });
    });
    // 小分类标签点击切换功能
    subTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 获取点击的标签数据
            const tabName = this.getAttribute('data-tab');
            const section = this.closest('.category-section');
            const sectionId = section.getAttribute('id');
            
            // 移除当前section下所有标签的active状态
            section.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            // 激活当前标签
            this.classList.add('active');
            
            // 隐藏当前section下所有内容
            section.querySelectorAll('.sub-category-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // 显示对应的内容
            const targetContent = document.getElementById(`${sectionId}-${tabName}`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
            
            // 清空搜索框（如果当前有搜索内容）
            const isMobile = window.innerWidth <= 768;
            const searchInputActive = isMobile ? searchInputMobile : searchInput;
            const clearButtonActive = isMobile ? searchClearMobile : searchClear;
            
            if (searchInputActive && searchInputActive.value.length > 0) {
                searchInputActive.value = '';
                handleSearch('');
                updateClearButton(searchInputActive, clearButtonActive);
            }
        });
    });

    // 搜索过滤功能（桌面端）
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            handleSearch(e.target.value);
            updateClearButton(searchInput, searchClear);
        });
    }
    
    // 搜索过滤功能（移动端）
    if (searchInputMobile) {
        searchInputMobile.addEventListener('input', function(e) {
            handleSearch(e.target.value);
            updateClearButton(searchInputMobile, searchClearMobile);
        });
    }
    
    // 清空按钮功能（桌面端）
    if (searchClear) {
        searchClear.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                handleSearch('');
                updateClearButton(searchInput, searchClear);
                searchInput.focus();
            }
        });
    }
    
    // 清空按钮功能（移动端）
    if (searchClearMobile) {
        searchClearMobile.addEventListener('click', function() {
            if (searchInputMobile) {
                searchInputMobile.value = '';
                handleSearch('');
                updateClearButton(searchInputMobile, searchClearMobile);
                searchInputMobile.focus();
            }
        });
    }
    
    // 更新清空按钮显示状态
    function updateClearButton(inputElement, clearButton) {
        if (!inputElement || !clearButton) return;
        
        if (inputElement.value.length > 0) {
            clearButton.classList.add('show');
        } else {
            clearButton.classList.remove('show');
        }
    }
    
    // 处理搜索逻辑（支持拼音和拼音首字母）
    function handleSearch(searchText) {
        searchText = searchText.toLowerCase().trim();
        
        // 获取搜索结果页面元素
        const searchResultsSection = document.getElementById('search-results');
        const searchResultsList = document.getElementById('search-results-list');
        
        // 如果是清空搜索，隐藏搜索结果页面，显示原来的内容
        if (searchText === '') {
            if (searchResultsSection) {
                searchResultsSection.style.display = 'none';
            }
            
            // 显示所有分类section
            sections.forEach(section => {
                section.style.display = 'block';
            });
            
            // 激活第一个小分类，只显示第一个小分类的内容
            sections.forEach(section => {
                const firstContent = section.querySelector('.sub-category-content');
                const firstTab = section.querySelector('.sub-tab');
                
                if (firstContent && firstTab) {
                    section.querySelectorAll('.sub-category-content').forEach(content => {
                        content.classList.remove('active');
                        content.style.display = 'none';
                    });
                    
                    section.querySelectorAll('.sub-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    firstContent.classList.add('active');
                    firstContent.style.display = 'block';
                    firstTab.classList.add('active');
                }
            });
        } else {
            // 搜索时，隐藏所有分类section，显示搜索结果页面
            if (searchResultsSection && searchResultsList) {
                // 隐藏所有分类section
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // 显示搜索结果页面
                searchResultsSection.style.display = 'block';
                
                // 清空之前的搜索结果
                searchResultsList.innerHTML = '';
                
                // 遍历所有内容项，收集匹配的结果
                let matchCount = 0;
                contentItems.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    const pinyin = convertToPinyin(text);
                    const pinyinInitials = getInitials(text);
                    
                    if (text.includes(searchText) || 
                        pinyin.includes(searchText) || 
                        pinyinInitials.includes(searchText)) {
                        matchCount++;
                        
                        // 克隆匹配的内容项
                        const clonedItem = item.cloneNode(true);
                        searchResultsList.appendChild(clonedItem);
                    }
                });
                
                // 如果没有匹配结果，显示提示
                if (matchCount === 0) {
                    const noResult = document.createElement('div');
                    noResult.className = 'no-result';
                    noResult.style.padding = '20px';
                    noResult.style.textAlign = 'center';
                    noResult.style.color = '#999';
                    noResult.textContent = '没有找到匹配的内容';
                    searchResultsList.appendChild(noResult);
                }
            }
        }
    }

    // 使用pinyinlite库进行拼音转换
    function convertToPinyin(text) {
        if (typeof pinyinlite === 'undefined') {
            console.warn('pinyinlite库未加载，使用基础拼音映射');
            return text;
        }
        
        try {
            // 使用pinyinlite库获取所有可能的拼音组合
            const pinyinResults = pinyinlite(text);
            
            // 将所有拼音组合拼接成一个字符串
            const allPinyins = pinyinResults
                .map(arr => arr.filter(p => p && p.length > 0).join(''))
                .filter(p => p.length > 0)
                .join(' ');
            
            // 生成所有可能的拼音组合（处理多音字）
            if (pinyinResults.length > 0) {
                const combinations = generatePinyinCombinations(pinyinResults);
                return combinations.join(' ').toLowerCase();
            }
            
            return text.toLowerCase();
        } catch (error) {
            console.warn('拼音转换失败:', error);
            return text.toLowerCase();
        }
    }

    // 生成所有拼音组合的辅助函数
    function generatePinyinCombinations(pinyinArrays) {
        if (pinyinArrays.length === 0) return [];
        
        // 初始结果为第一个拼音数组的所有可能值
        let result = pinyinArrays[0].filter(p => p && p.length > 0);
        
        // 对于后续的拼音数组，生成所有可能的组合
        for (let i = 1; i < pinyinArrays.length; i++) {
            const currentPinyins = pinyinArrays[i].filter(p => p && p.length > 0);
            const newResult = [];
            
            for (const r of result) {
                for (const p of currentPinyins) {
                    newResult.push(r + p);
                }
            }
            
            result = newResult;
        }
        
        return result;
    }

    // 获取拼音首字母
    function getInitials(text) {
        if (typeof pinyinlite === 'undefined') {
            console.warn('pinyinlite库未加载，无法获取首字母');
            return '';
        }
        
        try {
            const pinyinResults = pinyinlite(text);
            
            // 获取每个字的首字母
            const initials = pinyinResults
                .map(arr => {
                    if (arr && arr.length > 0) {
                        return arr[0][0]; // 取第一个拼音的首字母
                    }
                    return '';
                })
                .filter(char => char && char.length > 0)
                .join('');
            
            return initials.toLowerCase();
        } catch (error) {
            console.warn('获取拼音首字母失败:', error);
            return '';
        }
    }

    // 过滤小分类和大分类（根据内容项是否匹配）
    function filterCategories(searchText) {
        // 搜索时，先移除所有小分类标签的激活状态
        if (searchText !== '') {
            sections.forEach(section => {
                section.querySelectorAll('.sub-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
            });
        }
        
        subCategoryContents.forEach(content => {
            const visibleItems = content.querySelectorAll('.content-item');
            const hasVisibleItems = Array.from(visibleItems).some(item => {
                return item.style.display !== 'none';
            });
            
            // 搜索时，显示所有有匹配内容的小分类
            // 非搜索时，不重新设置内容区域的display，保持handleSearch设置的状态
            if (searchText === '') {
                // 清空搜索时，不重新设置内容区域的display
                // handleSearch函数已经设置了正确的状态
                // 这里只更新标签状态
            } else if (hasVisibleItems) {
                content.style.display = 'block';
                // 同时激活对应的小分类标签和内容区域
                const section = content.closest('.category-section');
                if (section) {
                    const contentId = content.getAttribute('id');
                    const tabName = contentId.replace(`${section.getAttribute('id')}-`, '');
                    const matchingTab = section.querySelector(`.sub-tab[data-tab="${tabName}"]`);
                    if (matchingTab) {
                        matchingTab.classList.add('active');
                        // 同时激活内容区域
                        content.classList.add('active');
                    }
                }
            } else {
                content.style.display = 'none';
            }
        });

        // 过滤大分类
        sections.forEach(section => {
            const visibleSubCats = section.querySelectorAll('.sub-category-content');
            const hasVisibleSubCats = Array.from(visibleSubCats).some(subCat => {
                return subCat.style.display !== 'none';
            });
            
            if (searchText === '' || hasVisibleSubCats) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    // 滚动监听，自动更新导航激活状态
    let isScrolling = false;

    contentArea.addEventListener('scroll', function() {
        // 如果是手动滚动，暂时不更新激活状态
        if (isManualScroll) return;
        
        if (isScrolling) return;
        
        isScrolling = true;
        
        requestAnimationFrame(() => {
            const scrollTop = this.scrollTop;
            let currentSection = '';
            let currentSubCategory = '';
            
            // 遍历所有section找到当前在视口中的
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                if (section.style.display === 'none') continue;
                
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.clientHeight;
                
                // 如果section顶部已经滚过视口顶部，并且section底部还在视口内
                if (scrollTop >= sectionTop - 50 && scrollTop < sectionBottom - 50) {
                    currentSection = section.id;
                    
                    // 找到当前可见的小分类
                    const activeContent = section.querySelector('.sub-category-content.active');
                    if (activeContent) {
                        currentSubCategory = activeContent.id;
                    }
                    break;
                }
            }
            
            // 如果没有匹配的，检查是否在底部
            if (!currentSection) {
                const lastSection = Array.from(sections).reverse().find(section => 
                    section.style.display !== 'none'
                );
                if (lastSection && scrollTop >= lastSection.offsetTop) {
                    currentSection = lastSection.id;
                    const activeContent = lastSection.querySelector('.sub-category-content.active');
                    if (activeContent) {
                        currentSubCategory = activeContent.id;
                    }
                }
            }

            // 更新导航激活状态
            if (currentSection) {
                // 更新一级菜单
                navItems.forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('data-section') === currentSection) {
                        nav.classList.add('active');
                        // 确保对应的二级菜单展开
                        const subNav = nav.nextElementSibling;
                        if (subNav && subNav.classList.contains('sub-nav')) {
                            nav.classList.add('expanded');
                            subNav.classList.add('show');
                        }
                    }
                });
                
                // 更新二级菜单
                subNavItems.forEach(nav => {
                    nav.classList.remove('active');
                    const targetId = nav.getAttribute('href').substring(1);
                    if (targetId === currentSection || targetId === currentSubCategory) {
                        nav.classList.add('active');
                    }
                });
            }

            // 在移动端，确保激活的导航项滚动到可视区域
            if (window.innerWidth <= 768 && currentSection) {
                const activeSubNav = document.querySelector(`.sub-nav-item[href="#${currentSubCategory || currentSection}"]`);
                if (activeSubNav) {
                    activeSubNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }

            isScrolling = false;
        });
    });

    // 初始化时确保第一个可见的大分类被激活
    function initializeActiveNav() {
        const firstVisibleSection = Array.from(sections).find(section => 
            section.style.display !== 'none'
        );
        
        if (firstVisibleSection) {
            const sectionId = firstVisibleSection.getAttribute('id');
            
            // 更新一级菜单
            navItems.forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-section') === sectionId) {
                    nav.classList.add('active');
                    const subNav = nav.nextElementSibling;
                    if (subNav && subNav.classList.contains('sub-nav')) {
                        nav.classList.add('expanded');
                        subNav.classList.add('show');
                    }
                }
            });
            
            // 更新二级菜单
            const activeContent = firstVisibleSection.querySelector('.sub-category-content.active');
            if (activeContent) {
                const subCategoryId = activeContent.getAttribute('id');
                subNavItems.forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('href') === `#${subCategoryId}`) {
                        nav.classList.add('active');
                    }
                });
            }
        }
    }

    // 页面加载完成后初始化
    initializeActiveNav();

    // 窗口大小改变时重新调整
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initializeActiveNav();
        }, 250);
    });
});