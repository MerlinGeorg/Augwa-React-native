import React, { useState, useEffect } from "react";
import {
 // TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
 // Alert,
  Modal,
} from "react-native";
import {
  errorGrey,
  errorRed,
  iconColor,
  successGreen,
} from "../assets/styles/color";
import Register from "../components/Signup";
import { FontAwesome5 } from "react-native-vector-icons";
import LogoImage from "../components/LogoImage";
import { BiometricAuth } from "../components/BiometricAuth";
import { sharedStyles } from "../assets/styles/SharedStyles";
import { scaleSize, moderateScale } from '../utils/scaling';
import CustomAlert from "../components/CustomAlert";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import CustomModal from "../components/CustomModal";
import { ScrollView } from "react-native-gesture-handler";

const PasswordRequirement = ({ met, text }) => (
  <View style={styles.requirementRow}>
    <Text style={[styles.requirementIcon]}>{met ? "✓" : "✕"}</Text>
    <Text
      style={[
        styles.requirementText,
        met ? styles.requirementMet : styles.requirementNotMet,
      ]}
    >
      {text}
    </Text>
  </View>
);

export default function SignupScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [biometricVisible, setBiometricVisible] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
 // const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const support = await BiometricAuth.checkBiometricSupport();
      if (support.supported) {
        setBiometricType(support.biometryType);
      } else {
        setBiometricVisible(false);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricVisible(false);
    }
  };

  // Username validation
  const usernameValidation = {
    length: userName.length >= 6 && userName.length <= 32,
    validChars: /^[a-zA-Z0-9]+$/.test(userName),
  };

  // Password validation checks
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    nonAlphanumeric: /[^a-zA-Z0-9]/.test(password),
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userName) newErrors.userName = "Username is required";
    if (!usernameValidation.length)
      newErrors.userName = "Username must be between 6 and 32 characters";
    if (!usernameValidation.validChars)
      newErrors.userName = "Username can only contain letters and numbers";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    if (!inviteCode) newErrors.inviteCode = "Invite Code is required";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!Object.values(validations).every(Boolean))
      newErrors.password = "Password does not meet requirements";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const enableBiometric = async () => {
    try {
      const success = await BiometricAuth.enableBiometric(userName, password);
      if (success) {
        
        setBiometricVisible(false);
        navigation.replace('biometrysuccess', {biometricType});
      } else {
        // Alert.alert("Error", "Failed to enable biometric authentication. Please try again.");
        setErrors({biometric: "Failed to enable biometric authentication. Please try again." })
      }
    } catch (error) {
      console.error("Biometric setup error:", error);
      setErrors({biometric: "Could not enable biometric authentication. Please ensure it is set up on your device."})
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const result = await Register.signup({
        username: userName,
        password: password,
        inviteCode: inviteCode,
      });

      if (result.success) {
      
       CustomAlert({
        title: "Success",
        message: "Account created successfully!",
        onOk: () => setBiometricVisible(true) // Set biometricVisible to true when OK is pressed
      });
        
      } else {
        setErrors({signup: result.error.message})
      }
    } catch (error) {
      console.log("signup error", error);
     setErrors({signup:"An unexpected error occurred. Please try again." })
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotNow = () => {
    setBiometricVisible(false);
    navigation.replace('login'); // Navigate to the Login screen
  };

  const passwordRequirementsMet = Object.values(validations).every(Boolean); //to display password requirements Only requirements when they are not met
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <LogoImage style={styles.logoStyle} />
        </View>
        <Text style={sharedStyles.title}>Register to Augwa</Text>

        <View style={styles.form}>
         
          <CustomInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
          />
           {errors.userName && (
            <Text style={styles.errorText}>{errors.userName}</Text>
          )}

        
          <CustomInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={true}
            autoCapitalize="none"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
           {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {passwordFocused && !passwordRequirementsMet && (
            <View style={styles.requirements}>
              <PasswordRequirement
                met={validations.length}
                text="At least 8 characters"
              />
              <PasswordRequirement
                met={validations.uppercase}
                text="At least one uppercase letter"
              />
              <PasswordRequirement
                met={validations.lowercase}
                text="At least one lowercase letter"
              />
              <PasswordRequirement
                met={validations.number}
                text="At least one number"
              />
              <PasswordRequirement
                met={validations.nonAlphanumeric}
                text="At least one non-alphanumeric character"
              />
            </View>
          )}

          <CustomInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry={true}
          />
{errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

         
          <CustomInput
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Invite Code"
          autoCapitalize="none"
          autoCorrect={false}
          />

{errors.inviteCode && (
              <Text style={styles.errorText}>{errors.inviteCode}</Text>
            )}
          
          <CustomButton 
          title={isLoading ? "SIGNING UP..." : "SIGNUP"}
          onPress={handleSignup}
          disabled={isLoading}
          />

            {errors.signup ? (
              <CustomAlert
                title="Error"
                message={errors.signup}
                onOk={() => setErrors({ ...errors, signup: null})}
               />
            ) : null}

            {errors.biometric ? (
              <CustomAlert
                title="Error"
                message={errors.biometric}
                onOk={()=>setErrors({...errors, biometric: null})}
              />
            ): null}

        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Biometric Authentication Modal */}
      <Modal
        visible={biometricVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBiometricVisible(false)}
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
              Use {biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}?
            </Text>
            <Text style={styles.modalText}>
              Would you like to enable {biometricType === 'faceId' ? 'Face ID' : 'fingerprint'} authentication?
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={enableBiometric}>
              <Text style={styles.modalButtonText}>
                Yes, enable {biometricType === 'faceId' ? 'Face ID' : 'fingerprint'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={handleNotNow}
            >
              <Text style={styles.modalCancelButtonText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
             {/* <CustomModal
          visible={biometricVisible}
          onClose={() => setBiometricVisible(false)}
          title={`Use ${biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}?`}
          buttons={[
            {
              text: `Yes, enable ${biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'}`,
              onPress: enableBiometric,
            },
            {
              text: 'Not now',
              onPress: handleNotNow,
              style: { backgroundColor: 'gray' },
            },
          ]}
        >
          <Text style={styles.modalText}>
            Would you like to enable {biometricType === 'faceId' ? 'Face ID' : 'fingerprint'} authentication?
          </Text>
        </CustomModal> */}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: scaleSize(20),
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start'
  },
  logoContainer: {
    marginTop: scaleSize(60),
    alignItems: "center",
  },
  logoStyle: {
    width: scaleSize(30),
    height: scaleSize(30),
    alignSelf: "center",
  },
  form: {
    width: "100%",
  },
  requirements: {
    marginBottom: scaleSize(15),
    marginTop: -scaleSize(10),
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleSize(4),
  },
  requirementIcon: {
    fontSize: moderateScale(14),
    marginRight: scaleSize(8),
    color: errorGrey,
  },
  requirementText: {
    fontSize: moderateScale(14),
  },
  requirementMet: {
    color: successGreen,
  },
  requirementNotMet: {
    color: errorGrey,
  },
  errorText: {
    color: errorRed,
    fontSize: moderateScale(12),
    marginBottom: scaleSize(5),
  },
  // eyeIcon: {
  //   position: "absolute",
  //   right: scaleSize(15),
  //   padding: scaleSize(10),
  // },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: scaleSize(20),
    borderRadius: scaleSize(10),
    alignItems: "center",
    width: "100%",
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    marginBottom: scaleSize(10),
  },
  modalText: {
    fontSize: moderateScale(16),
    marginBottom: scaleSize(20),
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2B3A55",
    padding: scaleSize(10),
    borderRadius: scaleSize(8),
    width: "100%",
    alignItems: "center",
    marginBottom: scaleSize(10),
  },
  modalButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  modalCancelButton: {
    padding: scaleSize(10),
    borderRadius: scaleSize(10),
    width: "100%",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#555",
    fontSize: moderateScale(16),
  },
  biometricIcon: {
    marginBottom: scaleSize(20),
  },
});