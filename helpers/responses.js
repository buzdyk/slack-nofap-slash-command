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