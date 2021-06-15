import { submitHandler, loader } from './variables'
export const toggleLoading = (loading) => {
  if (loading) {
    submitHandler.children[0].innerHTML = ''
    loader.style.display = 'inline-block'
  } else {
    submitHandler.children[0].innerHTML = 'Sign Up'
    loader.style.display = 'none'
  }
}
