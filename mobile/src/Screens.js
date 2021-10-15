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
  Image
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient'

import { AuthContext } from './context'

import Toast from 'react-native-toast-message'

import TruSDK from '@tru_id/tru-sdk-react-native'

const Screens = () => {
  // server ngrok url
  const base_url = 'https://ngrokurl.ngrok.io'
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
                source={require('../images/tru-logo.png')}
              />
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
