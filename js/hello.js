function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    if(location.href.includes('/web/geek/jobs')) {
        return;
    }

    if(location.href.includes('/web/geek/chat')) {
        setTimeout(() => {
            window.close();
        }, 20000);

        await sleep(3000);
        const chatMessage = document.querySelector('.chat-message');
        if(!chatMessage) {
            alert('未找到 .chat-message，Boss直聘页面结构可能已变更，请更新插件');
            return;
        }
        const len = chatMessage.querySelectorAll('.item-myself').length
        if(len === 0) {
            await sleep(2000);
            const chatControls = document.querySelector('.chat-controls');
            if(!chatControls || !chatControls.childNodes[5]) {
                alert('未找到 .chat-controls 常用语按钮，Boss直聘页面结构可能已变更，请更新插件');
                return;
            }
            chatControls.childNodes[5].click();
            await sleep(2000);
            if(document.querySelector('.resume-list li')) {
                document.querySelector('.resume-list li').click();
            }
            await sleep(2000);
            if(document.querySelector('.btn-confirm')) {
                document.querySelector('.btn-confirm').click()
            }
            await sleep(2000);
            if(!chatControls.childNodes[1] || !chatControls.childNodes[1].childNodes[0]) {
                alert('未找到 .chat-controls 打招呼按钮，Boss直聘页面结构可能已变更，请更新插件');
                return;
            }
            chatControls.childNodes[1].childNodes[0].click();
            await sleep(2000);
            const sentencePanel = document.querySelector('.sentence-panel');
            if(!sentencePanel || !sentencePanel.querySelectorAll('li')[0]) {
                alert('未找到 .sentence-panel 常用语列表，Boss直聘页面结构可能已变更，请更新插件');
                return;
            }
            sentencePanel.querySelectorAll('li')[0].click()
            await sleep(2000);
            window.close();
        } else {
            window.close();
        }
    }

}

run().then()
