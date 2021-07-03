const express = require('express')
const cors = require('cors')

//promisify

const { promisify } = require('util')

// firebase
const admin = require('firebase-admin')

// morgan
const morgan = require('morgan')

const path = require('path')
// helpers
const { createAccessToken } = require('./helpers/createAccessToken')
const { createPhoneCheck } = require('./helpers/createPhoneCheck')
const { getPhoneCheck } = require('./helpers/getPhoneCheckResult')
const { uuid } = require('uuidv4')
const { redisClient } = require('./helpers/redisClient')

const get = promisify(redisClient.get).bind(redisClient)

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

// initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})

// save Mobile Client FCM token, phone number & device id to Redis
app.post('/api/tokens', async (req, res) => {
  const { fcm_token, phone_number, device_id } = req.body
  const users = await get('users')
  // check if there is a mobile token
  if (users) {
    const oldUsers = JSON.parse(users)
    // check if we have a user with that phone number, get it and also filter out the existing user from or array
    // POINT BEING THE USER WANTS TO RE-REGISTER WITH THE SAME PHONE NUMBER
    const existingUser = oldUsers.find((el) => el.phone_number === phone_number)
    const updatedUsers = oldUsers.filter(
      (el) => el.phone_number !== phone_number,
    )
    // check if we have users, if we do, update the fcm_token and device_id
    if (existingUser) {
      existingUser.fcm_token = fcm_token
      existingUser.device_id = device_id

      // add the updated user back and set the users to redis

      updatedUsers.push(existingUser)

      return redisClient.setex(
        'users',
        60 * 60 * 24 * 7,
        JSON.stringify(updatedUsers),
      )
    }
    const userProperties = {
      fcm_token,
      phone_number,
      device_id,
      login_id: uuid(),
      check_id: null,
      check_url: null,
      check_status: 'UNKNOWN',
    }
    oldUsers.push(userProperties)

    redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(oldUsers))
  } else {
    const userProperties = {
      fcm_token,
      phone_number,
      device_id,
      login_id: uuid(),
      check_id: null,
      check_url: null,
      check_status: 'UNKNOWN',
    }
    const users = []
    users.push(userProperties)
    redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(users))
  }

  return res.status(201).send({ message: 'successfully saved user to redis' })
})

// create PhoneCheck
app.post('/api/register', async (req, res) => {
  const { phone_number: phoneNumber } = req.body

  try {
    // create access token
    const accessToken = await createAccessToken()
    // create PhoneCheck resource

    const { checkId, checkUrl, numberSupported } = await createPhoneCheck(
      phoneNumber,
      accessToken,
    )

    if (!numberSupported) {
      res.status(400).send({ message: 'number not supported' })

      return
    }
    res.status(201).send({
      data: { checkId, checkUrl },
      message: 'PhoneCheck created',
    })
  } catch (e) {
    res.status(400).send({ message: e.message })
  }
})

// get PhoneCheck response

app.get('/api/register', async (req, res) => {
  // get the `check_id` from the query parameter
  const { check_id: checkId } = req.query

  try {
    // create access token
    const accessToken = await createAccessToken()
    // get the PhoneCheck response
    const { match } = await getPhoneCheck(checkId, accessToken)

    console.log(match)
    res.status(200).send({ data: { match } })
  } catch (e) {
    console.log(JSON.stringify(e))
    res.status(400).send({ message: e.message })
  }
})

app.post('/api/login', async (req, res) => {
  const { phone_number: phoneNumber } = req.body
  try {
    const users = await get('users')
    if (users) {
      const currentUsers = JSON.parse(users)

      const currentUser = currentUsers.find(
        (el) => el.phone_number === phoneNumber,
      )
      // set `check_status` to `UNKNOWN`
      const updatedUsers = currentUsers.map((el) => {
        if (el.phone_number === phoneNumber) {
          el.check_status = 'UNKNOWN'
          el.check_id = null
          el.check_url = null
        }
        return el
      })

      redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(updatedUsers))
      currentUser
        ? res.status(201).send({
            data: {
              login_id: currentUser.login_id,
              check_id: null,
              check_url: null,
              check_status: 'UNKNOWN',
            },
          })
        : res.status(404).send({ message: 'User does not exist' })
    }
  } catch (e) {
    console.log(JSON.stringify(e))
    res.status(400).send({ message: e.message })
  }
})

// get PhoneCheck response

app.get('/api/login/:login_id', async (req, res) => {
  const { login_id } = req.params
  const { poll_count } = req.query
  try {
    const users = await get('users')

    const currentUsers = JSON.parse(users)

    const user = currentUsers.find((el) => el.login_id === login_id)
    console.log(user)
    if (poll_count === '1' && user.login_id) {
      const message = {
        data: {
          phone_number: user.phone_number,
          login_id: user.login_id,
        },
        notification: {
          title: 'Sign In Attempt.',
          body: 'Open to sign in.',
        },
        token: user.fcm_token,
      }
      const response = await admin.messaging().send(message)

      console.log(
        'Sent push notification to',
        user.device_id,
        'containing',
        response,
      )
    }
    // if the check_status` === "MATCH_SUCCESSFUL" return the user. Needed so the polling function does not continually call our helpers
    if (user.check_status === 'MATCH_SUCCESS') {
      res.status(200).send({ data: user })
      return
    } else if (user.check_status === 'MATCH_FAILED') {
      res.status(200).send({ data: user })
      return
    }
    // IF `check_status` === "MATCH_PENDING". Get the PhoneCheck response
    else if (user.check_status === 'MATCH_PENDING') {
      // create access token
      const accessToken = await createAccessToken()
      // get the PhoneCheck response
      const { match } = await getPhoneCheck(user.check_id, accessToken)

      if (match) {
        const updatedUsers = currentUsers.map((el) => {
          if (el.login_id === login_id) {
            el.check_status = 'MATCH_SUCCESS'
          }
          return el
        })
        redisClient.setex(
          'users',
          60 * 60 * 24 * 7,
          JSON.stringify(updatedUsers),
        )

        const result = { ...user, check_status: 'MATCH_SUCCESS' }
        res.status(200).send({ data: result })
        return
      } else {
        const updatedUsers = currentUsers.map((el) => {
          if (el.login_id === login_id) {
            el.check_status = 'MATCH_FAILED'
          }
          return el
        })
        redisClient.setex(
          'users',
          60 * 60 * 24 * 7,
          JSON.stringify(updatedUsers),
        )
        const result = { ...user, check_status: 'MATCH_FAILED' }
        res.status(200).send({ data: result })
        return
      }
    } else if (user.check_status === 'DENIED') {
      res.status(200).send({ data: user })
      return
    }
    // return defaults to the client
    const result = {
      ...user,
      check_status: 'UNKNOWN',
      check_id: null,
      check_url: null,
    }
    res.status(200).send({ data: result })
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
})
app.patch('/api/login/:login_id', async (req, res) => {
  const { login_id } = req.params
  const { value } = req.body
  try {
    if (value === 'APPROVED') {
      // create access token
      const accessToken = await createAccessToken()

      const users = await get('users')

      const currentUsers = JSON.parse(users)

      const user = currentUsers.find((el) => el.login_id === login_id)

      const { checkId, checkUrl } = await createPhoneCheck(
        user.phone_number,
        accessToken,
      )
      // update `check_status` , `check_id` and `check_url`
      const updatedUsers = currentUsers.map((el) => {
        if (el.login_id === login_id) {
          el.check_status = 'APPROVED'
          el.check_id = checkId
          el.check_url = checkUrl
        }
        return el
      })

      redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(updatedUsers))

      res.status(200).send({
        data: {
          login_id: user.login_id,
          check_id: checkId,
          check_url: checkUrl,
          check_status: 'APPROVED',
        },
      })
      return
    } else if (value === 'MATCH_PENDING') {
      const users = await get('users')

      const currentUsers = JSON.parse(users)

      const user = currentUsers.find((el) => el.login_id === login_id)

      // update `check_status` , `check_id` and `check_url`
      const updatedUsers = currentUsers.map((el) => {
        if (el.login_id === login_id) {
          el.check_status = 'MATCH_PENDING'
        }
        return el
      })
      redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(updatedUsers))
      res.status(200).send({
        data: {
          login_id: user.login_id,
          check_id: user.check_id,
          check_url: user.check_url,
          check_status: 'MATCH_PENDING',
        },
      })
      return
    } else if (value === 'DENIED') {
      const users = await get('users')

      const currentUsers = JSON.parse(users)

      const user = currentUsers.find((el) => el.login_id === login_id)

      // update `check_status` , `check_id` and `check_url`
      const updatedUsers = currentUsers.map((el) => {
        if (el.login_id === login_id) {
          el.check_status = 'DENIED'
          el.check_url = null
          el.check_id = null
        }
        return el
      })
      redisClient.setex('users', 60 * 60 * 24 * 7, JSON.stringify(updatedUsers))
      res.status(200).send({
        data: {
          login_id: user.login_id,
          check_id: null,
          check_url: null,
          check_status: 'DENIED',
        },
      })
    }
  } catch (e) {
    res.status(500).send({ message: e.message })
  }
})

// setup server
app.listen(4000, () => {
  console.log('listening on PORT 4000')
})
