import React from 'react';
import { Alert } from 'react-native';

const CustomAlert = ({ title, message, onOk, onCancel }) => {
  const buttons = [];

  if (onOk) {
    buttons.push({ text: 'OK', onPress: onOk });
  }

  if (onCancel) {
    buttons.push({ text: 'Cancel', onPress: onCancel, style: 'cancel' });
  }

  Alert.alert(
    title,
    message,
    buttons,
    { cancelable: true } // Enable dismissing by tapping outside the alert
  );

  return null; // This component doesn't render anything
};

export default CustomAlert;
