
import React, { useState } from 'react';
import { Image, View, StyleSheet, TextInput, Button, Text, TouchableOpacity} from 'react-native';
const LogInScreen = (props) =>{
    const [domain, setDomain] = useState('')
    const [userName, setUserName] = useState('') // set user name
    const [password, setPassword] = useState('')
    const checkLogin = ()=> {
        if (userName === "Admin" && password == "admin123"){
            props.navigation.navigate("PatientList")
        }
        else {
            alert('Please enter user name and password')
        }

    }
    return(
        <View style = {marginTop=200}>
          
          <Text style = {styles.textTitleStyle}>Welcome To Augwa</Text>
          <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
              placeholder='Domain: '/>
          <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
              placeholder='Username: '/>
          <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
              placeholder='Password: '/>
          <Button title='Forgot Password ? ' onPress={checkLogin}></Button>
           
        </View>
    )   
}

const styles = StyleSheet.create({ 
    
    viewStyle: {
      alignItems: 'stretch',
      justifyContent:'space-between',
      margin: 15,
      padding: 10},
    textTitleStyle: {
      marginTop: 15,
      fontSize: 35,
      fontWeight: "bold",
      alignContent: "center"
  },
    inputView: {
      height: 45,
      width: 360,
      borderWidth: 0.5,
      borderRadius: 8,
      fontSize: 20,
      fontWeight: "bold",
      top:10
    },
    imageStyle: {
      alignSelf:"center",
      width: 50,
      height: 50
  }
  })
export default LogInScreen