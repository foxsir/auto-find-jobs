function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 解析 .item-time .time 文本为距今天数, 无法解析返回 null (保守不再打招呼)
function parseDaysAgo(text) {
    if(!text) return null;
    const t = text.trim();
    if(/^\d{1,2}:\d{2}/.test(t)) return 0;              // "13:44" 今天
    if(t.includes('昨天')) return 1;                     // "昨天 07:45"
    if(t.includes('前天')) return 2;                     // "前天 07:45"

    const now = new Date();
    const DAY = 24 * 60 * 60 * 1000;

    // "2026-09-11" / "2026/09/11" / "2026年9月11日" 带年份
    let m = t.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
    if(m) {
        return (now - new Date(+m[1], +m[2] - 1, +m[3]).getTime()) / DAY;
    }

    // "09-11 16:39" / "9月11日" 不带年份, 按今年算, 若在未来则按去年(跨年兜底)
    m = t.match(/(?<!\d)(\d{1,2})[-月](\d{1,2})日?/);
    if(m) {
        let d = new Date(now.getFullYear(), +m[1] - 1, +m[2]);
        if(d > now) d = new Date(now.getFullYear() - 1, +m[1] - 1, +m[2]);
        return (now - d.getTime()) / DAY;
    }

    return null;
}

// 只有一条我发的打招呼、对方无回复、消息未读且超过3天 → 再次打招呼
function needReGreet(myMsgs, friendMsgs) {
    if(myMsgs.length !== 1 || friendMsgs.length > 0) return false;

    const status = myMsgs[0].querySelector('.message-status');
    if(!status?.textContent?.includes('送达')) return false;  // 已读不打扰

    const timeText = myMsgs[0].querySelector('.item-time .time')?.textContent;
    const days = parseDaysAgo(timeText);
    return days !== null && days > 3;
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
        const myMsgs = chatMessage.querySelectorAll('.item-myself');
        const friendMsgs = chatMessage.querySelectorAll('.item-friend');
        if(myMsgs.length === 0 || needReGreet(myMsgs, friendMsgs)) {
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
