import { net } from '@/lib/net';

(async () => {
  console.log('net get baidu');
  let req = await net('https://www.baidu.com');
  console.log(req.length > 0);
})();
