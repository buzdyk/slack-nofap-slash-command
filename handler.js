import {parsePostBody} from './helpers/utils'
import * as db from './db/dynamo'
import Commander from './commander'
import axios from 'axios'

let commander = new Commander(db)

export const nofap = async (event, context, callback) => {
    let data = parsePostBody(event.body),
        text = data.text.trim(),
        userid = data.user_id,
        username = data.user_name

    if (text.indexOf(' ') == -1) text = `${text} `

    let command = text.substr(0, text.indexOf(' ')),
        argument = text.substr(text.indexOf(' ') + 1)

    commander.run(command, argument, {
        userid, username, channel: data.channel_id
    }).then(res => {
        axios.post(data.response_url, res)
    }).catch(res => {
        console.log(res)
    })

    // prevent entered slash console command
    // from popping up in the channel
    callback(null, {
        statusCode: 200, body: '',
        headers: {
            'Content-Length': 0
        }
    })
}