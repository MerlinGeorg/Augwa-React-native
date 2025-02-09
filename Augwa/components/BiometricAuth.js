import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

export const BiometricAuth = {
  // Check what type of biometric authentication is available
  checkBiometricSupport: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      console.log('Biometric hardware available:', compatible);

      if (!compatible) {
        return { 
          supported: false, 
          error: 'No biometric hardware available on this device.' 
        };
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('Biometrics enrolled:', enrolled);

      if (!enrolled) {
        return { 
          supported: false, 
          error: 'No biometrics have been enrolled on this device.' 
        };
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('Supported biometric types:', types);

      const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

      return {
        supported: true,
        faceIdAvailable: hasFaceId,
        fingerprintAvailable: hasFingerprint,
        preferredMethod: hasFaceId ? 'faceId' : hasFingerprint ? 'fingerprint' : null
      };
    } catch (error) {
      console.error('Biometric support check failed:', error);
      return { 
        supported: false, 
        error: error.message 
      };
    }
  },

  // Enable biometric authentication and store credentials
  enableBiometric: async (username, password) => {
    try {
      const biometricSupport = await BiometricAuth.checkBiometricSupport();

      if (!biometricSupport.supported) {
        throw new Error('Biometric authentication is not available on this device');
      }

      // Set appropriate prompt message based on available method
      const promptMessage = Platform.select({
        ios: biometricSupport.faceIdAvailable ? 'Enable Face ID login' : 'Enable Touch ID login',
        android: 'Enable fingerprint login',
        default: 'Enable biometric login'
      });

      // Authenticate with available biometric method
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false, // Allow fallback to device passcode
        fallbackLabel: 'Use passcode' // Label for fallback button
      });

      if (result.success) {
        // Store credentials in keychain
        await Keychain.setGenericPassword(username, password);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      throw error;
    }
  },

  // Authenticate using biometrics and retrieve credentials
  authenticateWithBiometric: async () => {
    try {
      const biometricSupport = await BiometricAuth.checkBiometricSupport();

      if (!biometricSupport.supported) {
        throw new Error('Biometric authentication is not available');
      }

      const promptMessage = Platform.select({
        ios: biometricSupport.faceIdAvailable ? 'Log in with Face ID' : 'Log in with Touch ID',
        android: 'Log in with fingerprint',
        default: 'Log in with biometrics'
      });

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode'
      });

      if (result.success) {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          return {
            success: true,
            username: credentials.username,
            password: credentials.password
          };
        }
        throw new Error('No credentials stored');
      }
      return { success: false };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  },

  // Remove stored biometric credentials
  removeBiometric: async () => {
    try {
      await Keychain.resetGenericPassword();
      return true;
    } catch (error) {
      console.error('Failed to remove biometric credentials:', error);
      throw error;
    }
  }
};