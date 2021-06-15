const express = require('express')
const cors = require('cors')
const { createAccessToken } = require('./helpers/createAccessToken')
const { createPhoneCheck } = require('./helpers/createPhoneCheck')
const { getPhoneCheck } = require('./helpers/getPhoneCheckResult')

const app = express()

app.use(express.json())
app.use(cors())

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

    res.status(200).send({ data: { match }, message: 'successful match' })
  } catch (e) {
    res.status(400).send({ message: e.message })
  }
})

// setup server
app.listen(4000, () => {
  console.log('listening on PORT 4000')
})
