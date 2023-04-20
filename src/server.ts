/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'
import AWS, { SQS, SNS } from 'aws-sdk'
import { MessageAttributeMap } from 'aws-sdk/clients/sns'

AWS.config.update({
  region: process.env.AWS_REGION,
  account: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
  }
})

const awsSNS = new SNS()
const awsSQS = new SQS()

const app = express()
app.use(express.json())

app.post('/create_sns_topic', async (req, res, next) => {
  const { topic } = req.body

  awsSNS.createTopic({ Name: topic }, (err, data) => {
    if (err) res.send(err.message)
    res.send(data)
  })
})

app.post('/publish_sns_message', async (req, res, next) => {
  const { message, topic } = req.body

  const messageAttributes: MessageAttributeMap = {
    attributte1: {
      DataType: 'String', StringValue: 'value1'
    }
  }

  awsSNS.publish({ TopicArn: topic, Message: message, MessageAttributes: messageAttributes }, (err, data) => {
    if (err) res.send(err.message)
    res.send(data)
  })
})

app.post('/create_sqs_queue', async (req, res, next) => {
  const { queue } = req.body

  awsSQS.createQueue({ QueueName: queue }, (err, data) => {
    if (err) res.send(err.message)
    res.send(data)
  })
})

app.get('/get_sqs_messages', async (req, res, next) => {
  const { queue } = req.query

  const parseToString = queue as string

  const params: SQS.Types.ReceiveMessageRequest = {
    QueueUrl: parseToString,
    MaxNumberOfMessages: 1, // Maximum number of messages to retrieve
    VisibilityTimeout: 30, // Visibility timeout for retrieved messages in seconds
    WaitTimeSeconds: 20 // Wait time for long polling in seconds
  }

  awsSQS.receiveMessage(params, (err, data) => {
    if (err) res.send(err.message)
    res.send(data.Messages)
  })
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
