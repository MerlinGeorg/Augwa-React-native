import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { scaleSize, moderateScale } from '../utils/scaling';
import { iconColor, primaryColor } from "../assets/styles/color";
import { FontAwesome5 } from 'react-native-vector-icons';

const CustomModal = ({ visible, onClose, children, title, buttons, biometricType }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FontAwesome5
              name={biometricType === 'faceId' ? "smile-beam" : "fingerprint"}
              size={45}
              color={iconColor}
              style={styles.biometricIcon}
            />
          {title && <Text style={styles.modalTitle}>{title}</Text>}
          {children}
          <View style={styles.buttonsContainer}>
            {buttons && buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.modalButton, button.style]}
                onPress={button.onPress}
              >
                <Text style={styles.modalButtonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Align to bottom
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: scaleSize(20),
    borderRadius: scaleSize(10),
    width: '100%', // Take full width
    alignItems: 'center',
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: scaleSize(10),
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginTop: scaleSize(10),
  },
  modalButton: {
    backgroundColor: primaryColor,
    padding: scaleSize(10),
    borderRadius: scaleSize(8),
    marginBottom: scaleSize(10), // Add spacing between buttons
  },
  modalButtonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  modalCancelButton: {
      padding: scaleSize(10),
      borderRadius: scaleSize(10),
      width: "100%",
      alignItems: "center",
    },
    modalCancelButtonText: {
      color: "#555",
      fontSize: moderateScale(16),
    },
  biometricIcon: {
    marginBottom: scaleSize(20),
  },
});

export default CustomModal;