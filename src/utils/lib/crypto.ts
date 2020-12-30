import {createHmac, scryptSync, randomBytes, createCipheriv, createDecipheriv} from 'crypto';

const cryptoConfig = require('../cfg/crypto.json');

/**
 * Md5加密
 * @param text 加密内容
 * @param ks 加密密钥
 */
export function encodeMd5(text: string, ks?: string) {
    ks = ks || cryptoConfig.key;
    let hmac = createHmac('md5', ks);
    return hmac.update(text.toString()).digest('hex');
}

/**
 * cbc对称加密
 * @param text 加密内容
 * @param ks 加密密钥
 */
export function encodeAes(text: string, ks?: string) {
    ks = ks || cryptoConfig.key;
    const key = scryptSync(ks, cryptoConfig.salt, 24);
    const iv = Buffer.alloc(16, 0); // 初始化向量。
    const cipher = createCipheriv('aes-192-cbc', key, iv);
    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * 解密函数
 * @param text  需要解密的内容
 * @param ks 加密密钥
 */
export function decodeAse(text: string, ks?: string) {
    ks = ks || cryptoConfig.key;
    const key = scryptSync(ks, cryptoConfig.salt, 24);
    const iv = Buffer.alloc(16, 0); // 初始化向量。
    const decipher = createDecipheriv('aes-192-cbc', key, iv);
    let decrypted = decipher.update(text.toString(), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * 随机密码
 * */
export function randomSize(size: number) {
    let buf = randomBytes(size);
    return buf.toString('hex');
}
