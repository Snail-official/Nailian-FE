import { setupServer } from 'msw/native';
import handlers from './handlers';

export const server = setupServer(...handlers);

export function startMockServer() {
  console.log('[MSW] Starting mock server...');
  return server.listen({
    onUnhandledRequest: (req, print) => {
      if (req.url.toString().includes('symbolicate')) {
        return;
      }
      print.warning();
    },
  });
}
