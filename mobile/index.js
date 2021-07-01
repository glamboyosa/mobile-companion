import { AppRegistry } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import App from './src/App'
import { notificationHandler } from './src/screens'
import { name as appName } from './app.json'

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage)
  notificationHandler(remoteMessage.data.login_id)
})
AppRegistry.registerComponent(appName, () => App)
