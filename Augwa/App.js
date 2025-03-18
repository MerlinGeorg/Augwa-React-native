import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from './src/context/AuthContext';
import React, { useState } from 'react';
import * as Notifications from 'expo-notifications';

import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import { augwaBlue } from './assets/styles/color';
import SuccessScreen from './screens/biometricSuccessScreen';
import ScheduleDetailScreen from './screens/ScheduleDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';

import { requestLocationPermissions } from './components/PermissionUtils';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const ScheduleStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: augwaBlue },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="ScheduleMain" 
        component={ScheduleScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ScheduleDetail" 
        component={ScheduleDetailScreen} 
        options={{ title: 'Details' }}
      />
      <Stack.Screen name = "schedule" component={ScheduleScreen} />
      <Stack.Screen name = "schedule_detail" component={ScheduleDetailScreen} />
    </Stack.Navigator>
  );
};

const SettingStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: augwaBlue },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="SettingMain" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Schedule':
              iconName = 'calendar';
              break;
            // case 'Map':
            //   iconName = 'location';
            //   break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={30} color={color} />;
        },
        tabBarActiveTintColor: '#177de1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        headerStyle: {
          backgroundColor: augwaBlue,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#fff',
          fontSize: 20,
        },
        tabBarStyle: {
          height: 80,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleStack}

        options={{ title: 'Schedule' }}
      />
      {/* <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Map' }}
      /> */}
      <Tab.Screen 
        name="Settings" 
        component={SettingStack}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const LoginStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerTintColor: '#fff',
        headerStyle: { backgroundColor: augwaBlue },
        cardStyle: { backgroundColor: augwaBlue }
      }}
    >
      <Stack.Screen 
        name="login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="signup" 
        component={SignupScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="biometrysuccess" 
        component={SuccessScreen} 
      />
      <Stack.Screen 
        name="dashboard" 
        component={DashboardTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [domain, setDomain] = useState(null);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, userName, setUserName, domain, setDomain }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <LoginStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});