// components/GeofencingComponent.js
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';

const GEOFENCING_TASK = 'geofencing-task';

// Define the background task
TaskManager.defineTask(GEOFENCING_TASK, ({ data: { locations }, error }) => {
  if (error) {
    console.error('Geofencing task error:', error);
    return;
  }
  
  const [location] = locations;
  if (location) {
    // This will trigger the geofence check even when app is in background
    console.log('Background location update:', location.coords);
  }
});

const GeofencingComponent = ({ destination, radius = 50 }) => {
  const [hasPermission, setHasPermission] = useState(false);
  // Request permissions and start tracking
  useEffect(() => {
    const startGeofencing = async () => {
      // Common foreground permission request
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
  
      // Platform-specific background handling
      if (Platform.OS === 'android') {
        const bgPerm = await Location.getBackgroundPermissionsAsync();
        if (!bgPerm.granted) {
          Alert.alert(
            'Background Location Required',
            'Enable "Allow all the time" in location settings',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } else if (Platform.OS === 'ios') {
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          Alert.alert(
            'Background Location Required',
            'To enable background tracking:\n1. Open Settings\n2. Tap Privacy\n3. Tap Location Services\n4. Select "Always"',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') }
            ]
          );
        }
      }
  
      setHasPermission(true);
      await Location.startLocationUpdatesAsync(GEOFENCING_TASK, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Active geofencing monitoring',
        },
      });
    };
    
    startGeofencing();
    return () => {
      // Cleanup: Stop location updates when component unmounts
      Location.stopLocationUpdatesAsync(GEOFENCING_TASK);
    };
  }, []);
  // Check geofence when location updates
  useEffect(() => {
    if (!hasPermission || !destination) return;

    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      (location) => {
        checkGeofence(location.coords);
      }
    );

    return () => subscription.remove();
  }, [hasPermission, destination]);

  // Geofence check logic
  const checkGeofence = (coords) => {
    if (!destination) return;

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      destination.latitude,
      destination.longitude
    );

    if (distance <= radius) {
      Alert.alert('Geofence Alert', 'You entered the 50m area!');
    } else {
      // Optional: Alert on exit
      Alert.alert('Geofence Alert', 'You exited the 50m area!');
    }
  };

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };

  return null; // This component doesn't render UI
};

export default GeofencingComponent;