import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from "../screens/LogInScreen.js";
import { AuthContext, AuthProvider } from "../src/context/AuthContext";
import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Mocking necessary hooks 
jest.mock('axios');

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
  }));

describe('LoginScreen', () => {
    let mockSetAuthToken;
    let mockSetUserName;
    let mockNavigate;

    beforeEach(()=> {
        mockSetAuthToken = jest.fn();
        mockSetUserName = jest.fn();
        mockNavigate = jest.fn();
    });

    const renderComponent = () => {
        return render(
            <NavigationContainer>
                <AuthProvider>
                    <LoginScreen navigation = {{ navigate: mockNavigate }} />
                </AuthProvider>
            </NavigationContainer>
        )
    }
 
    // Checking all the fields are rendered
    it('renders LoginScreen successfully', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
            <AuthContext.Provider value={{ setAuthToken: mockSetAuthToken, setUserName: mockSetUserName}}>
                <LoginScreen navigation = {{ navigate: mockNavigate}} />
            </AuthContext.Provider>
            </NavigationContainer>
        );
        expect(getByPlaceholderText('Username:')).toBeTruthy();
        expect(getByPlaceholderText('Password:')).toBeTruthy();
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Sign up')).toBeTruthy();
    });

    // Testing successful login and navigating to dashboard
    // it('Login successfully and navigate to DashBoard', async() => {
    //     const { getByText, getByPlaceholderText } = renderComponent();
    //     axios.post.mockResolvedValueOnce({
    //         status: 200,
    //         data: { token: 'mockToken', user: {username: 'testUser'}}
    //     });

    //     fireEvent.changeText(getByPlaceholderText('Username:'), 'testUser');
    //     fireEvent.changeText(getByPlaceholderText('Password:'), 'testPassword');
    //     fireEvent.press(getByText('Sign In'));

    //     await waitFor(()=> {
    //         expect(mockSetAuthToken).toHaveBeenCalledWith('mockToken');
    //         expect(mockSetUserName).toHaveBeenCalledWith('testUser');
    //         expect(mockNavigate).toHaveBeenCalledWith('DashboardScreen');
    //     });
    // });


    // testing for invalid credentials
    // it('Shows an error when invalid credentials', async()=> {
    //     const {getByText, getByPlaceholderText } = renderComponent();
    //     axios.post.mockResolvedValueOnce({
    //         status: 401,
    //         data: { message: 'Invalid Username or Password'},
    //     });
    //     fireEvent.changeText(getByPlaceholderText('Username:'), 'wrongUser');
    //     fireEvent.changeText(getByPlaceholderText('Password:'), 'wrongPassword');
    //     fireEvent.press(getByText('Sign In'));

    //     await waitFor(() => {
    //         expect(getByText('Incorrect Username or password')).toBeTruthy();
    //     });
    // });

    // Testing for Network error
    // it('Shows an error if there is network error', async() => {
    //     const { getByText, getByPlaceholderText } = renderComponent();
    //     axios.post.mockResolvedValueOnce(new Error('Network Error'));

    //     fireEvent.changeText(getByPlaceholderText('Username:'), 'testUser');
    //     fireEvent.changeText(getByPlaceholderText('Password:'), 'testPassword');
    //     fireEvent.press(getByText('Sign In'));

    //     await waitFor(() => {
    //         expect(getByText('Unable to reach server')).toBeTruthy();
    //     });
    // });

    // Testing navigation to Sign up screen
    // it('Should navigate to sign up screen when clicked', async() => {
    //     const { getByText } = renderComponent();
    //     const signUpBtn = getByText('Sign Up');

    //     await waitFor(() => {
    //         expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    //     });
    // });
})