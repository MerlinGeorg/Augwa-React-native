
import Geolocation from 'react-native-geolocation-service';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';

const GEOFENCES_STORAGE_KEY = 'STORED_GEOFENCES';
const GEOFENCE_STATES_KEY = 'GEOFENCE_STATES';
const LOCATION_UPDATE_INTERVAL = 15000; // 15 seconds - adjust as needed

class GeofencingBackgroundService {
  constructor() {
    this.geofences = [];
    this.geofenceState = {}; // Tracks whether we're inside each geofence
    this.watchId = null;
    this.lastLocation = null;
    this.appState = AppState.currentState;
    this.isInitialized = false;
    this.appStateSubscription = null;
  }

  // Calculate distance between two points using the Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // distance in meters
  }

  // Check if a point is inside a circular geofence
  isPointInGeofence(latitude, longitude, geofence) {
    const distance = this.calculateDistance(
      latitude,
      longitude,
      geofence.latitude,
      geofence.longitude
    );
    return distance <= geofence.radius;
  }

  async requestAndroidPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location for geofencing features",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Location permission granted");
          
          // For Android 10+ (API 29+), request background location permission
          if (Platform.Version >= 29) {
            const backgroundGranted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
              {
                title: "Background Location Permission",
                message: "This app needs access to your location in the background for geofencing features",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
              }
            );
            
            if (backgroundGranted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("Background location permission granted");
              return true;
            } else {
              console.log("Background location permission denied");
              return false;
            }
          }
          
          return true;
        } else {
          console.log("Location permission denied");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    
    return true; // On iOS, permissions are handled by the Geolocation module
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Request Android permissions
      await this.requestAndroidPermissions();
      
      // Configure push notifications
      this.configurePushNotifications();
      
      // Load stored geofences
      await this.loadGeofences();
      
      // Load previous geofence states
      await this.loadGeofenceStates();
      
      // Configure background fetch
      await this.configureBackgroundFetch();
      
      // Set up App State change listener with newer API
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

      // Start tracking
      this.startLocationTracking();
      
      this.isInitialized = true;
      console.log('Geofencing background service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize geofencing service:', error);
      return false;
    }
  }

  configurePushNotifications() {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
      },
      
      // Required for iOS permissions
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: "geofencing-channel",
          channelName: "Geofencing Notifications",
          channelDescription: "Notifications for geofence events",
          importance: 4, // Importance.HIGH
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  async configureBackgroundFetch() {
    try {
      await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // fetch every 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
        },
        async (taskId) => {
          console.log('[BackgroundFetch] Task:', taskId);
          
          // Check geofences in background
          await this.checkGeofencesFromBackground();
          
          BackgroundFetch.finish(taskId);
        },
        (error) => {
          console.error('[BackgroundFetch] Failed to configure:', error);
        }
      );
    } catch (error) {
      console.error('Failed to configure background fetch:', error);
    }
  }

  handleAppStateChange = async (nextAppState) => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('App has come to the foreground');
      this.startLocationTracking();
    } else if (nextAppState.match(/inactive|background/) && this.appState === 'active') {
      // App has gone to the background
      console.log('App has gone to the background');
      // Save current geofence states before going to background
      await this.saveGeofenceStates();
    }
    
    this.appState = nextAppState;
  };

  startLocationTracking() {
    // Clear any existing watch
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    // Start watching location
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.handleLocationUpdate(position);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // minimum distance (meters) between updates
        interval: LOCATION_UPDATE_INTERVAL,
        fastestInterval: 5000,
        showLocationDialog: true,
        forceRequestLocation: true,
      }
    );
    
    console.log('Location tracking started with watchId:', this.watchId);
  }

  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('Location tracking stopped');
    }
  }

  async checkGeofencesFromBackground() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.lastLocation = { latitude, longitude, timestamp: position.timestamp };
          
          // Check all geofences with the new position
          this.checkGeofences(latitude, longitude);
          resolve(true);
        },
        (error) => {
          console.error('Background location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
        }
      );
    });
  }

  handleLocationUpdate(position) {
    const { latitude, longitude } = position.coords;
    this.lastLocation = { latitude, longitude, timestamp: position.timestamp };
    
    // Log for debugging
    console.log(`Location updated: ${latitude}, ${longitude}`);
    
    // Check all geofences with the new position
    this.checkGeofences(latitude, longitude);
  }

  checkGeofences(latitude, longitude) {
    if (!this.geofences || this.geofences.length === 0) return;
    
    console.log(`Checking ${this.geofences.length} geofences...`);
    
    this.geofences.forEach(geofence => {
      const isInside = this.isPointInGeofence(latitude, longitude, geofence);
      const wasInside = this.geofenceState[geofence.id] || false;
      
      console.log(`Geofence ${geofence.name}: ${isInside ? 'inside' : 'outside'}`);
      
      // Update geofence state
      this.geofenceState[geofence.id] = isInside;
      
      // Trigger events for transitions
      if (isInside && !wasInside && geofence.notifyOnEnter) {
        // Entered geofence
        console.log(`Entered geofence: ${geofence.name}`);
        this.sendNotification('Geofence Enter', `You've entered ${geofence.name}`);
        
        // Execute any enter actions
        if (geofence.onEnterActions) {
          this.executeActions(geofence.onEnterActions, geofence);
        }
      } else if (!isInside && wasInside && geofence.notifyOnExit) {
        // Exited geofence
        console.log(`Exited geofence: ${geofence.name}`);
        this.sendNotification('Geofence Exit', `You've exited ${geofence.name}`);
        
        // Execute any exit actions
        if (geofence.onExitActions) {
          this.executeActions(geofence.onExitActions, geofence);
        }
      }
    });
    
    // Save states after checking
    this.saveGeofenceStates();
  }

  sendNotification(title, message) {
    console.log(`Sending notification: ${title} - ${message}`);
    
    PushNotification.localNotification({
      channelId: "geofencing-channel", // Required for Android
      title: title,
      message: message,
      playSound: true,
      soundName: "default",
      importance: "high",
    });
  }

  executeActions(actions, geofence) {
    // This can be expanded to handle different types of actions
    if (!actions || !Array.isArray(actions)) return;
    
    actions.forEach(action => {
      try {
        switch (action.type) {
          case 'notification':
            this.sendNotification(
              action.title || `Geofence: ${geofence.name}`,
              action.message || `Geofence event for ${geofence.name}`
            );
            break;
          // Add other action types as needed
          default:
            console.log(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        console.error(`Failed to execute action: ${error.message}`);
      }
    });
  }

  async addGeofence(geofence) {
    if (!this.isInitialized) await this.init();
    
    try {
      // Validate required parameters
      if (!geofence.latitude || !geofence.longitude || !geofence.radius) {
        throw new Error('Invalid geofence parameters. Required: latitude, longitude, radius');
      }
      
      // Format the geofence object
      const formattedGeofence = {
        id: geofence.id || `geofence_${Date.now()}`,
        name: geofence.name || 'Unnamed Geofence',
        latitude: parseFloat(geofence.latitude),
        longitude: parseFloat(geofence.longitude),
        radius: parseFloat(geofence.radius) || 100,
        notifyOnEnter: geofence.notifyOnEnter !== false,
        notifyOnExit: geofence.notifyOnExit !== false,
        onEnterActions: geofence.onEnterActions || [],
        onExitActions: geofence.onExitActions || [],
        timestamp: Date.now()
      };
      
      console.log(`Adding geofence: ${formattedGeofence.name}`);
      
      // Add to memory
      this.geofences.push(formattedGeofence);
      
      // Check if we're already inside the geofence
      if (this.lastLocation) {
        const isInside = this.isPointInGeofence(
          this.lastLocation.latitude,
          this.lastLocation.longitude,
          formattedGeofence
        );
        this.geofenceState[formattedGeofence.id] = isInside;
        
        // If already inside, trigger enter event
        if (isInside && formattedGeofence.notifyOnEnter) {
          this.sendNotification('Geofence Enter', `You've entered ${formattedGeofence.name}`);
          if (formattedGeofence.onEnterActions) {
            this.executeActions(formattedGeofence.onEnterActions, formattedGeofence);
          }
        }
      }
      
      // Save to persistent storage
      await this.saveGeofences();
      await this.saveGeofenceStates();
      
      console.log(`Geofence ${formattedGeofence.id} added successfully`);
      return true;
    } catch (error) {
      console.error('Failed to add geofence:', error);
      return false;
    }
  }

  async removeGeofence(geofenceId) {
    if (!this.isInitialized) await this.init();
    
    try {
      // Find the geofence
      const geofence = this.geofences.find(g => g.id === geofenceId);
      if (!geofence) {
        throw new Error(`Geofence ${geofenceId} not found`);
      }
      
      // Remove from memory
      this.geofences = this.geofences.filter(g => g.id !== geofenceId);
      
      // Remove from state
      delete this.geofenceState[geofenceId];
      
      // Save updated list to storage
      await this.saveGeofences();
      await this.saveGeofenceStates();
      
      console.log(`Geofence ${geofenceId} removed successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to remove geofence ${geofenceId}:`, error);
      return false;
    }
  }

  async removeAllGeofences() {
    if (!this.isInitialized) await this.init();
    
    try {
      // Clear memory
      this.geofences = [];
      this.geofenceState = {};
      
      // Clear storage
      await AsyncStorage.removeItem(GEOFENCES_STORAGE_KEY);
      await AsyncStorage.removeItem(GEOFENCE_STATES_KEY);
      
      console.log('All geofences removed successfully');
      return true;
    } catch (error) {
      console.error('Failed to remove all geofences:', error);
      return false;
    }
  }

  async loadGeofences() {
    try {
      const storedGeofences = await AsyncStorage.getItem(GEOFENCES_STORAGE_KEY);
      if (storedGeofences) {
        this.geofences = JSON.parse(storedGeofences);
        console.log(`Loaded ${this.geofences.length} geofences from storage`);
      }
    } catch (error) {
      console.error('Failed to load geofences from storage:', error);
      this.geofences = [];
    }
  }

  async saveGeofences() {
    try {
      await AsyncStorage.setItem(GEOFENCES_STORAGE_KEY, JSON.stringify(this.geofences));
      console.log(`Saved ${this.geofences.length} geofences to storage`);
      return true;
    } catch (error) {
      console.error('Failed to save geofences to storage:', error);
      return false;
    }
  }

  async loadGeofenceStates() {
    try {
      const storedStates = await AsyncStorage.getItem(GEOFENCE_STATES_KEY);
      if (storedStates) {
        this.geofenceState = JSON.parse(storedStates);
        console.log(`Loaded geofence states from storage`);
      }
    } catch (error) {
      console.error('Failed to load geofence states from storage:', error);
      this.geofenceState = {};
    }
  }

  async saveGeofenceStates() {
    try {
      await AsyncStorage.setItem(GEOFENCE_STATES_KEY, JSON.stringify(this.geofenceState));
      console.log('Saved geofence states to storage');
      return true;
    } catch (error) {
      console.error('Failed to save geofence states to storage:', error);
      return false;
    }
  }

  getGeofences() {
    return [...this.geofences];
  }

  getCurrentLocation() {
    return this.lastLocation;
  }

  cleanup() {
    // Stop location tracking
    this.stopLocationTracking();
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    // Save states before cleanup
    this.saveGeofenceStates();
    
    this.isInitialized = false;
    console.log('Geofencing service cleaned up');
  }
}

// Export as singleton
export default new GeofencingBackgroundService();