import React, { useState, useEffect } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { useContext } from 'react';
import {
  TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, Text, TouchableOpacity,
  Alert, SafeAreaView, Modal
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { FontAwesome5 } from "react-native-vector-icons";
import sharedStyleSheet from "../assets/styles/SharedStyles";
import Login from "../components/Login";
import Logo from '../assets/images/app_logo.svg';
import { ScrollView } from 'react-native-gesture-handler';
import { buttonTextColor, errorGrey, errorRed, primaryColor, successGreen, textInputBorderColor, iconColor } from "../assets/styles/color";
import { useNavigation } from '@react-navigation/native';
import { BiometricAuth } from "../components/BiometricAuth";

const LoginScreen = (props) => {
  const {setAuthToken} = useContext(AuthContext);
  const {setUserName} = useContext(AuthContext) // newly added for username
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [biometricType, setBiometricType] = useState(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const navigation = useNavigation();


  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const support = await BiometricAuth.checkBiometricSupport();
      if (support.supported) {
        setBiometricType(support.biometryType);
        setIsBiometricAvailable(support.isEnabled);
        console.log("isBiometricAvailable:", support.isEnabled);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const support = await BiometricAuth.checkBiometricSupport();
      
      // If biometrics is supported but not enabled, show setup modal
      if (support.supported && !support.isEnabled) {
        setShowBiometricSetup(true);
        return;
      }
      const credentials = await BiometricAuth.authenticateWithBiometric();
      if (credentials && credentials.success) {
        // Use the stored credentials to login
        const result = await Login.login({
          username: credentials.username,
          password: credentials.password
        });

        if (result.success) {
          await SecureStore.setItemAsync('authToken', result.data.token);
          setAuthToken(result.data.token);
          Alert.alert('Success', 'You have successfully loggedin.');
          props.navigation.navigate('dashboard');
        } else {
          Alert.alert('Error', 'Biometric authentication failed. Please login with your credentials.');
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric authentication failed. Please try again or use your credentials.');
    }
  };

  const enableBiometric = async () => {
    try {
      // First verify credentials before enabling biometric
      const result = await Login.login({
        username: userName,
        password: password
      });

      if (result.success) {
        const success = await BiometricAuth.enableBiometric(userName, password);
        if (success) {
          setShowBiometricSetup(false);
          setIsBiometricAvailable(true);
          Alert.alert('Success', 'Biometric authentication has been enabled.');
        } else {
          Alert.alert('Error', 'Failed to enable biometric authentication. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Please enter valid credentials before enabling biometric authentication.');
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      Alert.alert('Error', 'Could not enable biometric authentication. Please ensure it is set up on your device.');
    }
  };

  const handleLogin = async() => {
    const credentials = {
      username: userName,
      password: password
    };
    
    try {
      if (!credentials.username || !credentials.password) {
        Alert.alert("Please fill in all fields!");
        return;
      }
      
      const result = await Login.login(credentials);
      if(result.success) {
        await SecureStore.setItemAsync('authToken', result.data.token);
        setAuthToken(result.data.token);
        setUserName(userName)
        Alert.alert('Success', 'You have successfully loggedin.');
        props.navigation.navigate('dashboard');
      } else {
        switch (result.error.code) {
          case 'INVALID_CREDENTIALS':
            Alert.alert('Incorrect username or password');
            break;
          case 'ACCOUNT_UNVARIED':
            Alert.alert('Please verify your account');
            break;
          case 'NETWORK_ERROR':
            Alert.alert('Unable to connect to server, please check your Internet connection');
            break;
          default:
            Alert.alert('Login failed, please try again');
        }
      }
    } catch(error) {
      console.error('System error:', error);
      Alert.alert("A system error occurred, Restart the app");
    }
  };

  const jumpToSignUp = () => {
    props.navigation.navigate("signup");
  };

  // const clearAllCredentials = async () => {
  //   try {
  //     await SecureStore.deleteItemAsync('user_credentials');
  //     await SecureStore.deleteItemAsync('biometrics_enabled');
  //     await SecureStore.deleteItemAsync('authToken');
  //     // Force a re-check of biometric status
  //     checkBiometricSupport();
  //     Alert.alert('Success', 'All credentials cleared');
  //   } catch (error) {
  //     console.error('Error clearing credentials:', error);
  //     Alert.alert('Error', 'Failed to clear credentials');
  //   }
  // };
  return (
    <SafeAreaView style={styles.viewStyle}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

            {/* {isBiometricAvailable && ( */}
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <FontAwesome5
                  name={biometricType === 'faceId' ? "face-recognition" : "fingerprint"}
                  size={24}
                  color={iconColor}
                />
                <Text style={styles.biometricText}>
                  Login with {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}
                </Text>
              </TouchableOpacity>
            {/* )} */}

            <View style={{marginTop: 20}}>
              <TextInput
                style={styles.inputView}
                value={userName}
                onChangeText={setUserNameInput}
                placeholder='Username: ' 
                placeholderTextColor={textInputBorderColor}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TextInput
                style={styles.inputView}
                value={password}
                onChangeText={setPassword}
                placeholder='Password: '
                placeholderTextColor={textInputBorderColor}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity style={styles.btnPsw}>
              <Text style={styles.bluBtntext}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.signInButton}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupView}>
              <Text style={{ fontSize: 17, color: '#5F5F5F' }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={jumpToSignUp}>
                <Text style={styles.bluBtntext}>  Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

       {/* Biometric Setup Modal */}
       <Modal
        visible={showBiometricSetup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBiometricSetup(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FontAwesome5
              name={biometricType === 'faceId' ? "smile-beam" : "fingerprint"}
              size={45}
              color={iconColor}
              style={styles.biometricIcon}
            />

            <Text style={styles.modalTitle}>
              Enable {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}?
            </Text>
            <Text style={styles.modalText}>
              Would you like to enable {biometricType === 'faceId' ? 'Face ID' : 'fingerprint'} authentication for faster login?
            </Text>

            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={enableBiometric}
            >
              <Text style={styles.modalButtonText}>
                Yes, enable {biometricType === 'faceId' ? 'Face ID' : 'fingerprint'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowBiometricSetup(false)}
            >
              <Text style={styles.modalCancelButtonText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {__DEV__ && (
  <TouchableOpacity 
    style={[styles.signInButton, { marginTop: 10, backgroundColor: 'red' }]}
    onPress={BiometricAuth.removeBiometric}
  >
    <Text style={styles.signInButtonText}>Reset Biometric (Dev Only)</Text>
  </TouchableOpacity>
)}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
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
  btnPsw: {
    marginLeft: 240,
    marginTop: 12,
  },
  bluBtntext: {
    fontSize: 17,
    color: '#177de1',
  },
  signupView: {
    marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginTop: 10,
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  signInButton: {
    marginTop: 50,
    width: 340,
    height: 45,
    borderRadius: 8,
    alignSelf: "center",
    backgroundColor: "#2D4059",
    justifyContent: "center",
    alignItems: "center",
  },
  signInButtonText: {
    textAlign: "center",
    fontSize: 23,
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2D4059",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#555",
    fontSize: 16,
  },
  biometricIcon: {
    marginBottom: 20,
  }
});

export default LoginScreen;