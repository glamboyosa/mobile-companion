import { form, input } from './helpers/variables.js'

import { toggleLoading } from './helpers/loader.js'

import { pollingFunction } from './helpers/polling.js'

const baseURL = 'https://17a8102d7eb3.ngrok.io'

form.addEventListener('submit', async (e) => {
  // prevent page from refreshing
  e.preventDefault()

  toggleLoading(true)

  const body = { phone_number: input.value }
  try {
    const response = await fetch(`${baseURL}/api/login`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const { data } = await response.json()
    pollingFunction(baseURL, data.login_id)
  } catch (e) {
    console.log(JSON.stringify(e))
    Toastify({
      text: `${e.message}`,
      duration: 12000,
      close: true,
      className: 'toast',
      backgroundColor: '#f00',
      gravity: 'top',
      position: 'center',
      stopOnFocus: true,
    }).showToast()
  }
})
