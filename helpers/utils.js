export const getNoFapDuration = noFap => {
    if (!noFap) return 0

    let diff = (noFap.ending ? noFap.ending : new Date().getTime()) - noFap.start
    return parseFloat((diff/(1000*60*60*24)).toFixed(2))
}

export const getPeriodDuration = (start, end) => {
    if (!start) return 0
    let diff = (end ? end : new Date().getTime()) - start
    return parseFloat((diff/(1000*60*60*24)).toFixed(2))
}

export const getSlackRankByDuration = duration => {
    if (duration == 0) return ':sweat_drops:'
    if (duration < 1) return ':kolobok-korzinka:'
    if (duration < 8) return ':kolobok-perekat:'
    if (duration < 30) return ':kolobok-nya:'

    return ':kolobok-sir:'
}
