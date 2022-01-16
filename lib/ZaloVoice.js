const request = require('request-promise');

const getVoiceURL = async text => {
    const options = {
        method: 'POST',
        uri: 'https://zalo.ai/api/demo/v1/tts/synthesize',
        headers: {
            'origin': 'https://zalo.ai',
            'referer': 'https://zalo.ai/experiments/text-to-audio-converter',
            'cookie': 'zai_did=8k9uAj3FNiTevcSSryzXoYYo64l2pM_0BhSGG3Wq; _ga=GA1.2.1760285536.1636389062; zpsid=eMKnVbo-PZEpJXydFyOGSQr45YGzpmPrhLjXN7w0RKkaJMjGDBraRDT-2MCGdbumsHqh74BXPH6bOnCRQf5wD8rOBJLNaIKcfdzDQ7EmC5EEVJP8C0; zai_sid=j8E_PzawGLUgYRPaspDNKwgMmHoOV3njeu3B4D91DKhGiwaZzc8F5jxGYroa7JGtegwpMunjAnAAbOrriMrq0A6oxIYLJ65rYR2M2FeO8spGp9y0P0; _zlang=vn; __zi=3000.SSZzejyD0jydXQcYsa00d3xBfxgP71AM8Tdbg8yFMSbdsktWmmLGocNJgUV71n_DOzchvy896iy.1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
        },
        form: {
            input: text,
            speaker_id: 1,
            speed: 0.8,
            dict_id: 0,
        },
        json: true,
    };
    try {
        const { error_code, data, error_message } = await request(options);
        if (error_code === 0) return Promise.resolve(data.url);
        return Promise.reject(error_message);
    } catch (e) {
        return Promise.reject(e);
    }
};

const getLinkMp3 = async uri => {
    try {
        const res = await request({
            uri,
        });
        const splitData = res.split('\n');
        const newLink = `https:${splitData[8]}`;
        return Promise.resolve(newLink);
    } catch (error) {
        return Promise.reject(error);
    }
};

const createVoiceZalo = async text => {
    try {
        const m3u8Link = await getVoiceURL(text);
        const newLink = await getLinkMp3(m3u8Link);
        return Promise.resolve(newLink);
    } catch (e) {
        return Promise.reject(e);
    }
};

module.exports = createVoiceZalo;