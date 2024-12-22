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

        let online = false;
        let dayOf3 = false;
        let week = false;
        let just = false;
        let month = false;


        const filterTime = localStorage.getItem("filterTime");
        if(filterTime) {
            const arr = filterTime.split(" ");
            if(arr.includes("online")) {
                online = document.querySelector(".boss-online-tag") !== null;
            }
            if(arr.includes("日")) {
                dayOf3 = document.querySelector(".boss-active-time").textContent.includes('日');
            }
            if(arr.includes("周")) {
                week = document.querySelector(".boss-active-time").textContent.includes('周');
            }
            if(arr.includes("刚")) {
                just = document.querySelector(".boss-active-time").textContent.includes('刚');
            }
            if(arr.includes("月")) {
                month = document.querySelector(".boss-active-time").textContent.includes('本月');
            }
        }

        if(find) {
            if( online === false && dayOf3 === false && week === false && just === false && month === false ) {
                close();
            } else {
                
                setTimeout(() => {
                    fetch(document.querySelector("a.btn.btn-startchat").getAttribute('data-url')).then(res => res.json()).then((res) => {
                        if(res.zpData && res.zpData?.encBossId) {
                            location.href = document.querySelector("a.btn.btn-startchat").getAttribute('redirect-url');
                        } else {
                            const div = document.createElement("div");
                            div.innerText = '此职位无法打招呼, 请检查是否已经达到上限';
                            div.style.paddingTop = '100px';
                            div.style.textAlign  = 'center';
                            div.style.fontSize  = '20px';
                            div.style.paddingBottom = '50px';
                            document.body.insertBefore(div, document.querySelector('div'));
                        }
                    })
                }, 1000);
            }
        } else {
            close();
        }
    }, 3000);
}
