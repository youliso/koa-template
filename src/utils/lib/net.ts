import fetch, {RequestInit} from "node-fetch";

export interface NetOpt {
    headers?: { [key: string]: string };
    method?: string;
    Authorization?: string;
    data?: { [key: string]: unknown };
    timeout?: number;
    type?: NET_RESPONSE_TYPE; //返回数据类型
}

export enum NET_RESPONSE_TYPE {
    TEXT,
    JSON,
    BUFFER,
    BLOB
}

export function convertObj(data: unknown) {
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

/**
 * 错误信息包装
 */
export function errorReturn(msg: string): { [key: string]: unknown } {
    return {code: -1, msg};
}

export function net(url: string, param: NetOpt = {}) {
    param = param || {};
    param.type = param.type || NET_RESPONSE_TYPE.TEXT;
    let sendData: RequestInit = {
        headers: param.headers || {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
            'Content-type': 'application/json;charset=utf-8',
            'Authorization': param.Authorization || this.netAuthorization || ''
        },
        timeout: param.timeout || 30000,
        method: param.method || 'GET'
    };
    if (param.headers) Object.assign(sendData.headers, param.headers);
    if (sendData.method === 'GET') url = url + '?' + convertObj(param.data);
    else sendData.body = JSON.stringify(param.data);
    return fetch(url, sendData)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                let Authorization = res.headers.get('Authorization');
                if (Authorization) this.netAuthorization = Authorization;
                return res;
            }
            throw new Error(res.statusText);
        })
        .then(async (res) => {
            switch (param.type) {
                case NET_RESPONSE_TYPE.TEXT:
                    return await res.text();
                case NET_RESPONSE_TYPE.JSON:
                    return await res.json();
                case NET_RESPONSE_TYPE.BUFFER:
                    return await res.arrayBuffer();
                case NET_RESPONSE_TYPE.BLOB:
                    return await res.blob();
            }
        })
        .catch(err => errorReturn(err.message));
}
