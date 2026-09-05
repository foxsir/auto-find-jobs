// DeepSeek API 代理: content script 在 zhipin.com 页面内直接请求 API 会被 CORS 拦截,
// 因此通过 background service worker 转发请求.

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-v4-flash';
const MATCH_SCORE_THRESHOLD = 70;

function buildPrompt({ title, jd, resume }) {
    return [
        {
            role: 'system',
            content: '你是一个职位匹配评估助手。根据用户提供的个人介绍/技能描述, 判断职位与求职者的匹配程度。'
                + '只输出 JSON, 格式为 {"score": 0到100的整数, "match": true或false, "reason": "简要理由"}。'
                + `score >= ${MATCH_SCORE_THRESHOLD} 时 match 为 true, 否则为 false。`
        },
        {
            role: 'user',
            content: `【职位标题】\n${title}\n\n【职位描述】\n${jd}\n\n【个人介绍/技能】\n${resume}`
        }
    ];
}

async function requestMatch(payload) {
    const { apiKey } = payload;
    if (!apiKey) {
        return { error: '未配置 DeepSeek API Key' };
    }

    let response;
    try {
        response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: DEEPSEEK_MODEL,
                messages: buildPrompt(payload),
                response_format: { type: 'json_object' },
                temperature: 0.1
            })
        });
    } catch (e) {
        return { error: `网络请求失败: ${e.message}` };
    }

    if (!response.ok) {
        return { error: `DeepSeek API 返回 ${response.status}: ${await response.text()}` };
    }

    try {
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return {
            score: Number(result.score) || 0,
            match: result.match === true && Number(result.score) >= MATCH_SCORE_THRESHOLD,
            reason: String(result.reason || '')
        };
    } catch (e) {
        return { error: `解析 AI 返回结果失败: ${e.message}` };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'ai-match') {
        requestMatch(message.payload).then(sendResponse);
        return true; // 异步响应
    }
});
