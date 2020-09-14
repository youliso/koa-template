import fetch, {RequestInit} from 'node-fetch';
import MysqlDb from './db/mysqldb';
import RedisDb from './db/redisdb';

const dbConfig = require('../cfg/db.json');

export interface netOpt {
    headers?: { [key: string]: string };
    method?: string;
    Authorization?: string;
    data?: { [key: string]: unknown };
    timeout?: number;
}

class Tool {
    private static instance: Tool;

    public db = {};
    private netAuthorization: string;

    static getInstance() {
        if (!Tool.instance) Tool.instance = new Tool();
        return Tool.instance;
    }

    constructor() {
        for (let i in dbConfig) {
            switch (dbConfig[i].type) {
                case 'mysql':
                    this.db[i] = new MysqlDb(dbConfig[i].data);
                    break;
                case 'redis':
                    this.db[i] = new RedisDb(dbConfig[i].data);
                    break;
            }
        }
    }

    trim(str: string) {
        if (!str) return null;
        return str.replace(/^\s*|\s*$/g, "");
    }

    isNull(arg: unknown) {
        if (typeof arg === 'string') arg = this.trim(arg);
        return !arg && arg !== 0 && typeof arg !== 'boolean' ? true : false
    }

    success(msg: string, data?: unknown) {
        let req: { msg: string; code: number; time: number; data?: unknown; };
        req = {
            msg: 'success',
            code: 0,
            time: new Date().getTime()
        };
        if (typeof msg === 'string') req.msg = msg;
        if (typeof msg === 'object') req.data = msg;
        if (typeof data === 'object') req.data = data;
        return req;
    }

    error(msg: string, data?: unknown) {
        let req: { msg: string; code: number; time: number; data?: unknown; };
        req = {
            msg: 'error',
            code: -1,
            time: new Date().getTime()
        }
        if (typeof msg === 'string') req.msg = msg;
        if (typeof msg === 'object') req.data = msg;
        if (typeof data === 'object') req.data = data;
        return req;
    }

    convertObj(data: unknown) {
        let _result = [];
        // @ts-ignore
        for (let key in data) {
            // @ts-ignore
            let value = data[key];
            if (value?.constructor == Array) {
                value.forEach(function (_value) {
                    _result.push(key + "=" + _value);
                });
            } else {
                _result.push(key + '=' + value);
            }
        }
        return _result.join('&');
    }

    net(url: string, param: netOpt) {
        let sendData: RequestInit = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
                'Content-type': 'application/json;charset=utf-8',
                'Authorization': param.Authorization || this.netAuthorization || ''
            },
            timeout: param.timeout || 30000,
            method: param.method || 'GET'
        };
        if (param.headers) Object.assign(sendData.headers, param.headers);
        if (sendData.method === 'GET') url = url + '?' + this.convertObj(param.data);
        else sendData.body = JSON.stringify(param.data);
        return new Promise((resolve, reject) => {
            fetch(url, sendData)
                .then(res => {
                    if (res.status >= 200 && res.status < 300) {
                        let Authorization = res.headers.get('Authorization');
                        if (Authorization) this.netAuthorization = Authorization;
                        return res;
                    }
                    throw new Error(res.statusText);
                })
                .then(res => res.text())
                .then(data => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                })
                .catch(err => reject(err));
        })
    }


    async _add(table: string, data: unknown) {
        return await this.db['main'].query('insert into ' + table + ' set ?', [data]);
    }

    async _get(table: string, id: number) {
        if (id) return await this.db['main'].single('select * from ' + table + ' where id = ?', [id]);
        else return await this.db['main'].first('select * from ' + table);
    }

    async _upd(table: string, data: unknown, id: number) {
        return await this.db['main'].query('update ' + table + ' set ? where id = ?', [data, id])
    }

    async _del(table: string, id: number) {
        return await this.db['main'].query('delete from ' + table + ' where id = ?', [id]);
    }
}

export default Tool.getInstance();
