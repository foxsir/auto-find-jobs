
let tab;

chrome.tabs.query({active: true, currentWindow: true}).then(([activeTab]) => {
    tab = activeTab
})


document.querySelector('textarea[name=keywords]').value = localStorage.getItem('filter_keywords') || '前端开发';

document.getElementById('online').checked = !!localStorage.getItem("filterTime")?.includes('online');
document.getElementById('active').checked = !!localStorage.getItem("filterTime")?.includes('刚');
document.getElementById('day').checked = !!localStorage.getItem("filterTime")?.includes('日');
document.getElementById('week').checked = !!localStorage.getItem("filterTime")?.includes('周');
document.getElementById('month').checked = !!localStorage.getItem("filterTime")?.includes('月');


document.querySelector("#starter").onclick = function() {
    const keywords = document.querySelector('textarea[name=keywords]').value;
    const filterTime = [];
    document.getElementById('online').checked ? filterTime.push('online') : '';
    document.getElementById('active').checked ? filterTime.push('刚') : '';
    document.getElementById('day').checked ? filterTime.push('日') : '';
    document.getElementById('week').checked ? filterTime.push('周') : '';
    document.getElementById('month').checked ? filterTime.push('月') : '';

    const ks = keywords.split(" ").filter(i => i.length > 0);
    localStorage.setItem('filterTime', filterTime.join(' '))
    localStorage.setItem('filter_keywords', ks.join(' '))

    if(ks.join(' ').length === 0) {
        alert('请输入关键词')
        return;
    }

    if(filterTime.length === 0) {
        alert('至少选择一个活跃时间')
        return;
    }

    const filter = (filterTime, ks) => {
        const _filters = [...filterTime];
        const _keywords = [...ks];

        localStorage.setItem('filterTime', _filters.join(' '))
        localStorage.setItem('filter_keywords', _keywords.join(' '))

        const run = (item) => {
            item.querySelector('.job-info').click();
            
            setTimeout(() => {
                open(document.querySelector('.more-job-btn').href + '&filter_jobs_plugin=yes');
    
            
                if(item.nextElementSibling) {
                    item.nextElementSibling?.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                    setTimeout(() => {
                        run(item.nextElementSibling)
                    }, 2000);
                } else {
                    alert('本页职位已全部筛选完成');
                }
            }, 2000);
            
        }

        run(document.querySelector(".rec-job-list .job-card-wrap.active").parentNode);
    }

    if(tab.url.includes("www.zhipin.com/web/geek/jobs") !== true) {
        alert('请在职位列表页执行');
        open("https://www.zhipin.com/web/geek/jobs", 'geek_job');
    } else {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: filter,
            args: [filterTime, ks]
        });
    }
};
