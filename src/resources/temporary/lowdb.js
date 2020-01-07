// 'use strict';
// const low = require('lowdb');
// const Result = require('../../main/Info/Result');
// const FileSync = require('lowdb/adapters/FileSync');
// const shortId = require('shortid');
// const conf = require('../config').db;
// const db = {
//     userInfo: low(new FileSync('src/resources/db/userInfo.json'))
// };
// for (let i in db) {
//     db[i].defaults(conf[i]).write();
// }
//
// const get = (obj) => {
//     return new Promise((resolve, reject) => {
//         try {
//             resolve(db[obj.db].read().get(obj.table).find(obj.data).value());
//         } catch (e) {
//             reject(Result.error('查询失败'));
//         }
//     });
// };
//
// const add = (obj) => {
//     return new Promise((resolve, reject) => {
//         try {
//             obj.data.id = shortId.generate();
//             db[obj.db].get(obj.table)
//                 .push(obj.data)
//                 .write();
//             resolve(true);
//         } catch (e) {
//             reject(Result.error('添加失败'));
//         }
//     });
// };
//
// const upd = (obj) => {
//     return new Promise((resolve, reject) => {
//         try {
//             resolve(db[obj.db].get(obj.table)
//                 .find(obj.id)
//                 .assign(obj.data)
//                 .write());
//         } catch (e) {
//             reject(Result.error('查询失败'));
//         }
//     });
// };
//
// module.exports = {
//     add,
//     upd,
//     get
// };
