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


describe('LoginScreen', () => {
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