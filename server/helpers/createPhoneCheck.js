const fetch = require('node-fetch')
exports.createPhoneCheck = async (phoneNumber, accessToken) => {
  let checkUrl
  let checkId
  let numberSupported = true

  const body = JSON.stringify({ phone_number: phoneNumber })
  const response = await fetch(
    `https://eu.api.tru.id/phone_check/v0.1/checks`,
    {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (response.status === 201) {
    const data = await response.json()
    console.log(data)

    checkUrl = data._links.check_url.href
    checkId = data.check_id
  } else if (response.status === 400) {
    console.log('number not supported')
    numberSupported = false
  } else {
    throw new Error(
      `Unexpected API response ${response.status}`,
      response.toString(),
    )
  }
  return { checkId, checkUrl, numberSupported }
}
