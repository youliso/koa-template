'use strict';
const crypto = require('crypto');
const {cryptoPassword} = require('../cfg/config.json');
/**
 * 加密函数Md5
 * @param text  需要加密的内容
 */
const encodeMd5 = (text, ks) => {
    ks = ks || cryptoPassword;
    let hmac = crypto.createHmac('md5', ks);
    return hmac.update(text.toString()).digest('hex');
};


/**
 * 加密函数
 * @param text  需要加密的内容
 */
const encodeAes = (text, ks) => {
    ks = ks || cryptoPassword;
    const key = crypto.scryptSync(ks, 'salt', 24);
    const iv = Buffer.alloc(16, 0); // 初始化向量。
    const cipher = crypto.createCipheriv('aes-192-cbc', key, iv);
    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

/**
 * 解密函数
 * @param text  需要解密的内容
 */
const decodeAse = (text, ks) => {
    ks = ks || cryptoPassword;
    const key = crypto.scryptSync(ks, 'salt', 24);
    const iv = Buffer.alloc(16, 0); // 初始化向量。
    const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
    let decrypted = decipher.update(text.toString(), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

/**
 * token加密
 * */
const token = (id) => {
    return encodeAes(JSON.stringify({
        id,
        time: new Date().getTime() + 1000 * 60 * 120
    }));
};

/**
 * 随机密码
 * */
const randomBytes = (size) =>{
    let buf = crypto.randomBytes(size);
    return buf.toString('hex');
}

module.exports = {
    encodeMd5,
    encodeAes,
    decodeAse,
    token,
    randomBytes
};
