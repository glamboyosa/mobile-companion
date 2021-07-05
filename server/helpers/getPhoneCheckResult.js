const fetch = require('node-fetch')
const { createAccessToken } = require('./createAccessToken')
exports.getPhoneCheck = async (checkId) => {
  const accessToken = await createAccessToken()
  const response = await fetch(
    `https://eu.api.tru.id/phone_check/v0.1/checks/${checkId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  const { match } = await response.json()

  return { match }
}
