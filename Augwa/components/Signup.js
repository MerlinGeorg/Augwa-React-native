import axios from 'axios';
import { API_BASEPATH_DEV, x_Domain } from '@env';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASEPATH_DEV,
  headers: {
    'Content-Type': 'application/json',
    'X-Domain': x_Domain
  }
});

class Register {
  // Register new user
  static async signup(userData) {
    try {
      console.log("Trying to signup...");
      console.log("User data posting:", userData);
      
      const response = await api.post('/Account/Register', userData);

      console.log("API response received:");
      console.log("Status:", response.status);
      console.log("Data from backend:", response.data);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Backend signup error caught:");
      console.error("Error object:", error);

      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        console.log("Server responded with error:");
        console.log("Status:", status);
        console.log("Data:", data);

        switch (status) {
          case 400:
            return {
              success: false,
              error: {
                message: data.message || 'Invalid input data',
                code: 'INVALID_INPUT'
              }
            };
          case 409:
            return {
              success: false,
              error: {
                message: data.message || 'Username already exists',
                code: 'USERNAME_EXISTS'
              }
            };
          case 422:
            return {
              success: false,
              error: {
                message: data.message || 'Invalid invite code',
                code: 'INVALID_INVITE'
              }
            };
          default:
            return {
              success: false,
              error: {
                message: data.message || 'Something went wrong',
                code: 'SERVER_ERROR'
              }
            };
        }
      } else if (error.request) {
        // Request made but no response received
        console.log("Request made but no response received.");
        return {
          success: false,
          error: {
            message: 'No response from server. Please check your internet connection.',
            code: 'NETWORK_ERROR'
          }
        };
      } else {
        // Something else went wrong
        console.log("Something else went wrong.");
        return {
          success: false,
          error: {
            message: error.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
          }
        };
      }
    }
  }

  // Helper method to handle errors (not used in this context)
  static handleError(error) {
    console.log("Backend error:", error);
    // This method is not used in the signup function but can be useful elsewhere
  }
}

export default Register;
