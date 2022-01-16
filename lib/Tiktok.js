const request = require('request-promise');
const fs = require('fs');

const regExpLink = url => {
    const match = url.match(/video\/(\d+)/);
    return match[1];
};

const getLinkTikTok = async link => {
    try {
        const idVideo = regExpLink(link);
        const options = {
            method: 'GET',
            uri: `https://api-h2.tiktokv.com/aweme/v1/aweme/detail/?aweme_id=${idVideo}&origin_type=web&request_source=0&manifest_version_code=170804&_rticket=1642340674&app_language=vi&app_type=normal&iid=7053799296369739521&channel=apkpure&device_type=MI+8+Lite&language=vi&cpu_support64=true&host_abi=arm64-v8a&locale=vi&resolution=1080*2068&openudid=8584195b1bcc53b6&update_version_code=170804&ac2=unknown&cdid=9ac13570-f8f8-4ea3-a6ce-c4fa19d1615e&sys_region=VN&os_api=29&uoo=0&timezone_name=Asia%2FHo_Chi_Minh&dpi=440&carrier_region=US&ac=wifi&device_id=7053798077601842689&os_version=10&timezone_offset=25200&version_code=170804&carrier_region_v2=452&app_name=trill&ab_version=17.8.4&version_name=17.8.4&device_brand=Xiaomi&op_region=US&ssmix=a&device_platform=android&build_number=17.8.4&region=VN&aid=1180&ts=1642340674`,
            headers: {
                'Cookie': 'store-idc=alisg; store-country-code=vn; install_id=7053799296369739521; ttreq=1$34ba8d0543665d61f5040157f0d529922f338362',
                'User-Agent': 'okhttp/3.10.0.1',
                'Passport-Sdk-Version': 19,
                'Sdk-Version': 2,
                'X-Khronos': 1642340674,
                'X-Gorgon': '',
                'X-Ss-Req-Ticket': 1642340674960,
            },
            json: true,
        };
        const resp = await request(options);
        // fs.writeFileSync('data.json', JSON.stringify(resp));
        return resp.aweme_detail.video.play_addr.url_list;

    } catch (e) {
        return Promise.reject(e);
    }
};

module.exports = {
    getLinkTikTok,
};