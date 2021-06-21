// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: 'AIzaSyCo7-lH-3HVfXSIlC7IbyVGyYxYBWGCUfU',
  authDomain: 'mobile-companion-19d55.firebaseapp.com',
  projectId: 'mobile-companion-19d55',
  storageBucket: 'mobile-companion-19d55.appspot.com',
  messagingSenderId: '694384956780',
  appId: '1:694384956780:web:5c3c08147d1ae739c78f49',
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

// handle foreground messages
messaging.onMessage((payload) => {
  const form = document.querySelector('.form')

  const main = document.querySelector('.box')

  if (payload.data.match) {
    // remove form
    form.parentElement.removeChild(form)

    // render success UI
    const markup = `
    <div class="home">
    <span class="home-icon">🏡</span>
    <h1 class="heading">Successfully signed in</h1>
  </div>
    `
    main.insertAdjacentHTML('beforeend', markup)
  }
})
