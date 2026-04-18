import { server } from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 CrowdPulse Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
