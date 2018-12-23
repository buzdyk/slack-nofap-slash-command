import dateformat from 'dateformat'
import {getSlackRankByDuration} from './utils'

const getNoFapDuration = noFap => {
    let diff = new Date().getTime() - noFap.start
    return (diff/(1000*60*60*24)).toFixed(2)
}

const addCommentMaybe = (message, comment) => {
    if (comment) message.attachments = [{text: comment}]
    return message
}

// switch username to NoFap entry
export const noFapStarted = (noFap, comment) => {
    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:fire: ${noFap.username} started the journey`
    }, comment)
}

export const noFapFinished = (noFap, comment) => {
    let days = getNoFapDuration(noFap, comment)
    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:sweat_drops: Thats it for ${noFap.username}! He hasn't fapped for ${days} days :clap: :clap:`
    }, comment)
}

export const noFapReflection = (noFap, comment) => {
    let days = getNoFapDuration(noFap)
    return addCommentMaybe({
        response_type: 'in_channel',
        text: `:thinking_face: It\'s been ${days} days of ${noFap.username} NoFap"`
    }, comment)
}

export const noFapStats = (stats) => {
    let startedFormatted = stats.started_at ? dateformat(new Date(stats.started_at), 'mmmm dS, yyyy') : '–'

    if (stats.count == 0) {
        return {text: 'In order to see the stats you need to start your first NoFap by typing "/nofap start". Good luck!'}
    }

    let attachments = [{
        fields: [
            {title: `First NoFap`, value: `${startedFormatted}`, short: true},
            {title: `Count`, value: stats.count, short: true},
            {title: `Total`, value: `${stats.total_days} days`, short: true},
            {title: `Avg`, value: `${stats.avg_days} days`, short: true},
            {title: `Current`, value: `${stats.current_days} days`, short: true},
            {title: `Rank`, value: getSlackRankByDuration(stats.total_days), short: true}
        ]
    }]

    return {
        text: `Your NoFap stats :information_desk_person:`,
        attachments,
        response_type: 'ephemeral',
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
    let days = getNoFapDuration(noFap)

    return {
        response_type: 'ephemeral',
        text: `:robot_face: You are already on the journey - ${days} days so far`
    }
}

export const genericError = error => {
    return {
        response_type: 'ephemeral',
        text: error
    }
}