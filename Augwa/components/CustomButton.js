import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { primaryColor, buttonTextColor } from "../assets/styles/color"

const CustomButton = ({ title, onPress, disabled, style }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: buttonTextColor,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
});

export default CustomButton;
