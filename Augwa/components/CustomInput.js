import React, {useState} from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { textInputBorderColor, iconColor } from "../assets/styles/color";
import { scaleSize, moderateScale } from '../utils/scaling'; // Import scaling functions
import { FontAwesome5 } from "react-native-vector-icons";


const CustomInput = ({ value, onChangeText, placeholder, 
    secureTextEntry, style, autocapitalize, keyboardType, onFocus, onBlur }) => {
    const [showPassword, setShowPassword] = useState(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={showPassword}
        autoCapitalize={autocapitalize}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {secureTextEntry && (
        <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setShowPassword(!showPassword)}
      >
        <FontAwesome5
          name={showPassword ? "eye-slash" : "eye"}
          size={20}
          color={iconColor}
        />
      </TouchableOpacity>
    )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: scaleSize(15),
    flexDirection: 'row', // Add this to align TextInput and icon horizontally
    alignItems: 'center',
    position: 'relative'
  },
  input: {
    flex: 1,
    width: '100%',
    height: scaleSize(50),
    borderWidth: 1,
    borderColor: textInputBorderColor,
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(15),
    backgroundColor: '#fff',
    fontSize: moderateScale(16),
  },
  eyeIcon: {
    padding: scaleSize(10),
    position: 'absolute',
    right: scaleSize(10),   // Adjust as needed
  },
});

export default CustomInput;
