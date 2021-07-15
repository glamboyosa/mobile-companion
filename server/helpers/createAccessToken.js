const fetch = require('node-fetch')
const truIdConfig = require('../../tru.json')
exports.createAccessToken = async () => {
  // make request body acceptable by application/x-www-form-urlencoded
  const clientId = truIdConfig.credentials[0].client_id
  const clientSecret = truIdConfig.credentials[0].client_secret

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  )

  const resp = await fetch(`https://eu.api.tru.id/oauth2/v1/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials&scope=phone_check',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
  })

  const { access_token } = await resp.json()
  
  return access_token
}
