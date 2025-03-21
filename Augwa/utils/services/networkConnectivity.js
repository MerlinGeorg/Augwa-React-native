import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Create a context to share connectivity status
export const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
});

export const useNetworkStatus = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(null);
  
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("NetInfo state changed:", state);
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      console.log("Initial NetInfo state:", state);
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  const networkStatus = {
    isConnected: isConnected === null ? false : isConnected,
    isInternetReachable: isInternetReachable === null ? false : isInternetReachable,
  };
  
  return (
    <NetworkContext.Provider value={networkStatus}>
      {children}
    </NetworkContext.Provider>
  );
};

// Banner component to display connectivity status
export const ConnectivityBanner = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [bannerHeight] = useState(new Animated.Value(0));
  const [bannerOpacity] = useState(new Animated.Value(0));
  const isOffline = !isConnected || !isInternetReachable;

  useEffect(() => {
    if (isOffline) {
      Animated.parallel([
        Animated.timing(bannerHeight, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bannerHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isOffline, bannerHeight, bannerOpacity]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          height: bannerHeight,
          opacity: bannerOpacity,
        },
      ]}
    >
      <Text style={styles.bannerText}>
        {isOffline ? "You're offline. Some features may be limited." : "Back online!"}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});