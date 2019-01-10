import {getSlackRankByDuration, tsToDate, getPeriodDuration, humanizeDuration} from './utils'
import * as _ from 'lodash'
import dateformat from 'dateformat'

const addCommentMaybe = (message, comment) => {
    if (comment) message.attachments = [{text: comment}]
    return message
}

// switch username to NoFap entry
export const nfStarted = (nf, comment) => {
    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:fire: ${nf.username} started the journey. Type _/nofap about_ for more info.`
    }, comment)
}

export const nfFinished = (nf, reflections) => {
    let days = getPeriodDuration(nf.start, nf.ending),
        text = `:sweat_drops: That's it for ${nf.username}! He hasn't fapped for ${humanizeDuration(days)} :clap: :clap:`

    if (reflections.length) {
        let duration, i; text += "\n\n:pepe-smug: How it happened:"
        for (i=0; i<reflections.length; i++) {
            duration = ((reflections[i].timestamp - nf.start)/(1000*60*60*24)).toFixed(2)
            text += `\n*Day ${duration}*: ${reflections[i].comment}`
        }
    }

    return {response_type: 'in_channel', text}
}

export const nfReflection = (nf, comment) => {
    let days = getPeriodDuration(nf.start, nf.ending)

    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:thinking_face: It\'s been ${humanizeDuration(days)} of ${nf.username} NoFap"`
    }, comment)
}

export const nfStats = (stats, nfs) => {
    let startedFormatted = stats.started_at ? tsToDate(stats.started_at): '–',
        text = `Your NoFap stats :information_desk_person:`

    if (stats.count === 0) {
        return {text: 'In order to see the stats you need to start your first NoFap by typing "/nofap start". Good luck!'}
    }

    text += _.reduce(nfs, (res, nf, i) => {
        let overview = `\n\n${i+1}. Started on ${tsToDate(nf.start)} and ` + (nf.ending ? `lasted *${humanizeDuration(getPeriodDuration(nf.start, nf.ending))}*` : `*goes on!*`),
            id = `\n     ID: ${nf.uuid}`

        return res + overview + id
    }, '')

    text += `\n\nType _/nofap show ID_ to see reflections you experienced back then`

    let attachments = [{
        fields: [
            {title: `First NoFap`, value: `${startedFormatted}`, short: true},
            {title: `Count`, value: stats.count, short: true},
            {title: `Total`, value: `${stats.total_days} days`, short: true},
            {title: `Avg`, value: `${stats.avg_days} days`, short: true},
            {title: `Current`, value: `${stats.current_days} days`, short: true},
            {title: `Rank`, value: getSlackRankByDuration(parseFloat(stats.current_days)), short: true}
        ]
    }]

    return {
        text,
        attachments,
        response_type: 'ephemeral',
    }
}

// todo refactor this
export const topNF = stats => {
    let text = '*Valhalla:*'
    text += stats.valhalla.length ?
        `\n*    30+ days* ${stats.valhalla[0].participants.join(', ')}` :
        `\n*    30+ days* nobody has deserved blessing of the gods yet`

    if (stats.top.length) {
        text += `\n\n*Top boys:*`
        text += _.reduce(stats.top, (res, item) => {
            res += `\n*    ${item.streak} days* ${item.participants.join(', ')}`; return res
        }, '')
    }

    if (stats.middle.length) {
        text += `\n\n*Middle class::*`
        text += _.reduce(stats.middle, (res, item) => {
            res += `\n*    ${item.streak} days* ${item.participants.join(', ')}`; return res
        }, '')
    }

    if (stats.top_reversed.length) {
        text += `\n\n*Rising stars:*`
        text += _.reduce(stats.top_reversed, (res, item) => {
            res += `\n*    ${item.streak} days* ${item.participants.join(', ')}`; return res
        }, '')
    }

    return {
        text, response_type: 'in_channel'
    }
}

export const showNF = (nf, reflections) => {
    let text = `Requested NoFap started on ${tsToDate(nf.start)} and ` + (nf.ending ? `lasted *${humanizeDuration(getPeriodDuration(nf.start, nf.ending))}*` : `*goes on!*`)

    if (reflections.length) text += "\n"

    text += _.reduce(reflections, (res, reflection) => {
        let duration = ((reflection.timestamp - nf.start)/(1000*60*60*24)).toFixed(2)
        return res + `\n*Day ${duration}*: ${reflection.comment}`
    }, '')

    return {
        text, response_type: 'ephemeral'
    }
}

export const participantsList = nfs => {
    if (nfs.length === 0) return {response_type: 'ephemeral', text: 'Sadly there is no participants in NoFap'}

    const text = `*All boys:*${nfs.reduce((res, nf, i) => res + `\n    ${i+1}. ${nf.username}: ${humanizeDuration(getPeriodDuration(nf.start, nf.ending))}`, '')}`

    return {
        response_type: 'ephemeral', text
    }
}

export const activeNF404 = () => {
    return {
        response_type: 'ephemeral',
        text: ':robot_face: Active NoFap is not found'
    }
}

export const nfCmd404 = () => {
    return {
        response_type: 'ephemeral',
        text: ':robot_face: NoFap command is not found'
    }
}

export const startNFDuplicate = (nf) => {
    let days = getPeriodDuration(nf.start, nf.ending)

    return {
        response_type: 'ephemeral',
        text: `:robot_face: You are already on the journey - ${humanizeDuration(days)} so far`
    }
}

export const genericError = error => {
    return {
        response_type: 'ephemeral',
        text: error
    }
}

export const nfAbout = () => {
    return {
        response_type: 'ephemeral',
        text: `NoFap intention is to help you replace the habit of fapping with something more productive.

What NoFap gives you:
- motivation to bang chicks
- sharper wits
- more free time

NoFap slash commands:
- _/about_ - shows this info
- _/nofap start (optional comment)_ - starts a new NoFap
- _/nofap reflect comment_ add a comment to your current NoFap history
- _/nofap oopsie (optional comment)_ - ends your NoFap. Hint: do not start a new NoFap right away. Have some time and think of your motivation
- _/nofap stats_ - displays your info (privately)
- _/nofap top_ – displays top participants
- _/nofap participants_ – displays all participants

Rules:
- Using your hand / flashlight vagina / pillow in order to fap is not allowed
- If the fap happened you should end current NoFap by typing "/nofap oopsie". Please be honest with yourself and your bros
- If someone else fapped you it doesn't consider as a NoFap end. Hint: ask for a BJ next time, cowboy!
- You will not appear in the /top or /participants if you don't reflect at least once a week. You can do it without providing a comment <3

Extra resources:
- https://github.com/NoFap-anon/NoFap_russian-manual/wiki
- https://www.beloveshkin.com/2014/12/dopamine-1.html?m=1
- https://www.reddit.com/r/NoFap/comments/phg1r/my_guide_to_successfully_stop_fapping/

The task at hand is rather difficult. Please remember: you are not alone.
`
    }
}