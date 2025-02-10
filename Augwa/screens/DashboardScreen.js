import React, { useState } from 'react';
import {
  TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, Text, TouchableOpacity,
  alert, SafeAreaView
} from 'react-native';
import Logo from '../assets/images/app_logo.svg'
import { ScrollView } from 'react-native-gesture-handler';
import {
  buttonTextColor, errorGrey,
  errorRed, primaryColor, successGreen,
  textInputBorderColor, augwaBlue, dashboardArea,
} from "../assets/styles/color";
import Message from'../components/Message'
import BellIcon from '../components/BellIcon'
const DashboardScreen = (props) => {
  const [username, setUsername] = useState('')

  return (
    <View style={styles.viewStyle}>
      {/* view for the top blue part */}
      <View style={styles.greetingArea}>
        <Text style={styles.greetings}>Welcome, </Text>
        <View style = {styles.iconSection}>
          <TouchableOpacity>
            <Message />
          </TouchableOpacity>
          <TouchableOpacity style= {{marginLeft: 20}}>
            <BellIcon />
          </TouchableOpacity>
        </View>
      </View>
      {/* end of information area */}
      {/* display username */}
      <Text style = {styles.usernameStyle}>Display {username} here !</Text>
      {/* beginning of the dashboard view */}
      <View style = {styles.dashboardAreaStyle}>
        <View style = {{marginLeft: 5,flexDirection: 'row', marginTop: 20}}>
          <Text style = {styles.sectionTitle}>Current Job</Text>
          <Text style = {styles.timeTitle}>Job Time</Text>
        </View>
 

      </View>
      {/* end f the dashboard view */}

    </View>
  )
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    backgroundColor: augwaBlue,
  },
  greetingArea: {
    flexDirection: 'row'
  },
  iconSection: {
    marginLeft: 150,
    marginTop: 20,
    flexDirection: "row"
  },
  greetings: {
    marginTop: 15,
    marginStart: 10,
    fontSize: 33,
    color: '#fff'

  },
  usernameStyle: {
    fontSize: 33,
    fontWeight: "500",
    marginTop: 10,
    marginStart: 10,
    color: '#fff'
   
  },
  dashboardAreaStyle: {
    marginTop: 20,
    flex: 1,
    backgroundColor: dashboardArea,
    borderRadius: 30,
    padding: "auto"
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000'

    
  },
  timeTitle: {
    fontSize: 12,
    color: '#000'
    
  },
  jobDescribtionStyle: {
    backgroundColor: "#fff",
    width: "40%", 
    height:"30%"

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
export default DashboardScreen
{/* <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={{ marginTop: 30 }}>
          <Logo style={styles.logoStyle} />
          <Text style={styles.textTitleStyle}>Welcome To Augwa</Text>
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
          <TouchableOpacity >
            <Text style={styles.bluBtntext}>  Sign up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView> */}
