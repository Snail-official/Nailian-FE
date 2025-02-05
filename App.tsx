/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
// import LoginScreen from './src/screens/LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingScreen />
    </SafeAreaView>
  );
}

export default App;
