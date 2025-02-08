
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
          <TouchableOpacity style={styles.btnPsw} >
              <Text style={styles.bluBtntext}>Forgot Password ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop: 60, width: 340, height: 45, borderRadius: 8,
              alignSelf: "center", backgroundColor: "#2D4059", justifyContent: "center",
              alignItems: "center" }} >
              <Text style={{textAlign: "center", padding: "auto",
                fontSize: 23, color: '#ffffff'}}>SIGN IN</Text>
          </TouchableOpacity>
          <View style = {styles.signupView}>
            <Text style = {{fontSize: 17, color: '5F5F5F'}}>Don't have an account?</Text>
            <TouchableOpacity >
              <Text style={styles.bluBtntext}>  Sign up</Text>
            </TouchableOpacity>

          </View>
          

           
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
      alignSelf: "center"
  },
    inputView: {
      height: 45,
      width: 360,
      borderWidth: 0.5,
      borderRadius: 8,
      fontSize: 20,
      fontWeight: "bold",
      marginTop:5,
      alignSelf: 'center'
    },
    imageStyle: {
      alignSelf:"center",
      width: 50,
      height: 50
  },
  btnPsw:{
    marginLeft: 240,
    marginTop: 12
  },
  bluBtntext:{
    fontSize: 17,
    color: '#177de1'
  },
  signupView:{
    marginTop: 60,
    flexDirection: 'row',
    alignSelf:'center'
    
  }
  })
export default LogInScreen