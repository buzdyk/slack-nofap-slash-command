import * as _ from 'lodash'
import * as uuid from 'uuid'

class ReflectionService {

    constructor(db) {
        this.db = db
        this.table = 'nofap_reflections'
    }

    async reflectOnNF(nfUuid, comment) {
        let data = {
            uuid: uuid.v1(),
            nofap_uuid: nfUuid,
            comment,
            timestamp: new Date().getTime()
        }

        return await this.db.putPromise(this.table, data)
    }

    async getReflectionsByNFUuid(nfUuid) {
        let filter = `nofap_uuid = :uuid`,
            values = {':uuid': nfUuid},
            items = await this.db.scanPromise(this.table, filter, values)

        return _.orderBy(items, ['timestamp'], ['asc'])
    }
}