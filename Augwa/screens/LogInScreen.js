import React, { useState } from 'react';
import { Image, View, StyleSheet, TextInput, Button, Text } from 'react-native';
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
            <Image style={styles.imageStyle} source={require('../assets/images/app_logo.svga')}></Image>
            <View  style = {styles. viewStyle}>
              <Text style = {styles.textStyle}>Please Enter Your User Name</Text>
              <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
              placeholder='Enter user name:'/>
            </View>
            <View style = {styles. viewStyle}>
              <Text style = {styles.textStyle}>Please Enter Your password</Text>
              <TextInput style = {styles.inputView}value = {password} onChangeText={setPassword}
              secureTextEntry = {true}
              placeholder='Enter password:'/>
            </View>
            <Button title='Log In' onPress={checkLogin}></Button>
           
        </View>
    )   
}

const styles = StyleSheet.create({ 
    
    viewStyle: {
      alignItems: 'stretch',
      justifyContent:'space-between',
      margin: 15,
      padding: 10},
    textStyle : {
      marginTop: 15,
      fontSize: 20,
      fontWeight: "bold",
      alignContent: "center"
  },
    inputView: {
      borderWidth: 1,
      borderRadius: 5,
      fontSize: 20,
      fontWeight: "bold",
    },
    imageStyle: {
      alignSelf:"center",
      width: 50,
      height: 50
  }
  })
export default LogInScreen
