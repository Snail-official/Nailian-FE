/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/app/providers/navigation';
import { ToastContainer } from './src/shared/ui/Toast';
import useModelLoader from './src/features/model/useModelLoader';
import { QueryProvider } from './src/app/providers/query';
import ErrorModal from './src/features/error/ui/ErrorModal';

function App(): React.JSX.Element {
  useModelLoader();

  return (
    <QueryProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <AppNavigation />
          <ToastContainer />
          <ErrorModal />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
