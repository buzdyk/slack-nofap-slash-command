import { DynamoDB } from 'aws-sdk'
const dynamoDb = new DynamoDB.DocumentClient()
import * as uuid from 'uuid'
import {getNoFapDuration} from './utils'
import * as _ from 'lodash'

const noFapsTable = 'nofaps'
const reflectionsTable = 'nofap_reflections'

const scanPromise = (TableName, FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues) => {
    return new Promise((resolve, reject) => {
        let handler = (err, data) => err ? reject(err) : resolve(data.Items)
        dynamoDb.scan({TableName, FilterExpression, ExpressionAttributeNames, ExpressionAttributeValues}, handler)
    })
}

export const findActiveNoFapPromise = userid => {
    return new Promise((resolve, reject) => {
        dynamoDb.scan({
            TableName: 'nofaps',
            FilterExpression: `attribute_not_exists(ending) and #userid = :userid`,
            ExpressionAttributeNames: {
                '#userid': 'userid'
            },
            ExpressionAttributeValues: {
                ':userid': userid
            }
        }, (err, data) => {
            if (err) {
                reject(err)
            } else {
                let items = data.Items
                resolve(items.length ? items[0] : null)
            }
        })
    })
}

export const getUserStats = async userid => {
    let filter = `#userid = :userid`, names  = {'#userid': 'userid'}, values = {':userid': userid},
        noFaps = await scanPromise(noFapsTable, filter, names, values),
        hasNoFaps = noFaps.length

    if (!hasNoFaps) return {count: 0}

    let activeNoFap = await findActiveNoFapPromise(userid), // todo refactor to find from noFaps variable
        firstNoFap = _.minBy(noFaps, 'start'),
        durations = _.reduce(noFaps, (res, noFap) => {
            res.push(getNoFapDuration(noFap)); return res
        }, [])

    return {
        started_at: firstNoFap.start,
        count: noFaps.length,
        total_days: _.sum(durations),
        avg_days:   (_.sum(durations)/noFaps.length).toFixed(2),
        current_days: getNoFapDuration(activeNoFap)
    }
}

export const startNoFapPromise = (userid, username) => {
    let Item = {
        uuid: uuid.v1(),
        start: new Date().getTime(),
        userid, username
    }

    return new Promise((resolve, reject) => {
        dynamoDb.put({TableName: noFapsTable, Item}, (err, data) => {
            if (err) reject(err)
            // put won't return the inserted values unless we explicitly retrieve item afterwards
            // so we'll just return what we inserted
            else resolve(Item)
        })
    })
}

export const finishNoFapPromise = (noFap) => {
    let now = new Date().getTime()

    return new Promise((resolve, reject) => {
        dynamoDb.update({
            TableName: noFapsTable,
            Key: {
                uuid: noFap.uuid,
            },
            ExpressionAttributeValues: {
                ':ending': now,
            },
            UpdateExpression: "SET ending = :ending",
            ReturnValues: "ALL_NEW"
        }, (err, data) => {
            if (err) reject(err)
            else resolve(data.Attributes)
        })
    })
}

export const reflectOnNoFapPromise = (noFap, comment) => {
    let Item = {
        uuid: uuid.v1(),
        nofap_uuid: noFap.uuid,
        comment,
        timestamp: new Date().getTime()
    }

    return new Promise((resolve, reject) => {
        dynamoDb.put({TableName: reflectionsTable, Item}, (err, data) => {
            if (err) reject(err)
            else resolve(Item)
        })
    })
}