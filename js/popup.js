
let tab;

chrome.tabs.query({active: true, currentWindow: true}).then(([activeTab]) => {
    tab = activeTab
})


document.querySelector('textarea[name=keywords]').value = localStorage.getItem('filter_keywords') || '前端开发';

document.getElementById('online').checked = localStorage.getItem("filterTime").includes('online');
document.getElementById('active').checked = localStorage.getItem("filterTime").includes('刚');
document.getElementById('day').checked = localStorage.getItem("filterTime").includes('日');
document.getElementById('week').checked = localStorage.getItem("filterTime").includes('周');
document.getElementById('month').checked = localStorage.getItem("filterTime").includes('月');


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

        const run = () => {
            const jobList = document.querySelectorAll(".job-list-box>li");
            jobList.forEach((item, index) => {
                let link = item.querySelector('.job-card-body > a').href;

                setTimeout(() => {
                    open(`${link}&filter_jobs_plugin=yes`);

                    if(jobList.length - 1 === index) {
                        if(!document.querySelector('.options-pages').lastChild.className.includes('disabled')) {
                            document.querySelector('.options-pages').lastChild.click();
                            setTimeout(() => {
                                run();
                            }, 3000)
                        }
                    }
                }, index * 8000)
            })
        }

        run();
    }

    if(tab.url.includes("www.zhipin.com/web/geek/job") !== true) {
        alert('请在职位列表页执行');
        open("www.zhipin.com/web/geek/job", 'geek_job');
    } else {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: filter,
            args: [filterTime, ks]
        });
    }
};
