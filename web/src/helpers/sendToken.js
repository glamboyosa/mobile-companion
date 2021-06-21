// function for sending registration token
export const sendToken = async (baseURL, currentToken) => {
  const body = { registrationToken: currentToken }
  const response = await fetch(`${baseURL}/api/token?from=web`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  !response.ok &&
    Toastify({
      text: 'Something went wrong. Please reload the page',
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
