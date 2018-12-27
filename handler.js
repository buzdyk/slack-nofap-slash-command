if (!global._babelPolyfill) {
    require('babel-polyfill');
}

import {
    noFapStarted, noFapFinished,
    activeNoFap404, noFapCmd404,
    startNoFapDuplicate, noFapReflection,
    genericError, noFapStats, noFapAbout, topNF, participantsList
} from './helpers/responses'

import NFService from './db/nofap-service'
import ReflectionService from './db/reflection-service'
import * as db from './db/dynamo'

let nfService = new NFService(db)
let reflectionService = new ReflectionService(db)

export const nofap = async (event, context, callback) => {
    let data = event.body,
        text = data.text.trim(),
        userid = data.user_id,
        username = data.user_name,
        existingNF = await nfService.getActiveByUserid(userid),
        nf

    if (text.indexOf(' ') == -1) text = `${text} `

    let command = text.substr(0, text.indexOf(' ')),
        comment = text.substr(text.indexOf(' ') + 1)

    switch (command) {
        case 'start':
            if (existingNF) return callback(null, startNoFapDuplicate(existingNF))
            nf = await nfService.start(userid, username)
            comment && await reflectionService.reflectOnNF(nf.uuid, comment)
            callback(null, noFapStarted(nf, comment))
            break

        case 'oopsie':
            if (!existingNF) return callback(null, activeNoFap404())
            nf = await nfService.finish(existingNF, comment)
            comment && await reflectionService.reflectOnNF(nf.uuid, comment)
            callback(null, noFapFinished(nf, await reflectionService.getReflectionsByNFUuid(nf.uuid)))
            break

        case 'reflect':
            if (!existingNF) return callback(null, activeNoFap404())
            if (!comment)    return callback(null, genericError('You reflected silently'))
            reflectionService.reflectOnNF(existingNF.uuid, comment)
            callback(null, noFapReflection(existingNF, comment))
            break

        case 'stats':
            let stats1 = await nfService.getUserStats(userid)
            callback(null, noFapStats(stats1))
            break

        case 'top':
            let top1 = await nfService.getTop()
            callback(null, topNF(top1))
            break

        case 'participants':
            callback(null, participantsList(nfService.getList()))
            break

        case 'about':
            callback(null, noFapAbout())
            break

        default:
            callback(null, noFapCmd404())
            break
    }
}