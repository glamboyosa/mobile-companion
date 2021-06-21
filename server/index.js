const express = require('express')
const cors = require('cors')

//promisify

const { promisify } = require('util')

// firebase
const admin = require('firebase-admin')
// helpers
const { createAccessToken } = require('./helpers/createAccessToken')
const { createPhoneCheck } = require('./helpers/createPhoneCheck')
const { getPhoneCheck } = require('./helpers/getPhoneCheckResult')
const { redisClient } = require('./helpers/redisClient')

const get = promisify(redisClient.get)

const app = express()

app.use(express.json())
app.use(cors())
// initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})
// save Mobile Client FCM token to Redis
app.post('/api/token', async (req, res) => {
  const { from } = req.query
  const { registrationToken } = req.body
  if (from === 'mobile') {
    redisClient.setex('mobileToken', 60 * 60 * 24 * 7, registrationToken)

    return res
      .status(201)
      .send({ message: 'successfully added FCM token from mobile to redis' })
  } else if (from === 'web') {
    redisClient.setex('webToken', 60 * 60 * 24 * 7, registrationToken)

    return res
      .status(201)
      .send({ message: 'successfully added FCM token from web to redis' })
  }

  res.status(201).send({ message: 'successfully added token to redis' })
})
// create PhoneCheck
app.post('/api/phone-check', async (req, res) => {
  const { phone_number: phoneNumber } = req.body

  // create access token
  const accessToken = await createAccessToken()

  try {
    // create PhoneCheck resource

    const { checkId, checkUrl, numberSupported } = await createPhoneCheck(
      phoneNumber,
      accessToken,
    )

    if (!numberSupported) {
      res.status(400).send({ message: 'number not supported' })

      return
    }
    // send push notification
    const mobileToken = await get('mobileToken')

    if (mobileToken) {
      // create push notification msg object
      const message = {
        data: {
          phoneNumber,
          checkId,
          checkUrl,
          accessToken
        },
        notification: {
          title: 'Sign In Attempt.',
          body: 'Open to sign in.',
        },
        token: mobileToken,
      }

      const response = await admin.messaging().send(message)

      console.log('Successfully sent message from server', response)
    }
    res
      .status(201)
      .send({ data: { checkId, checkUrl }, message: 'PhoneCheck created' })
  } catch (e) {
    res.status(400).send({ message: e.message })
  }
})

// get PhoneCheck response

app.get('/api/phone-check', async (req, res) => {
  // get the `check_id` from the query parameter
  const { check_id: checkId } = req.query
  try {
    // get the PhoneCheck response
    const { match } = await getPhoneCheck(checkId)
    if (match) {
      const webToken = await get('webToken')
      const message = {
        data: {
          match,
        },
        token: webToken,
      }

      const response = await admin.messaging().send(message)

      console.log('Successfully sent message from server', response)
    }
    res.status(200).send({ data: { match }, message: 'successful match' })
  } catch (e) {
    res.status(400).send({ message: e.message })
  }
})

// setup server
app.listen(4000, () => {
  console.log('listening on PORT 4000')
})
