import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LogInScreen';

export default function App() {

  const MyStack = createStackNavigator();

  return (
    //<LoginScreen />
    <SignupScreen />
    
     
    // <NavigationContainer>
    //   <MyStack.Screen name="signup" component={SignupScreen} />
    // </NavigationContainer>
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
