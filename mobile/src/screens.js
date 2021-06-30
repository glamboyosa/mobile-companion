import React, { useContext, useState } from 'react'

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'

import { AuthContext } from './context'

import AsyncStorage from '@react-native-async-storage/async-storage'

import messaging from '@react-native-firebase/messaging'

import Toast from 'react-native-toast-message'

import TruSDK from '@tru_id/tru-sdk-react-native'

const Screens = () => {
  // server ngrok url
  const base_url = 'https://2cb3d5b5d0a2.ngrok.io'
  const { screen, setScreen } = useContext(AuthContext)
  const [title, setTitle] = useState('Login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const errorHandler = ({ title, message }) => {
    return Alert.alert(title, message, [
      {
        text: 'Close',
        onPress: () => console.log('Alert closed'),
      },
    ])
  }
  // request permission on iOS
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (enabled) {
      console.log('Authorization status:', authStatus)
    }
  }
  // this function checks if we've stored the Device registration token in async storage and sends it to the server if we don't have.
  const getFCMDeviceToken = async (token = null) => {
    const FCMRegistrationToken = await AsyncStorage.getItem('FCMDeviceToken')
    if (!FCMRegistrationToken && !token) {
      const registrationToken = await messaging().getToken()
      const body = { registrationToken, phone_number: phoneNumber }
      const response = await fetch(`${base_url}/api/tokens`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // if something went wrong, inform the user
      !response.ok &&
        errorHandler({
          title: 'Something went wrong',
          message: 'Please relaunch app.',
        })
    } else if (token) {
      const body = { registrationToken: token, phone_number: phoneNumber }
      const response = await fetch(`${base_url}/api/tokens`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // if something went wrong, inform the user
      !response.ok &&
        errorHandler({
          title: 'Something went wrong',
          message: 'Please relaunch app.',
        })
    }
  }
  const registerHandler = async () => {
    const body = { phone_number: phoneNumber }

    setLoading(true)

    console.log('creating PhoneCheck for', body)

    try {
      const response = await fetch(`${base_url}/api/register`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      console.log(data)
      // open Check URL

      await TruSDK.openCheckUrl(data.data.checkUrl)

      const resp = await fetch(
        `${base_url}/api/register?check_id=${data.data.checkId}`,
      )

      const phoneCheckResult = await resp.json()

      if (phoneCheckResult.data.match) {
        setLoading(false)
        setScreen('login')
      } else {
        setLoading(false)
        errorHandler({
          title: 'Registration Failed',
          message: 'PhoneCheck match failed. Please contact support',
        })
      }
    } catch (e) {
      setLoading(false)
      errorHandler({ title: 'Something went wrong', message: e.message })
    }
  }

  const loginHandler = () => {}
  // useEffect for requesting permission on iOS
  useEffect(() => {
    requestUserPermission()
  }, [])
  // useEffect for getting FCM token
  useEffect(() => {
    if (screen === 'login') {
      getFCMDeviceToken()
    }
    return () =>
      messaging().onTokenRefresh((token) => {
        getFCMDeviceToken(token)
      })
  }, [screen])
  // useEffect for handling foreground messages
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      setTitle('Signing In...')
      Toast.show({
        type: 'info',
        position: 'top',
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
        onPress: () =>
          onPressHandler(
            remoteMessage.data.checkUrl,
            remoteMessage.data.checkId,
            remoteMessage.data.phoneNumber,
          ),
      })
    })

    return unsubscribe
  }, [])
  return (
    <>
      <LinearGradient
        colors={['rgba(253,161, 114,23)', 'rgba(242, 82, 120,92)']}
        useAngle={true}
        angle={0}
        style={{
          flex: 1,
        }}
      >
        {screen === 'register' ? (
          <SafeAreaView style={styles.container}>
            <View style={styles.box}>
              <Text style={styles.heading}>Register</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Number ex. +448023432345"
                placeholderTextColor="#d3d3d3"
                keyboardType="phone-pad"
                value={phoneNumber}
                editable={!loading}
                onChangeText={(value) =>
                  setPhoneNumber(value.replace(/\s+/g, ''))
                }
              />
              {loading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : (
                <TouchableOpacity
                  onPress={registerHandler}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={styles.container}>
            <View style={styles.box}>
              <Text style={styles.heading}>{title}</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Number ex. +448023432345"
                placeholderTextColor="#d3d3d3"
                keyboardType="phone-pad"
                value={phoneNumber}
                editable={!loading}
                onChangeText={(value) =>
                  setPhoneNumber(value.replace(/\s+/g, ''))
                }
              />
              {loading ? (
                <ActivityIndicator size="large" color="#00ff00" />
              ) : (
                <TouchableOpacity onPress={loginHandler} style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        )}
      </LinearGradient>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    borderRadius: 3,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0.5, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 0.7 * Dimensions.get('window').height,
    padding: 15,
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    padding: 15,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 0.4,
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0.5, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    color: '#000',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff7f',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    width: '40%',
  },
  buttonText: {
    color: '#fff',
  },
})

export default Screens
