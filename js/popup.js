
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

        const run = (item) => {
            const jobInfo = item.querySelector('.job-info');
            if(!jobInfo) {
                alert('未找到 .job-info，Boss直聘页面结构可能已变更，请更新插件');
                return;
            }
            jobInfo.click();

            if(!window.onfocus) {
                const moreJobBtn = document.querySelector('.more-job-btn');
                open(moreJobBtn.href + '&filter_jobs_plugin=yes');

                if(item.nextElementSibling) {
                    item.nextElementSibling?.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                    setTimeout(() => {
                        run(item.nextElementSibling)
                    }, 2000);
                } else {
                    alert('本页职位已全部筛选完成');
                }
            }
            window.onfocus = () => {
                setTimeout(() => {
                    const moreJobBtn = document.querySelector('.more-job-btn');
                    open(moreJobBtn.href + '&filter_jobs_plugin=yes');

                    if(item.nextElementSibling) {
                        item.nextElementSibling?.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                        setTimeout(() => {
                            run(item.nextElementSibling)
                        }, 2000);
                    } else {
                        alert('本页职位已全部筛选完成');
                        window.onfocus = null;
                    }
                }, 2000);
            };

        }

        const firstCard = document.querySelector(".rec-job-list .job-card-wrap.active");
        if(!firstCard) {
            alert('请先在职位列表中选中一个职位卡片，或页面结构已变更请更新插件');
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
