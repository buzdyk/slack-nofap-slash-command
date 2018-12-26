var assert = require('assert')

import * as dynamo from './../db/dynamo'

describe('Dynamo', () => {
    it('Has scanPromise', () => {
        assert.equal('function', typeof dynamo.scanPromise)
    })

    it('Has putPromise', () => {
        assert.equal('function', typeof dynamo.putPromise)
    })

    it('Has updatePromise', () => {
        assert.equal('function', typeof dynamo.updatePromise)
    })
})