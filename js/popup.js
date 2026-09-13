
let tab;

chrome.tabs.query({active: true, currentWindow: true}).then(([activeTab]) => {
    tab = activeTab
})


document.querySelector('textarea[name=keywords]').value = localStorage.getItem('filter_keywords') || '前端开发';

document.getElementById('online').checked = !!localStorage.getItem("filterTime")?.includes('online');
document.getElementById('active').checked = !!localStorage.getItem("filterTime")?.includes('刚');
document.getElementById('today').checked = !!localStorage.getItem("filterTime")?.includes('今日');
document.getElementById('day').checked = !!localStorage.getItem("filterTime")?.includes('3日');
document.getElementById('week').checked = !!localStorage.getItem("filterTime")?.includes('周');
document.getElementById('month').checked = !!localStorage.getItem("filterTime")?.includes('月');

// 模式与 AI 配置的读写
const filterMode = localStorage.getItem('filter_mode') || 'keyword';
document.querySelector(`input[name=filterMode][value=${filterMode}]`).checked = true;
document.querySelector('input[name=apiKey]').value = localStorage.getItem('deepseek_api_key') || '';
document.querySelector('textarea[name=aiResume]').value = localStorage.getItem('ai_resume') || '';

// 输入时立即保存到本地, 防止未点开始就关闭弹窗导致丢失
document.querySelector('input[name=apiKey]').addEventListener('input', (e) => {
    localStorage.setItem('deepseek_api_key', e.target.value.trim());
});
document.querySelector('textarea[name=aiResume]').addEventListener('input', (e) => {
    localStorage.setItem('ai_resume', e.target.value.trim());
});

const toggleModeSections = () => {
    const mode = document.querySelector('input[name=filterMode]:checked').value;
    document.getElementById('keywordSection').classList.toggle('d-none', mode !== 'keyword');
    document.getElementById('aiSection').classList.toggle('d-none', mode !== 'ai');
    localStorage.setItem('filter_mode', mode); // 切换时立即记住模式选择
};
document.querySelectorAll('input[name=filterMode]').forEach(radio => radio.addEventListener('change', toggleModeSections));
toggleModeSections();


document.querySelector("#starter").onclick = function() {
    const mode = document.querySelector('input[name=filterMode]:checked').value;
    const keywords = document.querySelector('textarea[name=keywords]').value;
    const filterTime = [];
    document.getElementById('online').checked ? filterTime.push('online') : '';
    document.getElementById('active').checked ? filterTime.push('刚') : '';
    document.getElementById('today').checked ? filterTime.push('今日') : '';
    document.getElementById('day').checked ? filterTime.push('3日') : '';
    document.getElementById('week').checked ? filterTime.push('周') : '';
    document.getElementById('month').checked ? filterTime.push('月') : '';

    const ks = keywords.split(" ").filter(i => i.length > 0);
    localStorage.setItem('filterTime', filterTime.join(' '))
    localStorage.setItem('filter_keywords', ks.join(' '))
    localStorage.setItem('filter_mode', mode)
    localStorage.setItem('deepseek_api_key', document.querySelector('input[name=apiKey]').value.trim())
    localStorage.setItem('ai_resume', document.querySelector('textarea[name=aiResume]').value.trim())

    if(mode === 'keyword' && ks.join(' ').length === 0) {
        alert('请输入关键词')
        return;
    }

    if(mode === 'ai') {
        if(!localStorage.getItem('deepseek_api_key')) {
            alert('请输入 DeepSeek API Key')
            return;
        }
        if(!localStorage.getItem('ai_resume')) {
            alert('请输入个人介绍')
            return;
        }
    }

    if(filterTime.length === 0) {
        alert('至少选择一个活跃时间')
        return;
    }

    const filter = (filterTime, ks, mode, apiKey, resume) => {
        const _filters = [...filterTime];
        const _keywords = [...ks];

        // 注入到 zhipin.com 页面上下文执行, 需把配置"搬运"到页面的 localStorage,
        // 详情页的 content script 才能读到 (插件页与网页的 localStorage 相互隔离)
        localStorage.setItem('filterTime', _filters.join(' '))
        localStorage.setItem('filter_keywords', _keywords.join(' '))
        localStorage.setItem('filter_mode', mode)
        localStorage.setItem('deepseek_api_key', apiKey)
        localStorage.setItem('ai_resume', resume)

        // 非阻塞提示条: 顶部居中, 自动淡出, 复用同一元素避免堆叠
        const toast = (text) => {
            let el = document.getElementById('filter-jobs-toast');
            if(!el) {
                el = document.createElement('div');
                el.id = 'filter-jobs-toast';
                el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:2147483647;'
                    + 'padding:10px 20px;font-size:14px;color:#fff;background:rgba(0,0,0,.75);border-radius:6px;'
                    + 'pointer-events:none;transition:opacity .3s;';
                document.body.appendChild(el);
            }
            el.innerText = text;
            el.style.opacity = '1';
            clearTimeout(el._timer);
            el._timer = setTimeout(() => { el.style.opacity = '0'; }, 1800);
        };

        const run = (item) => {
            const jobInfo = item.querySelector('.job-info');
            if(!jobInfo) {
                return;
            }
            jobInfo.click();

            // 切换职位后等待右侧详情面板刷新, 先检查活跃度, 不符直接跳过不打开详情页
            setTimeout(() => {
                const activeEl = document.querySelector('.boss-active-time');
                const onlineEl = document.querySelector('.boss-online-tag');
                if(!activeEl && !onlineEl) {
                    return;
                }
                const activeText = activeEl?.textContent || '';
                const matchActive = _filters.some(f => {
                    if(f === 'online') return onlineEl !== null;
                    if(f === '刚') return activeText.includes('刚');
                    if(f === '今日') return activeText.includes('今日');
                    if(f === '3日') return activeText.includes('3日');
                    if(f === '周') return activeText.includes('周');
                    if(f === '月') return activeText.includes('本月');
                });

                const toNext = () => {
                    if(item.nextElementSibling) {
                        item.nextElementSibling.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                        setTimeout(() => {
                            run(item.nextElementSibling)
                        }, 2000);
                    } else {
                        alert('本页职位已全部筛选完成');
                    }
                };

                if(!matchActive) {
                    toast(`活跃度不匹配, 跳过: ${activeText.trim()}`);
                    toNext();
                    return;
                }

                // 打开详情页, 轮询窗口关闭后推进下一个 (纯定时器驱动, 不依赖页面焦点, 后台也不会停)
                const moreJobBtn = document.querySelector('.more-job-btn');
                if(!moreJobBtn) {
                    return;
                }
                const detailWin = open(moreJobBtn.href + '&filter_jobs_plugin=yes');
                if(!detailWin) {
                    alert('详情页打开失败，可能被浏览器拦截，请允许弹出窗口后重试');
                    return;
                }
                const timer = setInterval(() => {
                    if(detailWin.closed) {
                        clearInterval(timer);
                        setTimeout(toNext, 1500);
                    }
                }, 500);
            }, 2000);

        }

        const firstCard = document.querySelector(".rec-job-list .job-card-wrap.active");
        if(!firstCard) {
            alert('请先在职位列表中选中一个职位卡片');
            return;
        }
        run(firstCard.parentNode);
    }

    if(tab.url.includes("www.zhipin.com/web/geek/jobs") !== true) {
        alert('请在职位列表页执行');
        open("https://www.zhipin.com/web/geek/jobs", 'geek_job');
    } else {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: filter,
            args: [filterTime, ks, mode, localStorage.getItem('deepseek_api_key') || '', localStorage.getItem('ai_resume') || '']
        });
    }
};
