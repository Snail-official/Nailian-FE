/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import AppNavigation from './src/app/providers/navigation';
import { ToastContainer } from './src/shared/ui/Toast';

function App(): React.JSX.Element {
  return (
    <>
      <AppNavigation />
      <ToastContainer />
    </>
  );
}

export default App;
