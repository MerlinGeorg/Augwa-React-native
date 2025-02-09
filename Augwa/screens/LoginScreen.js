import React, { useState } from 'react';
import {
  TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, Text, TouchableOpacity,
  alert
} from 'react-native';
import Login from "../components/Login";
import Logo from '../assets/images/app_logo.svg'
import { ScrollView } from 'react-native-gesture-handler';
import { buttonTextColor, errorGrey, errorRed, primaryColor, successGreen, textInputBorderColor } from "../assets/styles/color";

const LoginScreen = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('')
  const [userName, setUserName] = useState('') // set user name
  const [password, setPassword] = useState('')
  const handleLogin = async() => {
    const credentials = {
      username: userName,
      password: password
    }
    try{
      if (!credentials.username || !credentials.password){
        alert("Please fill in all fields!")
        return
      }
      const result = await Login.login(credentials)
      if(result.success) {
        await SecureStore.setItemAsync('authToken', result.data.token)
        navigation.navigate('signin')
      }else {
        switch (result.error.code) {
          
          case 'INVALID_CREDENTIALS' :
            alert('Incorrect username or password')
            break
          case 'ACCOUNT_UNVARIED' :
            alert('Please verify you account')
            break
          case 'NETWORK_ERROR' :
            alert('Unable to connect to server, please check your Internet connection')
            break
          default:
            alert('Login failed, please try again')

          }
        }
     }catch(error) {
        console.error('System error:', error)
        alert("A system error occured, Restart the app")
      }
  }
  

  const jumpToSignUp = () => {
    props.navigation.navigate("signup")
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 0.75 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

        <View style={{ marginTop: 10 }}>
          <Logo style={styles.logoStyle} />
          <Text style={styles.textTitleStyle}>Welcome To Augwa</Text>

          <View style={{ marginTop: 10 }}>
            <TextInput style={styles.inputView} value={domain} onChangeText={setDomain}
              placeholder='Domain: ' 
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"/>
            <TextInput style={styles.inputView} value={userName} onChangeText={setUserName}
              placeholder='Username: ' 
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"/>
            <TextInput style={styles.inputView} value={password} onChangeText={setPassword}
              placeholder='Password: '
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
             returnKeyType="done" />
          </View>
          <TouchableOpacity style={styles.btnPsw} >
            <Text style={styles.bluBtntext}>Forgot Password ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            marginTop: 50, width: 340, height: 45, borderRadius: 8,
            alignSelf: "center", backgroundColor: "#2D4059", justifyContent: "center",
            alignItems: "center"
          }} >
            <Text style={{
              textAlign: "center", padding: "auto",
              fontSize: 23, color: '#ffffff'
            }}>SIGN IN</Text>
          </TouchableOpacity>
          <View style={styles.signupView}>
            <Text style={{ fontSize: 17, color: '5F5F5F' }}>Don't have an account?</Text>
            <TouchableOpacity onPress={jumpToSignUp}>
              <Text style={styles.bluBtntext}>  Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({

  logoStyle: {
    width: 100,
    height: 100,
    alignSelf: 'center',

  },
  viewStyle: {
    alignItems: 'stretch',
    justifyContent: 'space-between',
    margin: 15,
    padding: 10
  },

  textTitleStyle: {
    marginTop: 25,
    fontSize: 35,
    fontWeight: "bold",
    alignSelf: "center"
  },
  inputView: {
    height: 45,
    width: 360,
    borderWidth: 0.5,
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    alignSelf: 'center',
    borderColor: textInputBorderColor

  },
  imageStyle: {
    alignSelf: "center",
    width: 50,
    height: 50

  },
  btnPsw: {
    marginLeft: 240,
    marginTop: 12
  },
  bluBtntext: {
    fontSize: 17,
    color: '#177de1'
  },
  signupView: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center'

  }
})
export default LoginScreen
