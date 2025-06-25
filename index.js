import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { ENV } from '@env';
import App from './App';
import { name as appName } from './app.json';
import { startMockServer } from './src/mocks/server';
import 'react-native-url-polyfill/auto';

async function enableMocking() {
  if (!__DEV__) return;
  if (ENV !== 'development') return;
  try {
    await startMockServer();
  } catch (error) {
    console.error('[Mocking] Error enabling mocking:', error);
  }
}

(async () => {
  try {
    await enableMocking();
    AppRegistry.registerComponent(appName, () => App);
  } catch (error) {
    console.error('[App] Error during app initialization:', error);
  }
})();
