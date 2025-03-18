
import { StyleSheet } from 'react-native';
import { primaryColor, buttonTextColor,textInputBorderColor } from "./color"
import { scaleSize, moderateScale } from '../../utils/scaling';

export const sharedStyles = StyleSheet.create({

  //main button
  button: {
    width: '100%',
    height: scaleSize(50),
    borderRadius: scaleSize(8),
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaleSize(10),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: buttonTextColor,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  // //input text box
  // inputContainer: {
  //   marginBottom: scaleSize(15),
  // },
  // input: {
  //   width: '100%',
  //   height: scaleSize(50),
  //   borderWidth: 1,
  //   borderColor: textInputBorderColor,
  //   borderRadius: scaleSize(8),
  //   paddingHorizontal: scaleSize(15),
  //   backgroundColor: '#fff',
  //   fontSize: moderateScale(16),
  // },

  //main title
  title: {
    fontSize: moderateScale(24),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: scaleSize(20),
    color: "#fff",
    marginTop: scaleSize(20),
  },
});
