import NFService from './db/nofap-service'
import ReflectionService from './db/reflection-service'
import * as db from './db/dynamo'
import * as msgs from './responses'

export default class Commander
{
    constructor(db) {
        this.nfService = new NFService(db)
        this.reflectionService = new ReflectionService(db)
    }

    async run(cmd, arg, {userid, username, channel}) {
        this.arg = arg
        this.userid = userid
        this.username = username
        this.channel = channel

        this.currentNF = await this.nfService.getActiveByUserid(userid)

        let cmds = {
            start: '_start',
            oopsie: '_oopsie',
            reflect: '_reflect',
            top: '_top',
            stats: '_stats',
            show: '_show',
            participants: '_participants',
            about: '_about'
        }

        return new Promise((resolve, reject) => {
            if (cmds[cmd] === undefined) {
                return resolve(msgs.noFapCmd404())
            }

            return resolve(this[cmds[cmd]]())
        })
    }

    hasCurrentNF() {
        return this.currentNF !== null && typeof this.currentNF == 'object'
    }

    async _start() {
        if (this.hasCurrentNF()) return msgs.startNoFapDuplicate(this.currentNF)
        let nf = await this.nfService.start(this.userid, this.username)
        this.arg && await this.reflectionService.reflectOnNF(nf.uuid, this.arg)

        return msgs.noFapStarted(nf, this.arg)
    }

    async _oopsie() {
        if (!this.hasCurrentNF()) return msgs.activeNoFap404()

        let nf = await this.nfService.finish(this.currentNF, this.arg)
        this.arg && await this.reflectionService.reflectOnNF(nf.uuid, this.arg)
        let reflections = await this.reflectionService.getReflectionsByNFUuid(nf.uuid)

        return msgs.noFapFinished(nf, reflections)
    }

    async _reflect() {
        if (!this.hasCurrentNF()) return msgs.activeNoFap404()
        if (!this.arg) return msgs.genericError('You reflected silently')

        this.reflectionService.reflectOnNF(this.currentNF.uuid, this.arg)

        return msgs.noFapReflection(this.currentNF, this.arg)
    }

    async _stats() {
        let stats = await this.nfService.getUserStats(this.userid),
            nfs = await this.nfService.getByUserid(this.userid)

        return msgs.noFapStats(stats, nfs)
    }

    async _show() {
        let nfs = await this.nfService.getByUserid(this.userid),
            nf = _.find(nfs, {uuid: this.arg}),
            reflections

        if (!nf) return msgs.genericError('Sorry, requested NoFap is not found!')

        reflections = await this.reflectionService.getReflectionsByNFUuid(nf.uuid)

        return msgs.showNF(nf, reflections)
    }

    async _top() {
        let top = await this.nfService.getTop()
        return msgs.topNF(top)
    }

    async _participants() {
        let activeNFs = await this.nfService.getActive()
        return msgs.participantsList(activeNFs)
    }

    async _about() {
        return msgs.noFapAbout()
    }
}