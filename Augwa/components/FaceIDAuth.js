import * as LocalAuthentication from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';

export const FaceIDAuth = {
  // Check if device supports biometric authentication
  checkBiometricSupport: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      console.log('Biometric hardware available:', compatible);
  
      if (!compatible) {
        return { supported: false, error: 'No biometric hardware available on this device.' };
      }
  
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('Biometrics enrolled:', enrolled);
  
      if (!enrolled) {
        return { supported: false, error: 'No biometrics have been enrolled on this device.' };
      }
  
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('Supported biometric types:', types);
  
      const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      console.log('Face ID supported:', hasFaceId);
  
      if (hasFaceId) {
        return { supported: true, faceIdAvailable: true };
      } else {
        return { supported: true, faceIdAvailable: false, error: 'Face ID is not supported on this device.' };
      }
  
    } catch (error) {
      console.error('Biometric support check failed:', error);
      return { supported: false, error: error.message }; // Include the actual error message
    }
  },

  // Enable Face ID and store credentials
  enableFaceID: async (username, password) => {
    try {
      const { supported, faceIdAvailable } = await FaceIDAuth.checkBiometricSupport();

      if (!supported || !faceIdAvailable) {
        throw new Error('Face ID is not available on this device');
      }

      // Authenticate with Face ID
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Face ID login',
        disableDeviceFallback: true, // Disable fallback to other methods
        authenticationType: LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      });

      if (result.success) {
        // Store credentials in keychain
        await Keychain.setGenericPassword(username, password);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Face ID setup failed:', error);
      throw error;
    }
  },

  // Authenticate using Face ID and retrieve credentials
  authenticateWithFaceID: async () => {
    try {
      const { supported, faceIdAvailable } = await FaceIDAuth.checkBiometricSupport();

      if (!supported || !faceIdAvailable) {
        throw new Error('Face ID is not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with Face ID',
        disableDeviceFallback: true, // Disable fallback to other methods
        authenticationType: LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
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
      console.error('Face ID authentication failed:', error);
      throw error;
    }
  },

  // Remove stored Face ID credentials
  removeFaceID: async () => {
    try {
      await Keychain.resetGenericPassword();
      return true;
    } catch (error) {
      console.error('Failed to remove Face ID credentials:', error);
      throw error;
    }
  }
};
