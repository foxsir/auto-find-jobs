if(location.href.includes('filter_jobs_plugin=yes')) {

    // 底部浮动条: 展示信息, isError 为 true 时红色, 否则绿色
    const showBar = (text, isError) => {
        const bar = document.createElement('div');
        bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483647;'
            + 'padding:12px 16px;font-size:16px;text-align:center;color:#fff;box-shadow:0 -2px 8px rgba(0,0,0,.3);'
            + (isError ? 'background:#ff4d4f;' : 'background:#52c41a;');
        bar.innerText = text;
        document.body.appendChild(bar);
        return bar;
    };

    setTimeout(async () => {
        const mode = localStorage.getItem('filter_mode') || 'keyword';
        console.dir(`当前筛选模式: ${mode}`);

        let find = false;

        if(mode === 'ai') {
            const title = document.querySelector('.name')?.textContent?.trim() || '';
            const jdEl = document.querySelector('.job-sec-text')
                || document.querySelector('.job-sec .text')
                || document.querySelector('.job-detail');
            const jd = (jdEl?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2000);

            try {
                const result = await chrome.runtime.sendMessage({
                    type: 'ai-match',
                    payload: {
                        apiKey: localStorage.getItem('deepseek_api_key'),
                        resume: localStorage.getItem('ai_resume'),
                        title,
                        jd
                    }
                });
                if(result?.error) {
                    console.dir(`AI 匹配出错: ${result.error}, 关闭窗口`);
                    close();
                    return;
                }
                console.dir(`AI 匹配结果: score=${result.score}, match=${result.match}, 理由: ${result.reason}`);
                find = result.match === true;

                // 在页面底部浮动展示评分条, 倒计时 5 秒后再进行下一步
                const barText = `AI 评分: ${result.score} 分 | ${find ? '匹配' : '不匹配'} | ${result.reason}`;
                const bar = showBar('', !find);
                for(let countdown = 5; countdown > 0; countdown--) {
                    bar.innerText = `${barText} (${countdown}s)`;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch(e) {
                console.dir(`AI 匹配请求失败: ${e.message}, 关闭窗口`);
                close();
                return;
            }
        } else {
            find = localStorage.getItem('filter_keywords')?.split(' ').some(item => document.querySelector('.name').textContent.toLowerCase().includes(item.toLowerCase()));
        }

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
                dayOf3 = document.querySelector(".boss-active-time")?.textContent?.includes('日');
            }
            if(arr.includes("周")) {
                week = document.querySelector(".boss-active-time")?.textContent?.includes('周');
            }
            if(arr.includes("刚")) {
                just = document.querySelector(".boss-active-time")?.textContent?.includes('刚');
            }
            if(arr.includes("月")) {
                month = document.querySelector(".boss-active-time")?.textContent?.includes('本月');
            }
        }

        const activeTimeText = document.querySelector(".boss-active-time")?.textContent?.trim() || '未找到 .boss-active-time 元素';
        console.dir(`活跃度检查: online=${online}, 刚=${just}, 日=${dayOf3}, 周=${week}, 月=${month}, Boss状态: ${activeTimeText}`);

        if(find) {
            if( online === false && dayOf3 === false && week === false && just === false && month === false ) {
                console.dir('活跃度不匹配, 关闭窗口');
                showBar(`活跃度不匹配 (Boss状态: ${activeTimeText}), 关闭窗口`, true);
                await new Promise(resolve => setTimeout(resolve, 3000));
                close();
            } else {

                const chatBtn = document.querySelector("a.btn.btn-startchat");
                if(!chatBtn) {
                    console.dir('未找到打招呼按钮 a.btn.btn-startchat, 选择器可能已失效');
                    showBar('未找到打招呼按钮 a.btn.btn-startchat, 选择器可能已失效', true);
                    return; // 不关窗, 保留现场便于排查
                }

                setTimeout(() => {
                    let chatUrl;
                    try {
                        chatUrl = new URL(chatBtn.getAttribute('data-url'), location.href);
                    } catch(e) {
                        chatUrl = null;
                    }
                    if(!chatUrl || !/(^|\.)zhipin\.com$/.test(chatUrl.hostname)) {
                        console.dir('data-url 校验失败, 已阻止请求非法域名');
                        showBar('data-url 校验失败, 已阻止请求非法域名', true);
                        return;
                    }
                    fetch(chatUrl.href).then(res => res.json()).then((res) => {
                        if(res.zpData && res.zpData?.encBossId) {
                            location.href = chatBtn.getAttribute('redirect-url');
                        } else {
                            const div = document.createElement("div");
                            div.innerText = '此职位无法打招呼, 请检查是否已经达到上限';
                            div.style.paddingTop = '100px';
                            div.style.textAlign  = 'center';
                            div.style.fontSize  = '20px';
                            div.style.paddingBottom = '50px';
                            document.body.insertBefore(div, document.querySelector('div'));
                        }
                    }).catch(e => {
                        console.dir(`打招呼请求失败: ${e.message}`);
                        showBar(`打招呼请求失败: ${e.message}`, true);
                    });
                }, 1000);
            }
        } else {
            console.dir(mode === 'ai' ? 'AI 判定不匹配, 关闭窗口' : '关键词不匹配, 关闭窗口');
            close();
        }
    }, 3000);


    setTimeout(() => {
        window.close();
    }, 30000);
}