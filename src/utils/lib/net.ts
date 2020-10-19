import fetch, {RequestInit} from "node-fetch";

export interface netOpt {
    headers?: { [key: string]: string };
    method?: string;
    Authorization?: string;
    data?: { [key: string]: unknown };
    timeout?: number;
    type?: "text" | "json" | "buffer" | "blob";
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

export function net(url: string, param?: netOpt) {
    param = param || {};
    param.type = param.type || 'text';
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
    if (sendData.method === 'GET') url = url + '?' + convertObj(param.data);
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
            .then(async (res) => {
                switch (param.type) {
                    case 'text':
                        return await res.text();
                    case 'json':
                        return await res.json();
                    case 'buffer':
                        return await res.arrayBuffer();
                    case 'blob':
                        return await res.blob();
                }
            })
            .then(data => resolve(data))
            .catch(err => reject(err));
    })
}
