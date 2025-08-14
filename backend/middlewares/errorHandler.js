import { logger } from '../utils/logger.js';

export default function errorHandler(err, _req, res, _next) {
  logger.error({ msg: 'Unhandled error', err });
  const status = err.status || 500;
  res.status(status).json({
    error: err.expose ? err.message : 'Internal Server Error'
  });
}
