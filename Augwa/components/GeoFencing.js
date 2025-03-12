import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import * as Location from 'expo-location';

const GeofencingComponent = ({ destination, radius = 50 }) => {
  const [hasPermission, setHasPermission] = useState(false);

  // Request background location permissions
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);
        setHasPermission(
          granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
          granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted'
        );
      } else {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        setHasPermission(status === 'granted');
      }
    };

    requestPermissions();
  }, []);

  // Start geofencing when permissions are granted
  useEffect(() => {
    if (!hasPermission || !destination) return;

    // Configure geofencing
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        checkGeofence(latitude, longitude);
      },
      error => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
        showsBackgroundLocationIndicator: true,
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [hasPermission, destination]);

  // Check if user is inside geofence
  const checkGeofence = (lat, lng) => {
    const distance = calculateDistance(
      lat,
      lng,
      destination.latitude,
      destination.longitude
    );

    if (distance <= radius) {
      Alert.alert('Geofence Alert', 'You entered the 50m area!');
    }
  };

  // Haversine formula to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return null; // This component doesn't render UI
};

export default GeofencingComponent;