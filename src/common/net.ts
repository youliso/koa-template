import fetch, { RequestInit, Headers } from 'node-fetch';
import { AbortController } from 'node-abort-controller';
import querystring from 'querystring';

export interface NetOpt extends RequestInit {
  isStringify?: boolean; //是否stringify参数（非GET请求使用）
  isHeaders?: boolean; //是否获取headers
  data?: any;
  body?: any;
  type?: 'TEXT' | 'JSON' | 'BUFFER' | 'BLOB'; //返回数据类型
}

export interface TimeOutAbort {
  signal: AbortSignal;
  id: NodeJS.Timeout;
}

/**
 * UserAgent
 */
export function randomUserAgent() {
  const userAgentList = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89;GameHelper',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)',
    'Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586',
    'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1'
  ];
  return userAgentList[Math.floor(Math.random() * userAgentList.length + 1)];
}

/**
 * 创建 AbortController
 */
export function AbortSignal() {
  return new AbortController();
}

/**
 * 超时处理
 * @param outTime
 */
function timeOutAbort(outTime: number): TimeOutAbort {
  const controller = AbortSignal();
  const timeoutId = setTimeout(() => controller.abort(), outTime);
  return { signal: controller.signal, id: timeoutId };
}

/**
 * 请求处理
 * @param url
 * @param sendData
 */
function fetchPromise<T>(url: string, sendData: NetOpt): Promise<T> {
  return fetch(url, sendData)
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res;
      throw new Error(res.statusText);
    })
    .then(async (res) => {
      switch (sendData.type) {
        case 'TEXT':
          return sendData.isHeaders
            ? {
                headers: await res.headers,
                data: await res.text()
              }
            : await res.text();
        case 'JSON':
          return sendData.isHeaders
            ? {
                headers: await res.headers,
                data: await res.json()
              }
            : await res.json();
        case 'BUFFER':
          return sendData.isHeaders
            ? {
                headers: await res.headers,
                data: await res.arrayBuffer()
              }
            : await res.arrayBuffer();
        case 'BLOB':
          return sendData.isHeaders
            ? {
                headers: await res.headers,
                data: await res.blob()
              }
            : await res.blob();
      }
    });
}

/**
 * http请求
 * @param url
 * @param param
 */
export default async function net<T>(url: string, param: NetOpt = {}): Promise<T> {
  let abort: TimeOutAbort = null;
  // 默认1分钟请求超时
  if (!param.signal) abort = timeOutAbort(param.timeout || 1000 * 60);
  let sendData: NetOpt = {
    isHeaders: param.isHeaders,
    isStringify: param.isStringify,
    headers: new Headers(
      Object.assign(
        {
          'content-type': 'application/json;charset=utf-8'
        },
        param.headers
      )
    ),
    type: param.type || 'TEXT',
    method: param.method || 'GET',
    // timeout只会在未指定signal下生效
    signal: abort ? abort.signal : param.signal
  };
  if (param.body) {
    sendData.body = param.body;
  } else if (param.data) {
    if (sendData.method === 'GET') url = `${url}?${querystring.stringify(param.data)}`;
    else
      sendData.body = sendData.isStringify
        ? querystring.stringify(param.data)
        : JSON.stringify(param.data);
  }
  return fetchPromise<T>(url, sendData).then((req) => {
    if (abort) clearTimeout(abort.id);
    return req;
  });
}
