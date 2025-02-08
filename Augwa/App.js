import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LogInScreen';

export default function App() {

  const MyStack = createStackNavigator();

  return (
<<<<<<< HEAD

    <LogInScreen />
    // <SignupScreen />

=======
    //<LoginScreen />
    <SignupScreen />
    
     
>>>>>>> a5431bdc7741111c81a7a8f635b7eedbfcb897c9
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
