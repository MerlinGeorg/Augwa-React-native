// import React from 'react';
// import { Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { scaleSize, moderateScale } from '../utils/scaling';

// const CustomModal = ({ visible, onClose, children, title, buttons }) => {
//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.modalContent}>
//           {title && <Text style={styles.modalTitle}>{title}</Text>}
//           {children}
//           <View style={styles.buttonsContainer}>
//             {buttons && buttons.map((button, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[styles.modalButton, button.style]}
//                 onPress={button.onPress}
//               >
//                 <Text style={styles.modalButtonText}>{button.text}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: scaleSize(20),
//     borderRadius: scaleSize(10),
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: 'bold',
//     marginBottom: scaleSize(10),
//     textAlign: 'center',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     marginTop: scaleSize(10),
//   },
//   modalButton: {
//     backgroundColor: '#2B3A55',
//     padding: scaleSize(10),
//     borderRadius: scaleSize(8),
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: moderateScale(16),
//     textAlign: 'center',
//   },
// });

// export default CustomModal;
