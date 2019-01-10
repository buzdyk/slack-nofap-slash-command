var assert = require('assert')

import NFService from './../src/db/nofap-service'

describe('Top', () => {
    let nfs = [
        {uuid: 1, username: 'gregory', start: new Date().getTime() - 1000*60*60*24*24}
    ], db = {  // although this is a very nice mock todo use some library to mock the db
        scanPromise: () => new Promise(resolve => resolve(nfs))
    }, nfService = new NFService(db)

    it('returns 1 entry in top boys if 1 active top nf provided', async () => {
        let res = await nfService.getTop()
        assert.equal(0, res.top_reversed.length)
        assert.equal(0, res.middle.length)
        assert.equal(1, res.top.length)
        assert.equal(0, res.valhalla)
    })
})