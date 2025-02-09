import React, { useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Keychain from "react-native-keychain";

const FaceIDAuth = ({ onSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticateWithFaceID = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Face ID not supported", "Please set up Face ID on your device.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with Face ID",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        setIsAuthenticated(true);
        onSuccess();
      } else {
        Alert.alert("Authentication Failed", "Please try again.");
      }
    } catch (error) {
      console.error("Face ID authentication error:", error);
    }
  };

  //Store Credentials Securely
  const storeCredentials = async (username, token) => {
    await Keychain.setGenericPassword(username, token);
  };

  //Retrieve Stored Token After Face ID Auth
  const getStoredCredentials = async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials.password; // This is the stored token
    }
    return null;
  };

  return (
    <View>
      <Text>{isAuthenticated ? "Authenticated" : "Please Authenticate"}</Text>
      <Button title="Login with Face ID" onPress={authenticateWithFaceID} />
    </View>
  );
};

export default FaceIDAuth;