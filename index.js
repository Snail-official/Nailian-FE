import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { startMockServer } from './src/mocks/server';
import 'react-native-url-polyfill/auto';

async function enableMocking() {
  if (!__DEV__) return;
  if (process.env.NODE_ENV !== 'development') return;
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
