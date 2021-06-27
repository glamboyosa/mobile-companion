importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js')

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
