'use strict';
const _ = require('../../resources/utils/original');

class home {
    index(client, ctx) {
        client.broadcast.send(_.success({msg:'ok',result:ctx.result,data:{test:'test'}}));
    }
}

module.exports = new home();
