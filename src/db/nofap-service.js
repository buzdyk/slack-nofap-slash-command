import {getPeriodDuration} from './../utils'
import * as _ from 'lodash'
import * as uuid from 'uuid'

export default class NofapService {

    constructor(db) {
        this.db = db
        this.table = 'nofaps'
    }

    async start(userid, username) {
        let data = {
            uuid: uuid.v1(),
            start: new Date().getTime(),
            userid, username
        }

        return this.db.putPromise(this.table, data)
    }

    async finish(nf) {
        let now = new Date().getTime()

        return await this.db.updatePromise(
            this.table,
            {uuid: nf.uuid},
            "SET ending = :ending",
            {':ending': now}
        )
    }

    async getActive() {
        let items = await this.db.scanPromise(
            this.table,
            `attribute_not_exists(ending)`
        )
        return _.orderBy(items, ['start'], ['asc'])
    }

    async getActiveByUserid(userid) {
        let items = await this.db.scanPromise(
            this.table,
            `attribute_not_exists(ending) and userid = :userid`,
            {':userid': userid}
        )

        return items.length ? items[0] : null
    }

    async getByUserid(userid) {
        let items = await this.db.scanPromise(
            this.table,
            `userid = :userid`,
            {':userid': userid}
        )

        return items.length ? _.orderBy(items, ['start'], ['asc']) : null
    }

    async getTop() {
        let items = await this.getActive(),
            res = {valhalla: [], top: [], middle: [], top_reversed: []}

        items = _.reduce(items, (reduced, item) => {
            let days = getPeriodDuration(item.start, item.ending) >= 30
            if (days >= 30) {
                if (res.valhalla.length == 0) res.valhalla = [{streak: '30+', participants: []}]
                res.valhalla[0].participants.push(item.username)
            } else {
                reduced.push(item)
            }
            return reduced
        }, [])

        const getTop = (items, places = 3) => {
            let top = [], i, duration,
                place = {streak: 0, participants: []},
                threshold, exceedsThreshold, username

            if (items.length == 0) return []

            // random formula that looks ok, 1 day - .2, 7 days = .245, 10 days - .5, 20 days - 1 day
            threshold = Math.max(0.2, 0.005 * Math.pow(getPeriodDuration(items[0].start, items[0].ending), 2))

            for (i=0; i<items.length; i++) {
                duration = getPeriodDuration(items[i].start, items[i].ending)
                username = items[i].username

                if (place.streak === 0) {
                    place.streak = duration
                    place.participants.push(username)
                }

                exceedsThreshold = Math.abs(place.streak - duration) > threshold

                if (!exceedsThreshold) {
                    place.participants.indexOf(username) === -1 && place.participants.push(username)
                }

                if (items[i+1] === undefined || exceedsThreshold) {
                    top.push(Object.assign({}, place))
                    if (top.length === places || items[i+1] === undefined) break
                    place = {streak: duration, participants: [username]}
                }
            }

            items.splice(0, i)

            return top
        }

        res.top = getTop(items)
        items.reverse()
        res.top_reversed = getTop(items)

        if (items.length) {
            let minDays = getPeriodDuration(items[0].start, items[0].endging),
                maxDays = getPeriodDuration(_.last(items).start, _.last(items).endging),
                streak = minDays == maxDays ? minDays : `${minDays} - ${maxDays}`

            res.middle = [{streak, participants: _.map(items, 'username')}]
        }

        return res
    }

    async getUserStats(userid) {
        let filter = `userid = :userid`, values = {':userid': userid},
            nfs = await this.db.scanPromise(this.table, filter, values),
            hasNFs = nfs.length

        if (!hasNFs) return {count: 0}

        let activeNF = await this.getActiveByUserid(userid), // todo refactor to find from noFaps variable
            firstNF = _.minBy(nfs, 'start'),
            durations = _.reduce(nfs, (res, nf) => {
                res.push(getPeriodDuration(nf.start, nf.ending)); return res
            }, [])

        return {
            started_at: firstNF.start,
            count: nfs.length,
            total_days: _.sum(durations).toFixed(2),
            avg_days:   (_.sum(durations)/nfs.length).toFixed(2),
            current_days: activeNF ? getPeriodDuration(activeNF.start, activeNF.ending) : 0
        }
    }
}