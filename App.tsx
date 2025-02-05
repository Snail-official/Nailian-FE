/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingLoginScreen from './src/screens/OnboardingLoginScreen';
import OnboardingDefaultScreen from './src/screens/OnboardingDefaultScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="OnboardingLogin"
          component={OnboardingLoginScreen}
        />
        <Stack.Screen
          name="OnboardingDefault"
          component={OnboardingDefaultScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
