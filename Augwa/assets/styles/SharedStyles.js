
import { StyleSheet } from 'react-native';
import { primaryColor, buttonTextColor,textInputBorderColor } from "./color"

export const sharedStyles = StyleSheet.create({

  //main button
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
  },

  //input text box
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: textInputBorderColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  //main title
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#000",
    marginTop: 20,
  },
});
