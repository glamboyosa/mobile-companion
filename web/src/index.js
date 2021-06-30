import { form, input } from './helpers/variables.js'

import { toggleLoading } from './helpers/loader.js'

import { clearForm, successUI } from './views/index.js'




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
