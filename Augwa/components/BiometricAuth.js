import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const BiometricAuth = {
  // Check biometric support and type
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

      const biometricsEnabled = await SecureStore.getItemAsync('biometrics_enabled');
      const hasStoredCredentials = await SecureStore.getItemAsync('user_credentials');

      return {
        supported: true,
        faceIdAvailable: hasFaceId,
        fingerprintAvailable: hasFingerprint,
        biometryType: hasFaceId ? 'FaceID' : hasFingerprint ? 'TouchID' : 'None',
        isEnabled: biometricsEnabled === 'true' && hasStoredCredentials !== null
      };
    } catch (error) {
      console.error('Biometric support check failed:', error);
      return {
        supported: false,
        error: error.message
      };
    }
  },

  // Store credentials securely
  storeCredentials: async (username, password) => {
    try {
      const credentials = JSON.stringify({
        username,
        password
      });

      await SecureStore.setItemAsync('user_credentials', credentials);
      await SecureStore.setItemAsync('biometrics_enabled', 'true');
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw error;
    }
  },

  // Enable biometric authentication
  enableBiometric: async (username, password) => {
    try {
      const biometricSupport = await BiometricAuth.checkBiometricSupport();

      if (!biometricSupport.supported) {
        throw new Error('Biometric authentication is not available on this device');
      }

      const promptMessage = Platform.select({
        ios: biometricSupport.faceIdAvailable ? 'Enable Face ID login' : 'Enable Touch ID login',
        android: 'Enable fingerprint login',
        default: 'Enable biometric login'
      });

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode'
      });

      if (result.success) {
        await BiometricAuth.storeCredentials(username, password);
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

      if (!biometricSupport.supported || !biometricSupport.isEnabled) {
        throw new Error('Biometric authentication is not available');
      }

      const biometricsEnabled = await SecureStore.getItemAsync('biometrics_enabled');
      if (!biometricsEnabled) {
        throw new Error('Biometric authentication not enabled');
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
        const credentialsJson = await SecureStore.getItemAsync('user_credentials');
        if (!credentialsJson) {
          throw new Error('No credentials stored');
        }
        const credentials = JSON.parse(credentialsJson);
        return {
          success: true,
          ...credentials
        };
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
      await SecureStore.deleteItemAsync('user_credentials');
      await SecureStore.deleteItemAsync('biometrics_enabled');
      return true;
    } catch (error) {
      console.error('Failed to remove biometric credentials:', error);
      throw error;
    }
  }
};