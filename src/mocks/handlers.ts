import authHandlers from './handlers/auth';
import bannerHandlers from './handlers/banners';
import nailHandlers from './handlers/nails';
import onboardingHandlers from './handlers/onboarding';
import userHandlers from './handlers/users';

const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...onboardingHandlers,
  ...nailHandlers,
  ...bannerHandlers,
];

export default handlers;
