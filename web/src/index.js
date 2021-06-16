import 'regenerator-runtime/runtime'

import { form, input } from './helpers/variables'

import {toggleLoading} from './helpers/loader'

import { clearForm, successUI } from './views/index'

import Toastify from 'toastify-js'

import 'toastify-js/src/toastify.css'

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
      duration: 3000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'center', // `left`, `center` or `right`
      backgroundColor: '#f00',
      stopOnFocus: true, // Prevents dismissing of toast on hover
      onClick: function () {}, // Callback after click
    }).showToast()
  }
})
