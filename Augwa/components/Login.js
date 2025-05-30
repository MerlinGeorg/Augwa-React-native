import axios from 'axios';
import { API_BASEPATH_DEV } from '@env';

// Error message constants
const ERROR_MESSAGES = {
    INVALID_INPUT: 'Invalid input data provided',
    USERNAME_EXISTS: 'Username already exists in the system',
    INVALID_INVITE: 'Invalid or expired invite code',
    SERVER_ERROR: 'An unexpected server error occurred',
    NETWORK_ERROR: 'Unable to reach the server. Please check your connection',
    UNKNOWN_ERROR: 'An unexpected error occurred'
};

class Login {
    static async login(credentials) {
        try {
            console.log("Trying to sign in...");
            console.log(credentials);
            const { domain, ...restCredentials } = credentials;
            const api = axios.create({
                baseURL: API_BASEPATH_DEV,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Domain': domain  // Ensure this header is correct
                }
            });
            const response = await api.post('/Auth', credentials); // Use POST instead of GET
            console.log("Sign in response received");
            console.log("Status code: ", response.status);
            console.log("Auth data: ", response.data);

            return {
                success: true,
                data: {
                    token: response.data.token,
                    user: response.data.user
                }
            };
        } catch (error) {
            console.error("Sign in error");
            console.error("Error details: ", error);
            if (error.response) {
                const { status, data } = error.response;
                console.log("Server responded with error:");
                console.log("Status:", status);
                console.log("Data on error:", data);

                switch (status) {
                    case 400:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Invalid username or password format',
                                code: 'INVALID_CREDENTIALS_FORMAT'
                            }
                        };
                    case 401:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Invalid username or password',
                                code: 'INVALID_CREDENTIALS'
                            }
                        };
                    case 403:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Account not verified',
                                code: 'ACCOUNT_UNVERIFIED'
                            }
                        };
                    case 404:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'User not found',
                                code: 'USER_NOT_FOUND'
                            }
                        };
                    default:
                        return {
                            success: false,
                            error: {
                                message: data.message || 'Authentication failed',
                                code: 'AUTHENTICATION_ERROR'
                            }
                        };
                }
            } else if (error.request) {
                console.log("No response received from server");
                return {
                    success: false,
                    error: {
                        message: 'Unable to reach server',
                        code: 'NETWORK_ERROR'
                    }
                };
            } else {
                console.log("Something else went wrong.");
                return {
                    success: false,
                    error: {
                        message: error.message || 'Signin process failed',
                        code: 'SIGNIN_ERROR'
                    }
                };
            }
        }
    }
}

export default Login;
