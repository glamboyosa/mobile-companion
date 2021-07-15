import React, { createContext, useState } from 'react'

const AuthContext = createContext({
  screen: '',
  setScreen: (value) => {},
})

const AuthContextProvider = ({ children }) => {
  const [screen, setScreen] = useState('register')

  return (
    <AuthContext.Provider value={{ screen, setScreen }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export default AuthContextProvider
