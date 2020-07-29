'use strict';
const cryptos = require('crypto');
const {cryptoPassword} = require('../../../resources/cfg/config.json');

class crypto {

    static getInstance() {
        if (!crypto.instance) crypto.instance = new crypto();
        return crypto.instance;
    }

    constructor() {
    }

    /**
     * 加密函数Md5
     * @param text  需要加密的内容
     */
    encodeMd5(text, ks) {
        ks = ks || cryptoPassword;
        let hmac = cryptos.createHmac('md5', ks);
        return hmac.update(text.toString()).digest('hex');
    }


    /**
     * 加密函数
     * @param text  需要加密的内容
     */
    encodeAes(text, ks) {
        ks = ks || cryptoPassword;
        const key = cryptos.scryptSync(ks, 'salt', 24);
        const iv = Buffer.alloc(16, 0); // 初始化向量。
        const cipher = cryptos.createCipheriv('aes-192-cbc', key, iv);
        let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * 解密函数
     * @param text  需要解密的内容
     */
    decodeAse(text, ks) {
        ks = ks || cryptoPassword;
        const key = cryptos.scryptSync(ks, 'salt', 24);
        const iv = Buffer.alloc(16, 0); // 初始化向量。
        const decipher = cryptos.createDecipheriv('aes-192-cbc', key, iv);
        let decrypted = decipher.update(text.toString(), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * token加密
     * */
    token(id) {
        return this.encodeAes(JSON.stringify({
            id,
            time: new Date().getTime() + 1000 * 60 * 120
        }));
    }

    /**
     * 随机密码
     * */
    randomBytes(size) {
        let buf = cryptos.randomBytes(size);
        return buf.toString('hex');
    }

}

module.exports = crypto.getInstance();