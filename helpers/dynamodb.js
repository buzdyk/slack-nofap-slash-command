import { DynamoDB } from 'aws-sdk'
const dynamoDb = new DynamoDB.DocumentClient()
const TableName = 'nofaps'
import * as uuid from 'uuid'

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

export const startNoFapPromise = (userid, username) => {
    let Item = {
        uuid: uuid.v1(),
        start: new Date().getTime(),
        userid, username
    }

    return new Promise((resolve, reject) => {
        dynamoDb.put({TableName, Item}, (err, data) => {
            if (err) reject(err)
            // put won't return inserted values unless we explicitly retrieve item afterwards
            // so we'll just return what we inserted
            else resolve(Item)
        })
    })
}

export const finishNoFapPromise = (noFap) => {
    let now = new Date().getTime()

    return new Promise((resolve, reject) => {
        dynamoDb.update({
            TableName,
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
        dynamoDb.put({TableName: 'nofap_reflections', Item}, (err, data) => {
            if (err) reject(err)
            else resolve(Item)
        })
    })
}