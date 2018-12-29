import dateformat from 'dateformat'

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

export const humanDuration = duration => {
    const _pluralize = (value, string) => {
        if (value === 1) return `${value} ${string}`
        else return `${value} ${string}s`
    }

    if (!duration || Number.isNaN(duration) || Number(duration) !== duration) return ''

    if (!Number.isInteger(duration)) { // float passed, e.g. 5.7 days
        duration = duration * 24 * 60 * 60 * 1000
    }

    if (duration < 1000 * 60) {
        return _pluralize(Math.ceil(duration / 1000), 'second')
    } else if (duration < 1000 * 60 * 60) {
        return _pluralize(Math.round(duration / (1000 * 60)), 'minute')
    } else if (duration < 1000 * 60 * 60 * 24) {
        return _pluralize(Math.round(duration / (1000 * 60 * 60)), 'hour')
    } else {
        const full_days = Math.floor(duration / (1000 * 60 * 60 * 24));
        const hours = Math.round((duration - (full_days * 24 * 60 * 60 * 1000)) / (1000 * 60 * 60))
        let result = _pluralize(full_days, 'day')
        if (hours) result += ` and ${_pluralize(hours, 'hour')}`;
        return result
    }
}

export const tsToDate = ts => dateformat(new Date(ts), 'mmmm dS, yyyy')