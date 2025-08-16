import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { logger } from '../utils/logger.js'

export default async function authJwt(req, res, next) {
  try {
    const h = req.headers.authorization || ''
    if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    const token = h.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const userId = payload.sub || payload.id || payload._id
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' })
    const user = await User.findById(userId).select('-password -__v')
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch (err) {
    logger?.warn?.({ msg: 'authJwt failed', err: err.message })
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
