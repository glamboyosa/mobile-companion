import React from 'react'

import Screens from './screens'

import AuthContextProvider from './context'
const App = () => (
  <AuthContextProvider>
    <Screens />
  </AuthContextProvider>
)

export default App
