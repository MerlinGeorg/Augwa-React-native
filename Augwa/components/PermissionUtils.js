// import { Platform } from 'react-native';
// import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// export const requestLocationPermissions = async () => {
//   try {
//     let permissionStatus;
    
//     if (Platform.OS === 'ios') {
//       // Request iOS permissions
//       permissionStatus = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      
//       // If denied, try when in use as fallback
//       if (permissionStatus !== RESULTS.GRANTED) {
//         permissionStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//       }
//     } else {
//       // Request Android permissions
//       permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      
//       // For Android 10+ (API level 29+), request background location separately
//       if (permissionStatus === RESULTS.GRANTED && parseInt(Platform.Version, 10) >= 29) {
//         permissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
//       }
//     }
    
//     return permissionStatus === RESULTS.GRANTED;
//   } catch (error) {
//     console.error('Error requesting location permissions:', error);
//     return false;
//   }
// };