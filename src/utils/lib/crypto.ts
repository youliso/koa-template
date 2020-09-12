'use strict';
import {createHmac, scryptSync, randomBytes, createCipheriv, createDecipheriv} from 'crypto';

const {crypto} = require('../cfg/config.json');

class Crypto {
    private static instance: Crypto;

    static getInstance() {
        if (!Crypto.instance) Crypto.instance = new Crypto();
        return Crypto.instance;
    }

    constructor() {
    }

    /**
     * Md5加密
     * @param text 加密内容
     * @param ks 加密密钥
     */
    encodeMd5(text: string, ks?: string) {
        ks = ks || crypto.key;
        let hmac = createHmac('md5', ks);
        return hmac.update(text.toString()).digest('hex');
    }


    /**
     * cbc对称加密
     * @param text 加密内容
     * @param ks 加密密钥
     */
    encodeAes(text: string, ks?: string) {
        ks = ks || crypto.key;
        const key = scryptSync(ks, crypto.salt, 24);
        const iv = Buffer.alloc(16, 0); // 初始化向量。
        const cipher = createCipheriv('aes-192-cbc', key, iv);
        let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    /**
     * 解密函数
     * @param text  需要解密的内容
     */
    decodeAse(text: string, ks?: string) {
        ks = ks || crypto.key;
        const key = scryptSync(ks, crypto.salt, 24);
        const iv = Buffer.alloc(16, 0); // 初始化向量。
        const decipher = createDecipheriv('aes-192-cbc', key, iv);
        let decrypted = decipher.update(text.toString(), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    /**
     * token加密
     * */
    token(id: number) {
        return this.encodeAes(JSON.stringify({
            id,
            time: new Date().getTime() + 1000 * 60 * 120
        }));
    }

    /**
     * 随机密码
     * */
    randomBytes(size: number) {
        let buf = randomBytes(size);
        return buf.toString('hex');
    }

}

export default Crypto.getInstance();
