import {getPeriodDuration} from './../helpers/utils'
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

    async getList() {
        return await this.getActive().sort(i => i.start)
    }

    async getTop() {
        let items = await this.getActive(),
            res = {top: [], top_reversed: []}

        const getTop = (items, places = 3, threshold = 0.2) => {
            let top = [], i, duration,
                place = {streak: 0, participants: []},
                exceedsThreshold, username

            for (i=0; i<items.length; i++) {
                duration = getPeriodDuration(items[i].start, items[i].ending)
                username = items[i].username

                if (place.streak == 0) {
                    place.streak = duration
                    place.participants.push(username)
                }

                exceedsThreshold = Math.abs(place.streak - duration) > threshold

                if (!exceedsThreshold) {
                    place.participants.indexOf(username) == -1 && place.participants.push(username)
                }

                if (items[i+1] === undefined || exceedsThreshold) {
                    top.push(Object.assign({}, place))
                    if (top.length == places || items[i+1] === undefined) break
                    place = {streak: duration, participants: [username]}
                }
            }

            items.splice(0, i)

            return top
        }

        res.top = getTop(items)
        items.reverse()
        res.top_reversed = getTop(items)

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