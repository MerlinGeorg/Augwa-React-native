import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from "../screens/SignupScreen";
import { TextInput, View, Text } from "react-native-gesture-handler";

jest.mock('../components/BiometricAuth', () => ({
    BiometricAuth: {
      checkBiometricSupport: jest.fn(),
      authenticateWithBiometric: jest.fn(),
      enableBiometric:jest.fn()
    }
  }));

  // Mock the LogoImage component
jest.mock('../components/LogoImage', () => 'SvgMock');

  jest.mock('../components/Signup', () => ({
    __esModule: true,
    default: {
      signup: jest.fn()
    }
  }));

jest.mock('../components/CustomInput', () => {
    return function MockCustomInput({ placeholder, onChangeText, value, secureTextEntry }) {
      return (
        <input
          placeholder={placeholder}
          onChange={(e) => onChangeText(e.target.value)}
          value={value}
          type={secureTextEntry ? 'password' : 'text'}
          testID={`input-${placeholder}`}
        />
      );
    };
  });

  // Mock the CustomAlert component
jest.mock('../components/CustomAlert', () => {

    const { View, Text } = require('react-native');

    return jest.fn(({ title, message, onOk }) => (
      <View testID="custom-alert">
        <Text testID="alert-title">{title}</Text>
        <Text testID="alert-message">{message}</Text>
        <View testID="alert-ok-button" onPress={onOk}>
          <Text>OK</Text>
        </View>
      </View>
    ));
  });


// Mock the CustomModal component
jest.mock('../components/CustomModal', () => {

    const { View, Text } = require('react-native');
    return jest.fn(({ visible, children, title, buttons }) => (
      visible ? (
        <View testID="custom-modal">
          <Text testID="modal-title">{title}</Text>
          {children}
          {buttons.map((button, index) => (
            <View 
              key={index} 
              testID={`modal-button-${index}`} 
              onPress={button.onPress}
            >
              <Text>{button.text}</Text>
            </View>
          ))}
        </View>
      ) : null
    ));
  });


describe('Signup screen with biometrics', () => {
    let mockNavigate;
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate = { replace: jest.fn() };
        // Mock biometric support check
        const BiometricAuth = require('../components/BiometricAuth').BiometricAuth;
        BiometricAuth.checkBiometricSupport.mockResolvedValue({
          supported: true,
          biometryType: 'fingerprint'
        });
    });

    // Checking if all the fields are rendered correctly
    it('All fields are rendered successfully', () => {
        const { getByText, getByTestId } = render(<SignupScreen />);

        expect(getByTestId('input-Username')).toBeTruthy();
        expect(getByTestId('input-Password')).toBeTruthy();
        expect(getByTestId('input-Confirm Password')).toBeTruthy();
        expect(getByTestId('input-Invite Code')).toBeTruthy();
        expect(getByText('SIGNUP')).toBeTruthy();
    });
    
    // Testing for missing fields
    it('shows validation error for input fields', async() => {
        const { getByText, getByTestId } = render(<SignupScreen />)

        fireEvent.changeText(getByTestId('input-Username'), '');
        fireEvent.changeText(getByTestId('input-Password'), '');
        fireEvent.changeText(getByTestId('input-Confirm Password'), '');
        fireEvent.changeText(getByTestId('input-Invite Code'), '');
        fireEvent.press(getByText('SIGNUP'));

        await waitFor(() => {
            expect(getByText('Username can only contain letters and numbers')).toBeTruthy();
            expect(getByText('Password does not meet requirements')).toBeTruthy();
            expect(getByText('Confirm Password is required')).toBeTruthy();
            expect(getByText('Invite Code is required')).toBeTruthy();
        });
    });

    // Testing validation for username field
    it('shows an error if username is not valid', async() => {
        const { getByTestId, getByText } = render(<SignupScreen />)

        fireEvent.changeText(getByTestId('input-Username'), 'user@name')
        fireEvent.press(getByText("SIGNUP"));

        await waitFor(() => {
            expect(getByText('Username can only contain letters and numbers')).toBeTruthy();
        });
    });

    // Testing validation for password field
    it('shows an error for password requirements', async() => {
        const { getByText, getByTestId } = render(<SignupScreen />)
        const passwordInput = getByTestId('input-Password');

        fireEvent.changeText(passwordInput, 'weak')
        fireEvent(passwordInput, 'onFocus');

        await waitFor(() => {
            expect(getByText('At least 8 characters')).toBeTruthy();
            expect(getByText('At least one uppercase letter')).toBeTruthy();
            expect(getByText('At least one number')).toBeTruthy();
            expect(getByText('At least one non-alphanumeric character')).toBeTruthy();
        });
    });

    // Testing for confirming matching passwords
    it('validating matching passwords', async() => {
        const { getByText, getByTestId } = render(<SignupScreen />)

        fireEvent.changeText(getByTestId('input-Password'), 'validUser12')
        fireEvent.changeText(getByTestId('input-Confirm Password'), 'validUser123')
        fireEvent.press(getByText("SIGNUP"))

        await waitFor(() => {
            expect(getByText('Passwords do not match')).toBeTruthy();
        });
    });
  });
