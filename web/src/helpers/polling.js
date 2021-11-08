import { toggleLoading } from './loader.js'
import { clearForm, successUI } from '../views/index.js'

const pollingFunction = (baseURL, loginId) => {
  let pollCount = 1
  console.log(pollCount)

  const interval = setInterval(async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/login/${loginId}?poll_count=${pollCount}`,
      )

      const data = await response.json()
      console.log(data)

      if (data) {
        pollCount += 1
      }

      if (data.data.check_status === 'MATCH_SUCCESS') {
        clearInterval(interval)
        toggleLoading(false)
        clearForm()
        successUI()
      } else if (data.data.check_status === 'MATCH_FAILED') {
        clearInterval(interval)
        toggleLoading(false)

        Toastify({
          text: `Login Failed`,
          duration: 3000,
          close: true,
          className: 'toast',
          backgroundColor: '#f00',
          gravity: 'top',
          position: 'center',
          stopOnFocus: true,
        }).showToast()

        return
      } else if (data.data.check_status === 'DENIED') {
        clearInterval(interval)
        toggleLoading(false)

        Toastify({
          text: `Login Request Denied`,
          duration: 3000,
          close: true,
          className: 'toast',
          backgroundColor: '#f00',
          gravity: 'top',
          position: 'center',
          stopOnFocus: true,
        }).showToast()
      }
    } catch (e) {
      Toastify({
        text: `${e.message}`,
        duration: 3000,
        close: true,
        className: 'toast',
        backgroundColor: '#f00',
        gravity: 'top',
        position: 'center',
        stopOnFocus: true,
      }).showToast()
    }
  }, 5000)
}

export { pollingFunction }