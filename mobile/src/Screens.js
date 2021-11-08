import React, { useContext, useState, useEffect } from 'react'

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
  Image
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'

import { AuthContext } from './Context'

import Toast from 'react-native-toast-message'

import TruSDK from '@tru_id/tru-sdk-react-native'

import DeviceInfo from 'react-native-device-info'
import messaging from '@react-native-firebase/messaging'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Screens = () => {
  // server ngrok url
  const base_url = '<YOUR_NGROK_URL>'
  const { screen, setScreen } = useContext(AuthContext)
  const [title, setTitle] = useState('Home 🏡')
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

  const approvedHandler = async (loginId) => {
    // user approved login so send patch request informing the server
    const body = { value: 'APPROVED' }
    try {
      const response = await fetch(`${base_url}/api/login/${loginId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      // open check URL
      await TruSDK.check(data.data.check_url)
      // successfully opened Check URL so send PATCH request informing the server that a match is pending

      await fetch(`${base_url}/api/login/${loginId}`, {
        method: 'PATCH',
        body: JSON.stringify({ value: 'MATCH_PENDING' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setTitle('Home 🏡')
    } catch (e) {
      errorHandler({
        title: 'Something went wrong',
        message: 'Please relaunch app.',
      })
    }
  }

  const deniedHandler = async (loginId) => {
    const body = { value: 'DENIED' }

    const response = await fetch(`${base_url}/api/login/${loginId}`, {
      method: 'PATCH',
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
    setTitle('Home 🏡')
  }

  const notificationHandler = (loginId) => {
    return Alert.alert(
      'Login Attempt Initiated',
      "Someone is attempting to login; please confirm it's you.",
      [
        {
          text: 'Approve',
          onPress: () => approvedHandler(loginId),
        },
        {
          text: 'Deny',
          onPress: () => deniedHandler(loginId),
        },
      ],
    )
  }

  // this function checks if we've stored the Device registration token in async storage and sends it to the server if we don't have.
  const getFCMDeviceToken = async (token = null, deviceId) => {
    const FCMRegistrationToken = await AsyncStorage.getItem('FCMDeviceToken')

    if (!FCMRegistrationToken && !token) {
      const registrationToken = await messaging().getToken()

      const body = {
        fcm_token: registrationToken,
        phone_number: phoneNumber,
        device_id: deviceId,
      }

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
      const body = {
        fcm_token: token,
        phone_number: phoneNumber,
        device_id: deviceId,
      }

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

  // useEffect for requesting permission on iOS
  useEffect(() => {
    requestUserPermission()
  }, [])

  // useEffect for getting FCM token
  useEffect(() => {
    const deviceId = DeviceInfo.getUniqueId()

    if (screen === 'login') {
      getFCMDeviceToken(null, deviceId)
    }

    return () =>
      messaging().onTokenRefresh((token) => {
        getFCMDeviceToken(token, deviceId)
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
        onPress: () => notificationHandler(remoteMessage.data.login_id),
      })
    })

    return unsubscribe
  }, [])

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
      await TruSDK.check(data.data.checkUrl)

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

  return (
    <>
      <LinearGradient
        colors={['rgba(25, 85, 255, 40)', 'rgba(10, 10, 50, 66)']}
        useAngle={true}
        angle={0}
        style={{
          flex: 1,
        }}
      >
        {screen === 'register' ? (
          <SafeAreaView style={styles.container}>
            <View style={styles.box}>
                <Image
                style={styles.logo}
                source={require('./images/tru-logo.png')}
              />
              <Text style={styles.heading}>Register</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Number ex. +448023432345"
                placeholderTextColor="#d3d3d3"
                value={phoneNumber}
                editable={!loading}
                onChangeText={(value) =>
                  setPhoneNumber(value.replace(/\s+/g, ''))
                }
              />
              {loading ? (
                <ActivityIndicator style={styles.spinner} size="large" color="#00ff00" />
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
  logo: {
    marginTop: 10,
    width: 0.5 * Dimensions.get('window').width,
    height: 200,
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
    borderColor: '#858585',
    borderWidth: 0.4,
    elevation: 7,
    shadowColor: '#858585',
    shadowOffset: { width: 0.5, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    color: '#000',
    width: 0.7 * Dimensions.get('window').width,
  },
  spinner: {
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1955ff',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1955ff',
    marginTop: 17,
    width: '40%',
  },
  buttonText: {
    color: '#fff',
  },
})

export default Screens
