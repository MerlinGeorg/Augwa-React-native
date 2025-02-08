

import React, { useState } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard, Text, TouchableOpacity} from 'react-native';
import Logo from '../assets/images/app_logo.svg'
import { buttonTextColor, errorGrey, errorRed, primaryColor, successGreen, textInputBorderColor } from "../assets/styles/color";

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
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style = {{marginTop:30}}>
          <Logo style = {styles.logoStyle}/>
          <Text style = {styles.textTitleStyle}>Welcome To Augwa</Text>
          <View style = {{marginTop:37}}>
          <TextInput style = {styles.inputView}value = {domain} onChangeText={setDomain}
              placeholder='Domain: '/>
          <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
              placeholder='Username: '/>
          <TextInput style = {styles.inputView}value = {password} onChangeText={setPassword}
              placeholder='Password: '/>
          </View>
          
          <TouchableOpacity style={styles.btnPsw} >
              <Text style={styles.bluBtntext}>Forgot Password ?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop: 50, width: 340, height: 45, borderRadius: 8,
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

      </TouchableWithoutFeedback>
        // <View style = {{marginTop:30}}>
        //   <Logo style = {styles.logoStyle}/>
        //   <Text style = {styles.textTitleStyle}>Welcome To Augwa</Text>
        //   <View style = {{marginTop:37}}>
        //   <TextInput style = {styles.inputView}value = {domain} onChangeText={setDomain}
        //       placeholder='Domain: '/>
        //   <TextInput style = {styles.inputView}value = {userName} onChangeText={setUserName}
        //       placeholder='Username: '/>
        //   <TextInput style = {styles.inputView}value = {password} onChangeText={setPassword}
        //       placeholder='Password: '/>
        //   </View>
          
        //   <TouchableOpacity style={styles.btnPsw} >
        //       <Text style={styles.bluBtntext}>Forgot Password ?</Text>
        //   </TouchableOpacity>
        //   <TouchableOpacity style={{marginTop: 50, width: 340, height: 45, borderRadius: 8,
        //       alignSelf: "center", backgroundColor: "#2D4059", justifyContent: "center",
        //       alignItems: "center" }} >
        //       <Text style={{textAlign: "center", padding: "auto",
        //         fontSize: 23, color: '#ffffff'}}>SIGN IN</Text>
        //   </TouchableOpacity>
        //   <View style = {styles.signupView}>
        //     <Text style = {{fontSize: 17, color: '5F5F5F'}}>Don't have an account?</Text>
        //     <TouchableOpacity >
        //       <Text style={styles.bluBtntext}>  Sign up</Text>
        //     </TouchableOpacity>

        //   </View>
 
        // </View>
    )   
}

const styles = StyleSheet.create({ 

   logoStyle: {
    width:100,
    height: 100,
    alignSelf:'center',
    
   },
    viewStyle: {
      alignItems: 'stretch',
      justifyContent:'space-between',
      margin: 15,
      padding: 10},

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
      marginTop:5,
      alignSelf: 'center',
      borderColor: textInputBorderColor
  
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
    marginTop: 10,
    flexDirection: 'row',
    alignSelf:'center'
    
  }
  })
export default LogInScreen
