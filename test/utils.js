var assert = require('assert')

import {getSlackRankByDuration, humanizeDuration, parsePostBody} from './../helpers/utils'

describe('Ranks', () => {
    const assertRank = (durations, correctRank) => {
        for (let i=0; i<durations.length; i++)
            assert.equal(correctRank, getSlackRankByDuration(durations[i]))
    }

    it('0 returns sweat drops', () => {
        assertRank([0], ':sweat_drops:')
    })

    it('(0; 1) returns korzinka', () => {
        assertRank([.1, .5, .99], ':kolobok-korzinka:')
    })

    it('[1; 8) returns perekat', () => {
        assertRank([1, 2, 7.99], ':kolobok-perekat:')
    })

    it('[8; 30) returns nya', () => {
        assertRank([8, 25, 29.99], ':kolobok-nya:')
    })

    it('[30; infinity) returns sir', () => {
        assertRank([30, 31, 5001], ':kolobok-sir:')
    })
})

describe('humanizeDuration function', () => {
    it('correctly parse argument > 1', () => {
        assert.equal(humanizeDuration(2.5), '2 days and 12 hours')
        assert.equal(humanizeDuration(3.0), '3 days')
        assert.equal(humanizeDuration(3.14), '3 days and 3 hours')
    })

    it('correctly parse argument < 1', () => {
        assert.equal(humanizeDuration(0.5), '12 hours')
        assert.equal(humanizeDuration(0.01), '14 minutes')
    })

    it('returns empty string for invalid arguments', () => {
        assert.equal(humanizeDuration('test test'), '')
        assert.equal(humanizeDuration(-35), '')
        assert.equal(humanizeDuration(), '')
    })
})

describe('parsePostBody function', () => {
    it('parses slack slash command body', () => {
        let postBody = 'token=tokenValue&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands',
            parsedBody = parsePostBody(postBody)

        assert.equal(parsedBody.token, 'tokenValue')
        assert.equal(parsedBody.response_url, 'https://hooks.slack.com/commands')
    })

    it('replaces + with spaces', () => {
        let postBody = 'text=one+two plus three',
            parsedBody = parsePostBody(postBody)

        assert.equal(parsedBody.text, 'one two plus three')
    })
})