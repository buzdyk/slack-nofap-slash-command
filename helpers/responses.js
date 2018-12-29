import {getSlackRankByDuration, tsToDate, getPeriodDuration, humanDuration} from './utils'
import * as _ from 'lodash'
import dateformat from 'dateformat'

const addCommentMaybe = (message, comment) => {
    if (comment) message.attachments = [{text: comment}]
    return message
}

// switch username to NoFap entry
export const noFapStarted = (noFap, comment) => {
    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:fire: ${noFap.username} started the journey. Type _/nofap about_ for more info.`
    }, comment)
}

export const noFapFinished = (noFap, reflections) => {
    let days = getPeriodDuration(noFap.start, noFap.ending),
        text = `:sweat_drops: That's it for ${noFap.username}! He hasn't fapped for ${humanDuration(days)} :clap: :clap:`

    if (reflections.length) {
        let duration, i; text += "\n\n:pepe-smug: How it happened:"
        for (i=0; i<reflections.length; i++) {
            duration = ((reflections[i].timestamp - noFap.start)/(1000*60*60*24)).toFixed(2)
            text += `\n*Day ${duration}*: ${reflections[i].comment}`
        }
    }

    return {response_type: 'in_channel', text}
}

export const noFapReflection = (noFap, comment) => {
    let days = getPeriodDuration(noFap.start, noFap.ending)

    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:thinking_face: It\'s been ${humanDuration(days)} of ${noFap.username} NoFap"`
    }, comment)
}

export const noFapStats = (stats, nfs) => {
    let startedFormatted = stats.started_at ? tsToDate(stats.started_at): '–',
        text = `Your NoFap stats :information_desk_person:`

    if (stats.count == 0) {
        return {text: 'In order to see the stats you need to start your first NoFap by typing "/nofap start". Good luck!'}
    }

    text += _.reduce(nfs, (res, nf, i) => {
        let overview = `\n\n${i+1}. Started on ${tsToDate(nf.start)} and ` + (nf.ending ? `lasted *${humanDuration(getPeriodDuration(nf.start, nf.ending))}*` : `*goes on!*`),
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
            {title: `Rank`, value: getSlackRankByDuration(parseFloat(stats.total_days)), short: true}
        ]
    }]

    return {
        text,
        attachments,
        response_type: 'ephemeral',
    }
}

export const topNF = stats => {
    let text = `*Top boys:*`

    text += _.reduce(stats.top, (res, item, index) => {
        res += `\n*    ${item.streak} days* ${item.participants.join(', ')}`; return res
    }, '')

    text += `\n\n*Rising stars:*`
    text += _.reduce(stats.top_reversed, (res, item, index) => {
        res += `\n*    ${item.streak} days* ${item.participants.join(', ')}`; return res
    }, '')

    return {
        text, response_type: 'in_channel'
    }
}

export const showNF = (nf, reflections) => {
    let text = `Requested NoFap started on ${tsToDate(nf.start)} and ` + (nf.ending ? `lasted *${humanDuration(getPeriodDuration(nf.start, nf.ending))}*` : `*goes on!*`)

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
    if (nfs.length == 0) return {response_type: 'ephemeral', text: 'Sadly there is no participants in NoFap'}

    const text = `*All boys:*${nfs.reduce((res, nf, i) => res + `\n    ${i+1}. ${nf.username}: ${humanDuration(getPeriodDuration(nf.start, nf.ending))}`, '')}`

    return {
        response_type: 'ephemeral', text
    }
}

export const activeNoFap404 = () => {
    return {
        response_type: 'ephemeral',
        text: ':robot_face: Active NoFap is not found'
    }
}

export const noFapCmd404 = () => {
    return {
        response_type: 'ephemeral',
        text: ':robot_face: NoFap command is not found'
    }
}

export const startNoFapDuplicate = (noFap) => {
    let days = getPeriodDuration(noFap.start, noFap.ending)

    return {
        response_type: 'ephemeral',
        text: `:robot_face: You are already on the journey - ${humanDuration(days)} so far`
    }
}

export const genericError = error => {
    return {
        response_type: 'ephemeral',
        text: error
    }
}

export const noFapAbout = () => {
    return {
        response_type: 'ephemeral',
        text: `NoFap intention is to help you replace the habit of fapping with something more productive.

What NoFap gives you:
- motivation to bang chicks;
- sharper wits;
- more free time.

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

Extra resources:
- https://github.com/NoFap-anon/NoFap_russian-manual/wiki
- https://www.beloveshkin.com/2014/12/dopamine-1.html?m=1
- https://www.reddit.com/r/NoFap/comments/phg1r/my_guide_to_successfully_stop_fapping/

The task at hand is rather difficult. Please remember: you are not alone.
`
    }
}