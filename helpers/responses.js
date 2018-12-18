const getNoFapDuration = nofap => {
    let diff = new Date().getTime() - nofap.start
    return (diff/(1000*60*60*24)).toFixed(2)
}

// switch username to NoFap entry
export const noFapStarted = (username) => {
    return `${username} started the journey`
}

export const noFapFinished = (nofap) => {
    let days = getNoFapDuration(nofap)
    return `${username} hasnt fapped for ${days} days`
}

export const noFapReflection = (nofap, thought) => {
    let days = getNoFapDuration(nofap)
    return `It\'s been ${days} day of ${nofap.username} NoFap and he thought: "${thought}"`
}

export const activeNoFap404 = () => {
    return {
        response_type: 'ephemeral',
        text: 'Active NoFap is not found'
    }
}

export const noFapCmd404 = () => {
    return {
        response_type: 'ephemeral',
        text: 'NoFap command is not found'
    }
}

export const startNoFapDuplicate = (nofap) => {
    let days = getNoFapDuration(nofap)

    return {
        response_type: 'ephemeral',
        text: `You are already on the journey - ${days} days so far`
    }
}

export const genericError = error => {
    return {
        response_type: 'ephemeral',
        text: error
    }
}