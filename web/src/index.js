import 'regenerator-runtime/runtime'

import { form, input } from './helpers/variables'

import { toggleLoading } from './helpers/loader'

import { clearForm, successUI } from './views/index'

import Toastify from 'toastify-js'

import 'toastify-js/src/toastify.css'

import firebase from 'firebase/app'

import { firebaseConfig, vapidKey } from './helpers/config'
import { sendToken } from './helpers/sendToken'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const baseURL = ''

window.addEventListener('load', async () => {
  const messaging = firebase.messaging()
  try {
    const currentToken = await messaging.getToken({ vapidKey })

    if (currentToken) {
      // we have a token presently so send it to the server
      await sendToken(baseURL, currentToken)
    } else {
      // we do not have permission so request permission
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const currentToken = await messaging.getToken({ vapidKey })
        await sendToken(baseURL, currentToken)
      } else {
        Toastify({
          text: `Couldn't get permission to send token`,
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
    }
  } catch (e) {
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
form.addEventListener('submit', async (e) => {
  // prevent page from refreshing
  e.preventDefault()

  toggleLoading(true)

  const body = { phone_number: input.value }
  try {
    await fetch('', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
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
