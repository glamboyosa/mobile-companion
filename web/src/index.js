import { form, input } from './helpers/variables.js'

import { toggleLoading } from './helpers/loader.js'

import { clearForm, successUI } from './views/index.js'
import { poll } from './helpers/polling.js'

const baseURL = 'https://703260630efa.ngrok.io'

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
    let pollCount = 1
    poll(
      () => {
        return fetch(
          `${baseURL}/api/login/${data.login_id}?poll_count=${pollCount}`,
        ).then((resp) => resp.json())
      },
      200,
      6000,
    )
      .then((data) => {
        pollCount++
        if (data.check_status === 'MATCH_SUCCESS') {
          toggleLoading(false)
          clearForm()
          successUI()
        } else if (data.check_status === 'MATCH_FAILED') {
          Toastify({
            text: `${e.message}`,
            duration: 12000,
            close: true,
            className: 'toast',
            backgroundColor: '#f00',
            gravity: 'top', // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            onClick: function () {}, // Callback after click
          }).showToast()
          return
        }
      })
      .catch(() => {
        Toastify({
          text: `${e.message}`,
          duration: 12000,
          close: true,
          className: 'toast',
          backgroundColor: '#f00',
          gravity: 'top', // `top` or `bottom`
          position: 'center', // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          onClick: function () {}, // Callback after click
        }).showToast()
      })
  } catch (e) {
    console.log(JSON.stringify(e))
    Toastify({
      text: `${e.message}`,
      duration: 12000,
      close: true,
      className: 'toast',
      backgroundColor: '#f00',
      gravity: 'top', // `top` or `bottom`
      position: 'center', // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function () {}, // Callback after click
    }).showToast()
  }
})
