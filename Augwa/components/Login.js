import axios from 'axios';
import { API_BASEPATH_DEV, API_BASEPATH_PROD, X_Domain } from '@env';

// Error message constants
const ERROR_MESSAGES = {
    INVALID_INPUT: 'Invalid input data provided',
    USERNAME_EXISTS: 'Username already exists in the system',
    INVALID_INVITE: 'Invalid or expired invite code',
    SERVER_ERROR: 'An unexpected server error occurred',
    NETWORK_ERROR: 'Unable to reach the server. Please check your connection',
    UNKNOWN_ERROR: 'An unexpected error occurred'
};
const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        // tells the server we're sending json file
        'Content-Type': 'application/json',
        // custom hearder
        'X-Domain': X_Domain
    }
});
// post the request to api and receive a token, store it
// using the AsyncStorage
class Login {
    static async login(credentials) {
        try {
            console.log("Trying to sign in...")
            console.log("Credentials being sent...", credentials)
            const response = await api.post('/Auth', credentials)
            console.log('Sign in response received')
            console.log("Status code: ", response.status)
            console.log("Auth data: ", response.data)
            return {
                success: true,
                data: {
                    token: response.data.token,
                    user: response.data.user
                }
            }
        } catch (error) {
            console.error("Sign in error")
            console.error("Error details: ", error)
            if (error.response) {
                const { status, data } = error.response;
                console.log("Server responded with error:")
                console.log("Status:", status)
                console.log("Data:", data)
                switch (status) {
                    case 400:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Invalid username or password format',
                                code: 'INVALID_CREDENTIALS_FORMAT'
                            }
                        }
                    case 401:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Invalid username or password',
                                code: 'INVALID_CREDENTIALS'
                            }
                        }
                    case 403:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Account not varified',
                                code: 'ACCOUNT_UNVARIED'
                            }
                        }
                    case 404:
                        return{
                            success: false,
                            error: {
                                message: data.message || 'User not found',
                                code: 'USER_NOT_FOUND'
                            }

                        }
                    default:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Authentication failed',
                                code: 'AUTHE TICATION_ERROR'
                            }
                        }
                }
            } else if (error.request) {
                // Request made but no response received
                console.log("No response received from server")
                return {
                    success: false,
                    error: {
                        message: 'Unable to reache server',
                        code: 'NETWORK_ERROR'
                    }
                }
            } else {
                // Something else went wrong
                console.log("Something else went wrong.")
                return {
                    success: false,
                    error: {
                        message: error.message || 'Signin process failed',
                        code: 'SIGNIN_ERROR'
                    }
                }
            }
        }
    }


}

export default Login;
