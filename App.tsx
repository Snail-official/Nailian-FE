/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigation from './src/app/providers/navigation';
import { ToastContainer } from './src/shared/ui/Toast';
import useModelLoader from './src/features/model/useModelLoader';

function App(): React.JSX.Element {
  useModelLoader();

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppNavigation />
      <ToastContainer />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
