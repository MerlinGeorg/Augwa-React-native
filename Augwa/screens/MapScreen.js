import React, { useState, useEffect, use } from 'react';
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location'

const MapScreen = () => {
  const [myLocation, setMyLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const mapRef = React.useRef()

  

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
          title='Default Location'
          description='I am here' />
        }

      </MapView>
      <View style={styles.button}>
        <Button title='Get Location'  onPress={focusOnLocation} />
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }, 
  button: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center'
  },
  markerImage: {
    width: 40,
    height: 40, 
    borderRadius: 20
  }
});

export default MapScreen;
