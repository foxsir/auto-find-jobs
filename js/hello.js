function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    if(location.href.includes('/web/geek/chat')) {
        await sleep(3000);
        const len = document.querySelector('.chat-message').querySelectorAll('.item-myself').length
        if(len === 0) {
            await sleep(2000);
            document.querySelector('.chat-controls').childNodes[5].click();
            await sleep(2000);
            if(document.querySelector('.resume-list li')) {
                document.querySelector('.resume-list li').click();
            }
            await sleep(2000);
            if(document.querySelector('.btn-confirm')) {
                document.querySelector('.btn-confirm').click()
            }
            await sleep(2000);
            document.querySelector('.chat-controls').childNodes[1].childNodes[0].click();
            await sleep(2000);
            document.querySelector('.sentence-panel').querySelectorAll('li')[0].click()
            await sleep(2000);
            window.close(); 
        } else {
            window.close();
        }
    }


    setTimeout(() => {
        window.close();
    }, 20000);

}

run().then()
