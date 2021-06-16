import React, { useState } from 'react'

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

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

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
