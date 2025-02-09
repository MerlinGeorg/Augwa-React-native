import React, { useState } from "react";
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
  buttonTextColor,
  errorGrey,
  errorRed,
  iconColor,
  primaryColor,
  successGreen,
  textInputBorderColor,
} from "../assets/styles/color";
import Register from "../components/Signup";
import { FontAwesome5 } from "react-native-vector-icons";
import LogoImage from "../components/LogoImage";
import Modalize from "react-native-modalize";
import { FaceIDAuth } from "../components/FaceIDAuth";

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
  // Track whether the user is focusing on the password field
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [faceIDVisible, setFaceIDVisible] = useState(true);

  // Username validation
  const usernameValidation = {
    length: userName.length >= 6 && userName.length <= 32,
    validChars: /^[a-zA-Z0-9]+$/.test(userName), // Ensure only letters and numbers
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

  const enableFaceID = async () => {
    try {
      const success = await FaceIDAuth.enableFaceID(userName, password);
      if (success) {
        Alert.alert("Success", "Face ID has been enabled successfully!");
        setFaceIDVisible(false);
      } else {
        Alert.alert("Error", "Failed to enable Face ID. Please try again.");
      }
    } catch (error) {
      console.error("Face ID setup error:", error);
      Alert.alert(
        "Error",
        "Could not enable Face ID. Please ensure it is set up on your device."
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
        Alert.alert("Success", "Account created successfully!");

        setFaceIDVisible(true);
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
        <Text style={styles.title}>Register to Augwa</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Username"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.userName && (
              <Text style={styles.errorText}>{errors.userName}</Text>
            )}
          </View>

          {/* <View style={styles.inputWithIcon}> */}
          <View style={styles.inputContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              style={styles.input}
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
                name={showPassword ? "eye" : "eye-slash"} // Toggle between eye and eye-slash
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Password Requirements */}

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

          <View style={styles.inputContainer}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <FontAwesome5
                name={showConfirmPassword ? "eye" : "eye-slash"} // Toggle between eye and eye-slash
                size={20}
                color={iconColor}
              />
            </TouchableOpacity>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Invite Code"
              style={styles.input}
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
              styles.signupButton,
              isLoading && styles.signupButtonDisabled,
            ]}
            disabled={isLoading}
          >
            <Text style={styles.signupText}>
              {isLoading ? "SIGNING UP..." : "SIGNUP"}
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => navigation.navigate("login")}
            style={styles.signupButton}
          >
            <Text style={styles.signupText}>LOGIN</Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>

      {/* Face ID Prompt Modal */}
      <Modal
        visible={faceIDVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFaceIDVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Face ID Icon */}
            <FontAwesome5
              name="smile-beam"
              size={45}
              color={iconColor}
              style={styles.faceIDIcon}
            />

            <Text style={styles.modalTitle}>Use Face ID?</Text>
            <Text style={styles.modalText}>
              Would you like to enable Face ID?
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={enableFaceID}>
              <Text style={styles.modalButtonText}>Yes, enable Face ID</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setFaceIDVisible(false)}
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
    marginTop: 30, // Adjust based on your design
    alignItems: "center", // Centers the logo horizontally
  },
  logoStyle: {
    width: 30,
    height: 30,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
    marginTop: 20,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: textInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
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
    color: errorGrey, // Default gray color for X
  },
  requirementText: {
    fontSize: 14,
  },
  requirementMet: {
    color: successGreen, // Green color for met requirements
  },
  requirementNotMet: {
    color: errorGrey, // Gray color for unmet requirements
  },
  errorText: {
    color: errorRed,
    fontSize: 12,
    marginBottom: 5,
  },
  signupButton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: primaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupText: {
    color: buttonTextColor,
    fontSize: 16,
    fontWeight: "600",
  },
  //   inputWithIcon: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     justifyContent: "space-between",
  //     marginBottom: 15,
  //   },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
  },

  // Modal Styles
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end", // Move the content to the bottom
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "100%", // Full width
    maxHeight: "50%", // Optional: Limit the height if needed
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
  faceIDIcon: {
    marginBottom: 20,
  },
});
