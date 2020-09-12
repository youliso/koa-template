import {Next, ParameterizedContext} from 'koa';
import MysqlDb from './db/mysqldb';
import RedisDb from './db/redisdb';
import Crypto from './crypto';
import Logger from './logger';
const Config = require('../../../resources/cfg/config.json');

class Original {
    private static instance: Original;

    public db = {};

    static getInstance() {
        if (!Original.instance) Original.instance = new Original();
        return Original.instance;
    }

    constructor() {
        for (let i in Config.db) {
            switch (Config.db[i].type) {
                case 'mysql':
                    this.db[i] = new MysqlDb(Config.db[i].data);
                    break;
                case 'redis':
                    this.db[i] = new RedisDb(Config.db[i].data);
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

    async token(ctx: ParameterizedContext, next: Next) {
        let url = ctx.request.url.split('?')[0];
        if (url === "/" || Config.noToken.indexOf(url) > -1 || url.indexOf('/public') > -1) {
            await next();
            return;
        }
        let token = ctx.request.headers['authorization'];
        if (token) {
            try {
                let payload = Crypto.decodeAse(token);
                let {id, time} = JSON.parse(payload);
                let find = await this._get('user_info', id);
                if (find) {
                    let data = new Date().getTime();
                    if (data <= time) {
                        delete find.pwd;
                        ctx.userInfo = {...find};
                        ctx.set('Authorization', Crypto.token(find.id));
                        await next();
                    } else ctx.body = this.error('token已过期');
                } else ctx.body = this.error('不存在此token');
            } catch (err) {
                Logger.error(err);
                ctx.body = this.error('token无效');
            }
        } else ctx.body = this.error('token无效');
    }

}

export default Original.getInstance();
