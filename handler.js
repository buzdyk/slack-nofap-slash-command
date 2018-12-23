if (!global._babelPolyfill) {
    require('babel-polyfill');
}

import {
    noFapStarted, noFapFinished,
    activeNoFap404,noFapCmd404,
    startNoFapDuplicate, noFapReflection,
    genericError, noFapStats, noFapAbout
} from './helpers/responses'

import {
    findActiveNoFapPromise,
    startNoFapPromise,
    finishNoFapPromise,
    reflectOnNoFapPromise,
    getUserStats, getNofapReflections
} from './helpers/dynamodb'

export const nofap = async (event, context, callback) => {
    let data = event.body,
        text = data.text.trim(),
        userid = data.user_id,
        username = data.user_name,
        existingNoFap = await findActiveNoFapPromise(userid)

    if (text.indexOf(' ') == -1) text = `${text} `

    let command = text.substr(0, text.indexOf(' ')),
        comment = text.substr(text.indexOf(' ') + 1),
        noFap

    switch (command) {
        case 'start':
            if (existingNoFap) return callback(null, startNoFapDuplicate(existingNoFap))
            noFap = await startNoFapPromise(userid, username)
            comment && reflectOnNoFapPromise(noFap, comment)
            callback(null, noFapStarted(noFap, comment))
            break

        case 'oopsie':
            if (!existingNoFap) return callback(null, activeNoFap404())
            noFap = await finishNoFapPromise(existingNoFap, comment)
            comment && reflectOnNoFapPromise(noFap, comment)
            callback(null, noFapFinished(noFap, await getNofapReflections(noFap.uuid)))
            break

        case 'reflect':
            if (!existingNoFap) return callback(null, activeNoFap404())
            if (!comment)       return callback(null, genericError('You reflected silently'))
            reflectOnNoFapPromise(existingNoFap, comment)
            callback(null, noFapReflection(existingNoFap, comment))
            break

        case 'stats':
            let stats = await getUserStats(userid)
            callback(null, noFapStats(stats))
            break

        case 'about':
            callback(null, noFapAbout())
            break

        default:
            callback(null, noFapCmd404())
            break
    }
}