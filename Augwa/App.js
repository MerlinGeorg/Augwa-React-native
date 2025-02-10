import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import { augwaBlue } from './assets/styles/color';

// Create Stack Navigator for Authentication
const Stack = createStackNavigator();

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const LoginStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle:{backgroundColor: augwaBlue} }}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="dashboard" component={DashboardTabs}
      // prevent going back:
      options={{gestureEnabled: false}} /> 
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator (Dashboard)
const DashboardTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={DashboardScreen} />
      <Tab.Screen name="Map" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={DashboardScreen} />
      
    </Tab.Navigator>
  );
};

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <LoginStack />
    </NavigationContainer>
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