import { form, main } from '../helpers/variables/index'

const clearForm = () => form.parentElement.removeChild(form)

const successUI = () => {
  const markup = `
    <div class="home">
    <span>🏡</span>
    <h1 class="heading">Successfully signed in</h1>
  </div>
    `
  main.insertAdjacentHTML('beforeend', markup)
}

export { successUI, clearForm }
