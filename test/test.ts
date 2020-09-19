import _ from '../src/utils/lib/tool';
import {load} from 'cheerio';
import {writeFileSync, statSync, mkdirSync} from 'fs';
import {resolve} from 'path';

const data = require('./req/data.json');
(async () => {
    let list: { [key: string]: string }[] = [];
    for (let i = 1; i < 9; i++) {
        let url: string = `http://www.zgfxy.cn/xyzl/fyyh/List_${i}.html`;
        let req = await _.net(url);
        const $ = load(req as string);
        $('div.fypage ul li').each((i, v) => {
            let item = {
                img: `http://www.zgfxy.cn${$(v).find('div.img a img').attr('src')}`,
                name: `${$(v).find('div.dec h2 a').text()}`,
                value: `${$(v).find('div.dec div.nail').text()}`
            };
            list.push(item);
        });
    }
    writeFileSync(resolve(__dirname+'/req/data.json'),JSON.stringify(list));
    const toBuffer = (ab: ArrayBuffer) => {
        let buf = Buffer.from(ab);
        let view = new Uint8Array(ab);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
    for (let i of data) {
        let req = await _.net(i.img, {type: 'buffer'});
        try {
            statSync(resolve(__dirname + `/data/${i.name}`));
        } catch (e) {
            mkdirSync(resolve(__dirname + `/data/${i.name}`), {recursive: true});
        }
        let text = `${i.name}\r\n\r\n`;
        text += `${i.value}`;
        writeFileSync(resolve(__dirname + `/data/${i.name}/${i.name}.jpg`), toBuffer(req as ArrayBuffer));
        writeFileSync(resolve(__dirname + `/data/${i.name}/${i.name}.txt`), text);
    }
})()
