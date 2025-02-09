import React, { useState } from 'react';
import {
  TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, Text, TouchableOpacity,
  alert, SafeAreaView
} from 'react-native';
import Logo from '../assets/images/app_logo.svg'
import { ScrollView } from 'react-native-gesture-handler';
import { buttonTextColor, errorGrey, errorRed, primaryColor, successGreen, textInputBorderColor } from "../assets/styles/color";

const DashboardScreen = (props) => {
  
  return (
    <SafeAreaView style = {styles.viewStyle}>
      <KeyboardAvoidingView
      style={{ flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView 
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

        </ScrollView>

        
        
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

    </SafeAreaView>
    
  )
}

const styles = StyleSheet.create({
  scrollContent:{
    flexGrow: 1,

  },

  logoStyle: {
    width: 100,
    height: 100,
    alignSelf: 'center',

  },
  viewStyle: {
    flex: 1,
    backgroundColor: "#fff",
  },

  textTitleStyle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
    marginTop: 20,
  },
  inputView: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    marginTop: 15,
    alignSelf: 'center',
    borderColor: textInputBorderColor,
    paddingHorizontal: 15,

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
export default DashboardScreen
