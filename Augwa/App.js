import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

export default function App() {

  const MyStack = createStackNavigator();

  return (

    //<LoginScreen />
   // <SignupScreen />
    
     
    <NavigationContainer>
      <MyStack.Navigator>
      <MyStack.Screen name="login" component={LoginScreen} />
      <MyStack.Screen name="signup" component={SignupScreen} />
      <MyStack.Screen name="dashboard" component={DashboardScreen} />
      
      
      </MyStack.Navigator>
      
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
