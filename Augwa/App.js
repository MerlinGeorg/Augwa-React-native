import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import { augwaBlue } from './assets/styles/color';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Stack Navigator
const LoginStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen 
        name="dashboard" 
        component={DashboardTabs}
        options={{ gestureEnabled: false }} // Prevent going back to login
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator (Dashboard)
const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home-outline'
              break;
            case 'Schedule':
              iconName = 'calendar'
              break;
            case 'Map':
              iconName = 'location'
              break;
            case 'Settings':
              iconName = 'settings'
              break;
            default:
              iconName = 'help-outline'
          }

          return <Ionicons name={iconName} size={30} color={color} />;
        },
        tabBarActiveTintColor: '#177de1',
        tabBarInactiveTintColor: 'gray',
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
        component={DashboardScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Map" 
        component={DashboardScreen}
        options={{ title: 'Map' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={DashboardScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <LoginStack />
      </NavigationContainer>
    </SafeAreaProvider>
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