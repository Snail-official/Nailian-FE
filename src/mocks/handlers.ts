import authHandlers from './handlers/auth';
import bannerHandlers from './handlers/banners';
import nailHandlers from './handlers/nails';
import userHandlers from './handlers/users';

const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...nailHandlers,
  ...bannerHandlers,
];

export default handlers;
