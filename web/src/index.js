import { form, input } from './helpers/variables.js'

import { toggleLoading } from './helpers/loader.js'

import { clearForm, successUI } from './views/index.js'

import { firebaseConfig, vapidKey } from './helpers/config.js'

import { sendToken } from './helpers/sendToken.js'

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

const baseURL = 'https://703260630efa.ngrok.io'

messaging
  .getToken({
    vapidKey,
  })
  .then((currentToken) => {
    console.log('we already have a token', currentToken)
    sendToken(baseURL, currentToken)
      .then(() => {})
      .catch((err) => {
        Toastify({
          text: `${err.message}`,
          duration: 3000,
          close: true,
          className: 'toast',
          backgroundColor: '#f00',
          gravity: 'top', // `top` or `bottom`
          position: 'center', // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          onClick: function () {}, // Callback after click
        }).showToast()
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        if (err) {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              messaging
                .getToken({
                  vapidKey,
                })
                .then((currentToken) => {
                  console.log(currentToken)
                  sendToken(baseURL, currentToken)
                    .then(() => {})
                    .catch((err) => {
                      Toastify({
                        text: `${err.message}`,
                        duration: 3000,
                        close: true,
                        className: 'toast',
                        backgroundColor: '#f00',
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        onClick: function () {}, // Callback after click
                      }).showToast()
                    })
                })
            } else {
              Toastify({
                text: `Couldn't get permission to send token`,
                duration: 3000,
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
        }
      })
  })

messaging.onMessage((payload) => {
  console.log(payload, 'from foreground')
  // get the match
  const match = JSON.parse(payload.data.match)
  if (match) {
    // if there is a match update the UI
    clearForm()

    successUI()
  } else {
    Toastify({
      text: `Failed to verify you. Please contact your network provider.`,
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
form.addEventListener('submit', async (e) => {
  // prevent page from refreshing
  e.preventDefault()

  toggleLoading(true)

  const body = { phone_number: input.value }
  try {
    const response = await fetch(`${baseURL}/api/phone-check`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      toggleLoading(false)
      Toastify({
        text: `MNO not supported`,
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
