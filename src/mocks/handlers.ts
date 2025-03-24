import authHandlers from './handlers/auth';
import bannerHandlers from './handlers/banners';
import modelHandlers from './handlers/model';
import nailHandlers from './handlers/nails';
import onboardingHandlers from './handlers/onboarding';
import userHandlers from './handlers/users';

const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...onboardingHandlers,
  ...nailHandlers,
  ...bannerHandlers,
  ...modelHandlers,
];

export default handlers;
