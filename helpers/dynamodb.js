import { DynamoDB } from 'aws-sdk'
const dynamoDb = new DynamoDB.DocumentClient()
const TableName = 'nofaps'
import * as uuid from 'uuid'

const findActiveNoFapPromise = userid => {
    return new Promise((resolve, reject) => {
        dynamoDb.scan({
            TableName: 'nofaps',
            FilterExpression: "attribute_not_exists(ending)",
            KeyConditions: {
                userid: {
                    ComparisonOperator: 'eq',
                    AttributeValueList: [userid]
                }
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

const startNoFapPromise = Item => {
    return new Promise((resolve, reject) => {
        Item.uuid = uuid.v1()
        Item.start = new Date().getTime()

        dynamoDb.put({TableName, Item}, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

const finishNoFapPromise = (noFap, comment) => {
    let now = new Date().getTime()

    return new Promise((resolve, reject) => {
        dynamoDb.updateItem({
            Key: {
                uuid: {S: noFap.uuid},
            },
            ExpressionAttributeValues: {
                ':ending': now,
                ':comment': comment
            },
            UpdateExpression: "SET ending = :ending, comment = :comment"
        }, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

const reflectOnNoFap = (noFap, comment) => {
    let Item = {
        uuid: uuid.v1(),
        nofap_uuid: nofap.uuid,
        comment,
        timestamp: new Date().getTime()
    }

    return new Promise((resolve, reject) => {
        dynamoDb.put({TableName: 'nofap_reflections', Item}, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}