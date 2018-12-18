const getNoFapDays = nofap => {
    return 5
}

// switch username to NoFap entry
export const noFapStarted = (username) => {
    return `${username} started the journey`
}

export const noFapFinished = (nofap) => {
    let days = getNoFapDays(nofap)
    return `${username} hasnt fapped for ${days} days`
}

export const noFapReflection = (nofap, thought) => {
    let days = getNoFapDays(nofap)
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
    return {
        response_type: 'ephemeral',
        text: 'You are already is on the journey'
    }
}