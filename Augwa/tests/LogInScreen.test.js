import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from "../screens/LogInScreen.js";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Mocking necessary hooks 
jest.mock('axios');
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
  }));
jest.mock('../assets/images/app_logo.svg', () => 'Logo');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'FontAwesome5');
jest.mock('../components/BiometricAuth', () => ({
  BiometricAuth: {
    checkBiometricSupport: jest.fn(),
    authenticateWithBiometric: jest.fn()
  }
}));

// Mock the Login component
jest.mock('../components/Login', () => ({
    login: jest.fn(),
  }));


describe('LoginScreen with Biometric', () => {
    let mockSetAuthToken;
    let mockSetUserName;
    let mockNavigate;

    beforeEach(()=> {
        mockSetAuthToken = jest.fn();
        mockSetUserName = jest.fn();
        mockNavigate = jest.fn();

        // Mock SecureStore functions
        SecureStore.getItemAsync.mockResolvedValue(null);
        SecureStore.setItemAsync.mockResolvedValue(null);
    });

    const renderComponent = () => {
        return render(
            <NavigationContainer>
                <AuthContext.Provider value={{ setAuthToken: mockSetAuthToken, setUserName: mockSetUserName}}>
                <LoginScreen navigation = {{ navigate: mockNavigate}} />
            </AuthContext.Provider>
            </NavigationContainer>
        )
    }
 
    // Checking all the fields are rendered
    it('renders LoginScreen successfully', () => {
        const { getByText, getByPlaceholderText } = renderComponent();
        expect(getByPlaceholderText('Username:')).toBeTruthy();
        expect(getByPlaceholderText('Password:')).toBeTruthy();
        expect(getByText('SIGN IN')).toBeTruthy();
        expect(getByText('Sign up')).toBeTruthy();
    });

    // Testing for missing blank fields
    it('shows an error when input fields are blank', async() => {
        const { getByText, getByPlaceholderText } = renderComponent();
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});

        // Test for empty username
        fireEvent.changeText(getByPlaceholderText('Username:'), '');
        fireEvent.changeText(getByPlaceholderText('Password:'), 'testPassword');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Please fill in all fields!');
        });

        // Test for emoty password
        fireEvent.changeText(getByPlaceholderText('Username:'), 'testUsername');
        fireEvent.changeText(getByPlaceholderText('Password:'), '');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Please fill in all fields!');
        });

        // Test for both fields empty
        fireEvent.changeText(getByPlaceholderText('Username:'), '');
        fireEvent.changeText(getByPlaceholderText('Password:'), '');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Please fill in all fields!');
        });
    });

    // testing for invalid credentials
    it('Shows an error when invalid credentials', async()=> {

        require('../components/Login').login.mockResolvedValueOnce({
            success: false,
            error: { code: 'INVALID_CREDENTIALS' },
        });

        const {getByText, getByPlaceholderText } = renderComponent();
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        axios.post.mockResolvedValueOnce({
            status: 401,
            data: { message: 'Invalid Username or Password'},
        });
        fireEvent.changeText(getByPlaceholderText('Username:'), 'wrongUser');
        fireEvent.changeText(getByPlaceholderText('Password:'), 'wrongPassword');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Incorrect username or password');
        });
    });

    // Testing successful login and navigating to dashboard
    it('Login successfully and navigate to DashBoard', async() => {
        require('../components/Login').login.mockResolvedValueOnce({
            success: true,
            data: { token: 'mockToken', user: { username: 'testUser' } },
        });

        const { getByText, getByPlaceholderText } = renderComponent();
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { token: 'mockToken', user: {username: 'testUser'}}
        });

        fireEvent.changeText(getByPlaceholderText('Username:'), 'testUser');
        fireEvent.changeText(getByPlaceholderText('Password:'), 'testPassword');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(()=> {

            expect(mockSetAuthToken).toHaveBeenCalledWith('mockToken');
            expect(mockSetUserName).toHaveBeenCalledWith('testUser');
            expect(mockNavigate).toHaveBeenCalledWith('dashboard');
        });
    });

    // Testing for successful Biometric Authentication
    it('should authenticate successfully with Biometric and navigate to DashBoard', async() => {
        // Assuming that biometric is enabled
        require('../components/BiometricAuth').BiometricAuth.checkBiometricSupport.mockResolvedValue(true);
        require('../components/BiometricAuth').BiometricAuth.authenticateWithBiometric.mockResolvedValueOnce({
            username: 'testUser',
            password: 'testPassword',
        });
        SecureStore.getItemAsync.mockResolvedValue('true');

        const { getByText, queryByText } = renderComponent();

        // Check for either Face ID or Fingerprint text based on the biometricType
        const biometricText = queryByText('Login with Face ID') || queryByText('Login with Fingerprint');
    
        if (biometricText) {
            // Simulate pressing the biometric login button
            fireEvent.press(biometricText);

            await waitFor(() => {
                expect(mockSetAuthToken).toHaveBeenCalledWith("mockToken");
                expect(mockSetUserName).toHaveBeenCalledWith('testUser');
                expect(mockNavigate).toHaveBeenCalledWith('dashboard');
            });
        } else {
            // Handle error if biometric text is not found
            console.error('Biometric login text not found.');
        }
    });


    // Testing for Network error
    it('Shows an error if there is network error', async() => {
        require('../components/Login').login.mockRejectedValueOnce(new Error('Network Error'));
        const { getByText, getByPlaceholderText } = renderComponent();
        
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

        fireEvent.changeText(getByPlaceholderText('Username:'), 'testUser');
        fireEvent.changeText(getByPlaceholderText('Password:'), 'testPassword');
        fireEvent.press(getByText('SIGN IN'));

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('A system error occurred, Restart the app');
        });
    });

    // Testing navigation to Sign up screen
    it('Should navigate to sign up screen when clicked', async() => {
        const { getByText } = renderComponent();
        const signUpBtn = getByText(' Sign up');

        fireEvent.press(signUpBtn);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('signup');
        });
    });
})