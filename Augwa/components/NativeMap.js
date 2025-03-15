//open Map in an external map app
import { Platform, Linking, Alert } from 'react-native';

/**
 * Opens the device's map application with directions to the destination
 * 
 * @param {Object} destination - Destination coordinates and address information
 * @param {number} destination.latitude - Destination latitude
 * @param {number} destination.longitude - Destination longitude 
 * @param {string} destination.address - Optional destination address as a string
 * @param {string} mode - Travel mode: 'driving', 'walking', 'bicycling', 'transit'
 */
export const openMapsWithDirections = (destination, mode = 'driving') => {
  const { latitude, longitude, address } = destination;

  if(!latitude || !longitude) {
    Alert.alert("Error", "Location coordinates are missing");
    return;
  }

  const encodedAddress = encodeURIComponent(address || latitude, longitude)

  const url = Platform.select({
    //manual navigation
    // ios: `maps:?daddr=${latitude},${longitude}&dirflag=${getModeParamForAppleMaps(mode)}`,
    // android: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&mode=${getModeParamForAppleMaps(mode)}`

    //direct navigation
    ios: `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=${getModeParamForAppleMaps(mode)}`,
    android: `google.navigation:q=${encodedAddress}&mode=${getModeParamForGoogleMaps(mode)}`
  });

  // Check if the device can handle the deep link
  Linking.canOpenURL(url).then((supported)=> {
    if(supported) {
      return Linking.openURL(url);
    } else {
      // Fallback to web URL if deep links not supported
      const webUrl  = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=${getModeParamForGoogleMaps(mode)}`;
      return Linking.openURL(webUrl);
    }
  }).catch((err) => {
    Alert.alert('Error', 'Could not open maps application. Please make sure you have a maps app installed.');
    console.error('An error occured', err);
  });
};

// Helper function to convert mode to Apple Maps format
const getModeParamForAppleMaps = (mode) => {
  switch(mode) {
    case 'driving':
      return 'd';
    case 'walking':
      return 'w';
    case 'transit':
      return 'r';
    default:
      return 'd'; // Default to driving
  }
}

// Helper function to convert mode to Google Maps format
const getModeParamForGoogleMaps = (mode) => {
  switch(mode) {
    case 'driving':
      return 'driving';
    case 'walking':
      return 'walking';
    case 'bicycling':
      return 'bicycling';
    case 'transit':
      return 'transit';
    default:
      return 'driving';
  }
}

