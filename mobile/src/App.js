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

import Toast from 'react-native-toast-message'

import TruSDK from '@tru_id/tru-sdk-react-native'
const App = () => {
  const baseURL = ''
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
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
      const body = { registrationToken }
      const response = await fetch(`${baseURL}/api/token?from=mobile`, {
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
    } else if (token) {
      const body = { registrationToken: token }
      const response = await fetch(`${baseURL}/api/token?from=mobile`, {
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
  const onPressHandler = async (checkUrl, checkId, accessToken) => {
    setLoading(true)
    // open checkUrl & Ready Result
    await TruSDK.openCheckUrl(checkUrl)

    // get PhoneCheck Result
    const response = await fetch(
      `${baseURL}/api/phone-check?check_id=${checkId}&access_token=${accessToken}`,
    )

    !response.ok &&
      Alert.alert('Something went wrong.', 'Please relaunch app.', [
        {
          text: 'Close',
          onPress: () => console.log('Alert closed'),
        },
      ])
  }
  useEffect(() => {
    requestUserPermission()
    getFCMDeviceToken()
    return () =>
      messaging().onTokenRefresh((token) => {
        getFCMDeviceToken(token)
      })
  }, [])
  // useEffect for handling foreground messages
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
        onPress: () =>
          onPressHandler(
            remoteMessage.data.checkUrl,
            remoteMessage.data.checkId,
            remoteMessage.data.accessToken,
          ),
      })
    })

    return unsubscribe
  }, [])

  return (
    <>
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
              onChangeText={(Value) =>
                setPhoneNumber(Value.replace(/\s+/g, ''))
              }
            />
            {loading ? (
              <ActivityIndicator size="large" color="#00ff00" />
            ) : (
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
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
