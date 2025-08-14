import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export default async function authApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key' });
    const user = await User.findOne({ api_key: apiKey });
    if (!user) return res.status(401).json({ error: 'Invalid API Key' });
    req.user = user;
    req.apiKey = apiKey;
    logger.info({ msg: 'API key validated', user_id: user._id.toString() });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'API Key auth failed' });
  }
}
