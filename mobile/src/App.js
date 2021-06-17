import React, { useState, useEffect } from 'react'

import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  Dimensions,
  Alert,
  Appearance,
  View,
} from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'

import messaging from '@react-native-firebase/messaging'
const App = () => {
  const baseURL = ''
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  // this function checks if we've stored the Device registration token in async storage and sends it to the server if we don't have.
  const getFCMDeviceToken = async (token = null) => {
    const registrationToken = await AsyncStorage.getItem('FCMDeviceToken')
    if (!registrationToken && !token) {
      const registrationToken = await messaging().getToken()
      const body = { registrationToken }
      const response = await fetch(`${baseURL}/api/token`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // if something went wrong, inform the user
      !response.ok() &&
        Alert.alert('Something went wrong.', 'Please relaunch app.', [
          {
            text: 'Close',
            onPress: () => console.log('Alert closed'),
          },
        ])
    }
  }
  useEffect(() => {
    getFCMDeviceToken()
    return () =>
      messaging().onTokenRefresh((token) => {
        getFCMDeviceToken(token)
      })
  }, [])
  const signInHandler = async () => {}
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Signing In...</Text>
      <View style={styles.form}>
        <View>
          <TextInput
            style={styles.textInput}
            placeholder="Number ex. +448023432345"
            placeholderTextColor="#d3d3d3"
            keyboardType="phone-pad"
            value={phoneNumber}
            editable={!loading}
            onChangeText={(Value) => setPhoneNumber(Value.replace(/\s+/g, ''))}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <TouchableOpacity onPress={signInHandler} style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 50,
  },
  form: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  textInput: {
    padding: 15,
    borderColor: '#20232a',
    borderWidth: 3,
    elevation: 7,
    height: 50,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 10,
    width: 0.8 * Dimensions.get('window').width,
  },
  button: {
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e67e22',
    color: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
})

export default App
