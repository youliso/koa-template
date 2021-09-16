import net from '@/common/net';

(async () => {
  function test(o: number[], numa: number, numb: number, max: number = 1000) {
    let c = 0;
    let i = 0;
    let is = false;
    let nums = [...`${numa + numb}`].map((e) => Number(e));

    function ins(num: number, it: number) {
      const item = nums[it];
      if (item === num) {
        nums[it] = item + 1;
        if (item === 9) {
          if (it === 0) {
            nums[it] = 1;
            nums.push(0);
            return;
          }
          nums[it - 1] = nums[it - 1]++;
          nums[it] = 0;
        }
        is = true;
      }
    }

    function tc() {
      if (c > max) {
        throw new Error('超出最大限制');
      }
      c++;
      i = 0;
      is = false;
      while (i < o.length) {
        const num = o[i];
        let l_n = 0;
        let r_n = nums.length;
        while (l_n < r_n) {
          ins(num, l_n);
          ins(num, r_n);
          l_n++;
          r_n--;
        }
        i++;
      }
      if (is) tc();
    }

    try {
      tc();
      return nums.join('');
    } catch (e) {
      throw e;
    }
  }

  function oToM(num: number) {
    return [num >> 16, (num >> 8) & 0xff, num & 0xff];
  }

  function mToO(nums: number[]) {
    return (nums[0] << 16) + (nums[1] << 8) + nums[2];
  }

  console.log(mToO(oToM(11111111)), oToM(11111111));
  let i = 0;
  while (i < 10000000) {
    await net('http://127.0.0.1:3000/');
    i++;
  }
})();
