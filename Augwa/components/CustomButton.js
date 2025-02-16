import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { primaryColor, buttonTextColor } from "../assets/styles/color";

const CustomButton = ({ title, onPress, disabled, style }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
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
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: buttonTextColor,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
});

export default CustomButton;