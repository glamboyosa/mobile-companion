import React from 'react'

import Screens from './Screens'

import AuthContextProvider from './Context'
const App = () => (
  <AuthContextProvider>
    <Screens />
  </AuthContextProvider>
)

export default App
