const fetch = require('node-fetch')

exports.getPhoneCheck = async (checkId, accessToken) => {
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

  const { match } = response.json()

  return { match }
}
