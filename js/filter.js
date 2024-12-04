if(location.href.includes('filter_jobs_plugin=yes')) {
    setTimeout(() => {
        // const frontend = document.querySelector('.name').textContent.includes('远程') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('js') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('前端') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('ts') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('typescript') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('node') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('vue') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('react') ||
        //     // document.querySelector('.name').textContent.toLowerCase().includes('java') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('后端') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('electron') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('web') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('php') ||
        //     document.querySelector('.name').textContent.toLowerCase().includes('javascript');

        const find = localStorage.getItem('filter_keywords').split(' ').some(item => document.querySelector('.name').textContent.toLowerCase().includes(item));

        const online = document.querySelector(".boss-online-tag");
        const dayOf7 = document.querySelector(".boss-active-time") ? document.querySelector(".boss-active-time").textContent.includes('日') : false;
        const week = document.querySelector(".boss-active-time") ? document.querySelector(".boss-active-time").textContent.includes('周') : false;
        const just = document.querySelector(".boss-active-time") ? document.querySelector(".boss-active-time").textContent.includes('刚') : false;
        const month = document.querySelector(".boss-active-time") ? document.querySelector(".boss-active-time").textContent.includes('本月') : false;

        if(find) {
            if( online === null && dayOf7 === false && week === false && just === false && month === false ) {
                close();
            } else {
                
                setTimeout(() => {
                    fetch(document.querySelector("a.btn.btn-startchat").getAttribute('data-url')).then(res => res.json()).then((res) => {
                        if(res.zpData && res.zpData?.encBossId) {
                            location.href = document.querySelector("a.btn.btn-startchat").getAttribute('redirect-url');
                        } else {
                            alert('此职位无法打招呼, 请检查是否已经达到上限')
                        }
                    })
                }, 1000);
            }
        } else {
            close();
        }
    }, 3000);
}
