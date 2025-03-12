import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '@env';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
// need to set location in project project console

const MapScreen = () => {
  const [myLocation, setMyLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsRoute, setDirectionsRoute] = useState(null);
  const mapRef = useRef()
  const placesRef = useRef(null);

  const android_api_key = GOOGLE_MAPS_API_KEY;
  console.log(`api key: ${android_api_key}`)

  useEffect(() => {
    _getLocation()
  }, [])

  const _getLocation = async() => {
    try{
      let { status } = await Location.requestForegroundPermissionsAsync()

      if (status!== 'granted') {
        console.warn('Permission to access location was denied')
      return
      }
      let location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords;
      setMyLocation({ latitude, longitude });

      // Update region to focus on user location
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      });

    } catch (err) {
      console.warn(err)
    }
  }

  const handlePlaceSelection = (data, details = null) => {
    if (!details) return;

    // Clear previous search text
    placesRef.current?.setAddressText('');

    // Set destination based on the selected place
    const destinationLocation = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng
    };

    setDestination(destinationLocation);

    // Zoom to the destination
    mapRef.current.animateToRegion({
      ...destinationLocation,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05
    }, 1000);

    // Optional: Log place details for debugging
    console.log('Selected Place:', {
      name: details.name,
      address: details.formatted_address,
      location: destinationLocation
    });
  };

  const focusOnLocation = () => {
    if (myLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}
      region={region}
      ref={mapRef}
      provider={PROVIDER_GOOGLE}>
        {
          myLocation &&
          <Marker coordinate={myLocation}
          title='My Location'
          pinColor='red'
          description='I am here' />
        }
        {
            destination && 
            <Marker coordinate={destination}
            title='Destination'
            pinColor='blue' />
        }
        {
            directionsRoute &&
            <Polyline coordinates={directionsRoute}
            strokeWidth={4}
            strokeColor='blue' />
        }
      </MapView>

      <View style={styles.searchContainer}>
      <GooglePlacesAutocomplete
      fetchDetails={true}
      placeholder='Search'
      onPress={(data, details = null) => {
        console.log(JSON.stringify(data));
        console.log(JSON.stringify(details?.geometry?.location));
      }}
      query={{
        key: android_api_key,
        language: 'en',
      }}
      onFail={error => console.log(error)}
    />
      </View>


      <View style={styles.button}>
        <Ionicons name='locate-sharp' onPress={focusOnLocation} style={styles.icon}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  }, 
  searchContainer: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    zIndex: 1,
    flex: 0.5
  },
  autocompleteContainer: {
    flex: 1,
  },
  autocompleteInput: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listView: {
    backgroundColor: 'white',
    zIndex: 50,
    elevation: 3,
    borderRadius: 10,
    marginTop: 10,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 20,
    alignSelf: 'center',
  },
});

export default MapScreen;
