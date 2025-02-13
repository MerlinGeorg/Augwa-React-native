
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Logo from '../assets/images/app_logo.svg';

const LogoImage = ({ style }) => {
    return (
       
            <Logo style={[styles.logo, style]} />
        
    );
}

const styles = StyleSheet.create({
    // logoContainer: {
    //     marginTop: 30, // Adjust based on your design
    //     alignItems: 'center', // Centers the logo horizontally
    // },
    logo: {
        width: '100%', // Adjust as needed
        height: '100%', // Adjust as needed
      },
});

export default LogoImage;
