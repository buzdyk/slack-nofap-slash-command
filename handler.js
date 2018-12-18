if (!global._babelPolyfill) {
    require('babel-polyfill');
}

import {
    noFapStarted, noFapFinished,
    activeNoFap404,noFapCmd404,
    startNoFapDuplicate, noFapReflection
} from './helpers/responses'
import {
    findActiveNoFapPromise,
    startNoFapPromise,
    finishNoFapPromise,
    reflectOnNoFap
} from './helpers/dynamodb'

export const hello = async (event, context, callback) => {
    //const data = JSON.parse(event.body)
    let data = event.query,
        text = data.text.trim(),
        userid = data.user_id,
        existingNoFap = await findActiveNoFapPromise(userid)

    if (text.indexOf(' ') == -1) text = `${text} `

    let command = text.substr(0, text.indexOf(' ')),
        argument = text.substr(text.indexOf(' ') + 1)

    switch (command) {
        case 'start':
            if (existingNoFap) {
                return callback(null, startNoFapDuplicate())
            }
            let username = data.user_name
            startNoFapPromise({userid, username, comment: argument})
            callback(null, noFapStarted(username))
            break
        case 'oopsie':
            if (!existingNoFap) {
                return callback(null, activeNoFap404())
            }
            let noFap = await finishNoFapPromise(existingNoFap, argument)
            callback(null, noFapFinished(noFap))
            break
        case 'reflect':
            if (!existingNoFap) {
                return callback(null, activeNoFap404())
            }
            reflectOnNoFap(existingNoFap, argument)
            callback(null, noFapReflection(existingNoFap, argument))
            break
        default:
            callback(null, noFapCmd404())
            break
    }
}