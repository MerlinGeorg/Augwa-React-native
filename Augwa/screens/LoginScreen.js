import React, { useState, useEffect } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { useContext } from 'react';
import {
  TouchableWithoutFeedback, View, StyleSheet, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, Text, TouchableOpacity,
  Alert, SafeAreaView,
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
import { augwaBlue } from '../assets/styles/color';

const LoginScreen = (props) => {
  const { setAuthToken, setUserName, setDomain } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domain, setDomainInput] = useState('');
  const [userName, setUserNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [biometricType, setBiometricType] = useState(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const support = await BiometricAuth.checkBiometricSupport();
      if (support.supported) {
        setBiometricType(support.biometryType);
        // Change this line to use the correct key
        const hasBiometricEnabled = await SecureStore.getItemAsync('biometrics_enabled');
        setIsBiometricAvailable(!!hasBiometricEnabled);
        console.log("isBiometricAvailable:", !!hasBiometricEnabled);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const credentials = await BiometricAuth.authenticateWithBiometric();
      if (credentials) {
      
        const result = await Login.login({
          domain: credentials.domain,
          username: credentials.username,
          password: credentials.password
        });

        if (result.success) {
          await SecureStore.setItemAsync('authToken', result.data.token);
          console.log(`LoginScreen domain: ${domain}`);
          setAuthToken(result.data.token);
          setDomain(domain);
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

  const handleLogin = async () => {
    const credentials = {
      domain: domain,
      username: userName,
      password: password
    };

    try {
      if (!credentials.domain || !credentials.username || !credentials.password) {
        Alert.alert("Please fill in all fields!");
        return;
      }

      const result = await Login.login(credentials);
      if (result.success) {
        await SecureStore.setItemAsync('authToken', result.data.token);
        setAuthToken(result.data.token);
        setUserName(userName)
        setDomain(domain);
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
    } catch (error) {
      console.error('System error:', error);
      Alert.alert("A system error occurred, Restart the app");
    }
  };

  const jumpToSignUp = () => {
    props.navigation.navigate("signup");
  };

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
            <View style={{ backgroundColor: augwaBlue,  }}>
              <Logo style={styles.logoStyle} />
              <Text style={styles.textTitleStyle}>Welcome To Augwa</Text>
            </View>

            <View style={{ marginTop: 20 }}>
              <TextInput
                style={styles.inputView}
                value={domain}
                onChangeText={setDomainInput}
                placeholder='Domain: '
                placeholderTextColor={textInputBorderColor}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
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

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.signInButton}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            {isBiometricAvailable && (
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
                  SignIn with {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.signupView}>
              <Text style={{ fontSize: 17, color: '#5f5f5f' }}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={jumpToSignUp}>
                <Text style={styles.bluBtntext}>  Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  logoStyle: {
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginTop: 40
  },
  viewStyle: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textTitleStyle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
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
    backgroundColor: '#f5f5f5',
    color: '#333',
    borderColor: textInputBorderColor,
    paddingHorizontal: 15,
  },
  btnPsw: {
    marginLeft: 200,
    marginTop: 12,
    marginBottom: 12
  },
  bluBtntext: {
    fontSize: 17,
    color: '#177de1',
  },
  signupView: {
     marginTop: 10,
    flexDirection: 'row',
    alignSelf: 'center'
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    marginHorizontal: 20,
    borderRadius: 8,
    borderColor: augwaBlue,
    borderWidth: 1,
    marginTop: 10,
    
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  signInButton: {
    width: 340,
    height: 45,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: augwaBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  signInButtonText: {
    textAlign: "center",
    fontSize: 23,
    color: '#fff',
  },
});

export default LoginScreen;