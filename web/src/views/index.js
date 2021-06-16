import { form, main } from '../helpers/variables'

const clearForm = () => form.parentElement.removeChild(form)

const successUI = () => {
  const markup = `
    <div class="home">
    <span class="home-icon">🏡</span>
    <h1 class="heading">Successfully signed in</h1>
  </div>
    `
  main.insertAdjacentHTML('beforeend', markup)
}

export { successUI, clearForm }
