if (!global._babelPolyfill) {
    require('babel-polyfill')
}

import {parsePostBody, post} from './helpers/utils'
import {
    noFapStarted, noFapFinished,
    activeNoFap404, noFapCmd404,
    startNoFapDuplicate, noFapReflection,
    genericError, noFapStats, noFapAbout, topNF,
    showNF, participantsList
} from './helpers/responses'

import NFService from './db/nofap-service'
import ReflectionService from './db/reflection-service'
import * as db from './db/dynamo'

let nfService = new NFService(db)
let reflectionService = new ReflectionService(db)

export const nofap = async (event, context, callback) => {
    let data = parsePostBody(event.body),
        respond = (response) => post(data.response_url, response),
        text = data.text.trim(),
        userid = data.user_id,
        username = data.user_name,
        existingNF = await nfService.getActiveByUserid(userid),
        nf, nfs, reflections

    if (text.indexOf(' ') == -1) text = `${text} `

    let command = text.substr(0, text.indexOf(' ')),
        comment = text.substr(text.indexOf(' ') + 1)

    switch (command) {
        case 'start':
            if (existingNF) { respond(startNoFapDuplicate(existingNF)); break }
            nf = await nfService.start(userid, username)
            comment && await reflectionService.reflectOnNF(nf.uuid, comment)
            respond(noFapStarted(nf, comment))
            break

        case 'oopsie':
            if (!existingNF) { respond(activeNoFap404()); break }
            nf = await nfService.finish(existingNF, comment)
            comment && await reflectionService.reflectOnNF(nf.uuid, comment)
            reflections = await reflectionService.getReflectionsByNFUuid(nf.uuid)
            respond(noFapFinished(nf, reflections))
            break

        case 'reflect':
            console.log(existingNF, comment)
            if (!existingNF) { respond(activeNoFap404()); break }
            if (!comment)    { respond(genericError('You reflected silently')); break }
            reflectionService.reflectOnNF(existingNF.uuid, comment)
            respond(noFapReflection(existingNF, comment))
            break

        case 'stats':
            let stats = await nfService.getUserStats(userid)
            nfs = await nfService.getByUserid(userid)
            respond(noFapStats(stats, nfs))
            break

        case 'show':
            nfs = await nfService.getByUserid(userid)
            nf = _.find(nfs, {uuid: comment})

            if (!nf) { respond(genericError('Sorry, requested NoFap is not found!')); break }

            reflections = await reflectionService.getReflectionsByNFUuid(nf.uuid)
            respond(showNF(nf, reflections))
            break

        case 'top':
            let top = await nfService.getTop()
            respond(topNF(top))
            break

        case 'participants':
            respond(participantsList(await nfService.getActive()))
            break

        case 'about':
            respond(noFapAbout())
            break

        default:
            respond(noFapCmd404())
            break
    }

    // prevent entered slash console command
    // from popping up in the channel
    callback(null, {
        statusCode: 200, body: '',
        headers: {
            'Content-Length': 0
        }
    })
}