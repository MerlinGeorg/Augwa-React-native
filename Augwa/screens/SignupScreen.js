import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [biometricVisible, setBiometricVisible] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const support = await BiometricAuth.checkBiometricSupport();
      if (support.supported) {
        setBiometricType(support.preferredMethod);
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
        // Alert.alert(
        //   "Success", 
        //   `${biometricType === 'faceId' ? 'Face ID' : 'Fingerprint'} has been enabled successfully!`
        // );
        setBiometricVisible(false);
        navigation.replace('biometrysuccess');
      } else {
        Alert.alert("Error", "Failed to enable biometric authentication. Please try again.");
      }
    } catch (error) {
      console.error("Biometric setup error:", error);
      Alert.alert(
        "Error",
        "Could not enable biometric authentication. Please ensure it is set up on your device."
      );
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
        Alert.alert("Success", "Account created successfully!",[{ onPress: () => setBiometricVisible(true)}]);

      } else {
        Alert.alert("Error", result.error.message);
      }
    } catch (error) {
      console.log("signup error", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <LogoImage style={styles.logoStyle} />
        </View>
        <Text style={sharedStyles.title}>Register to Augwa</Text>

        <View style={styles.form}>
          <View style={sharedStyles.inputContainer}>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Username"
              style={sharedStyles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.userName && (
              <Text style={styles.errorText}>{errors.userName}</Text>
            )}
          </View>

          <View style={sharedStyles.inputContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              style={sharedStyles.input}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome5
                name={showPassword ? "eye" : "eye-slash"}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {passwordFocused && (
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

          <View style={sharedStyles.inputContainer}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={sharedStyles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome5
                name={showConfirmPassword ? "eye" : "eye-slash"}
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <View style={sharedStyles.inputContainer}>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Invite Code"
              style={sharedStyles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.inviteCode && (
              <Text style={styles.errorText}>{errors.inviteCode}</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            style={[
              sharedStyles.button,
              isLoading && sharedStyles.buttonDisabled,
            ]}
            disabled={isLoading}
          >
            <Text style={sharedStyles.buttonText}>
              {isLoading ? "SIGNING UP..." : "SIGNUP"}
            </Text>
          </TouchableOpacity>
        </View>
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
              onPress={() => setBiometricVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  logoStyle: {
    width: 30,
    height: 30,
    alignSelf: "center",
  },
  form: {
    width: "100%",
  },
  requirements: {
    marginBottom: 15,
    marginTop: -10,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    color: errorGrey,
  },
  requirementText: {
    fontSize: 14,
  },
  requirementMet: {
    color: successGreen,
  },
  requirementNotMet: {
    color: errorGrey,
  },
  errorText: {
    color: errorRed,
    fontSize: 12,
    marginBottom: 5,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
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
    backgroundColor: "#2B3A55",
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
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#555",
    fontSize: 16,
  },
  biometricIcon: {
    marginBottom: 20,
  },
});