import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import authJwt from '../middlewares/authJwt.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

function genApiKey() {
  return 'sk_' + crypto.randomBytes(24).toString('hex')
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function pickUser(u) {
  return {
    id: u._id?.toString(),
    email: u.email,
    role: u.role || 'user',
    apiKey: u.apiKey,
    credits: u.credits ?? 0,
    user_type: u.user_type,
    first_name: u.first_name,
    last_name: u.last_name,
    id_card_number: u.id_card_number,
    company_name: u.company_name,
    tax_id: u.tax_id,
    branch_name: u.branch_name,
    address: u.address,
    phone_number: u.phone_number,
  }
}

function validateRegister(body) {
  const errors = []
  const email = normalizeEmail(body.email)
  const password = String(body.password || '')
  const user_type = String(body.user_type || '')
  if (!email) errors.push('email is required')
  if (!password || password.length < 6) errors.push('password must be at least 6 chars')
  if (!['individual', 'company'].includes(user_type)) errors.push('user_type must be individual|company')
  if (!body.address) errors.push('address is required')
  if (!body.phone_number) errors.push('phone_number is required')
  if (user_type === 'individual') {
    if (!body.first_name) errors.push('first_name is required')
    if (!body.last_name) errors.push('last_name is required')
    if (!body.id_card_number) errors.push('id_card_number is required')
  }
  if (user_type === 'company') {
    if (!body.company_name) errors.push('company_name is required')
    if (!body.tax_id) errors.push('tax_id is required')
  }
  return { email, password, user_type, errors }
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, user_type, errors } = validateRegister(req.body || {})
    if (errors.length) return res.status(400).json({ message: 'validation_error', errors })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'email_already_registered' })
    const hash = await bcrypt.hash(password, 10)
    const initialCredits = Number(process.env.INITIAL_CREDITS || 0)
    const user = await User.create({
      email,
      password: hash,
      role: 'user',
      apiKey: genApiKey(),
      credits: Number.isFinite(initialCredits) ? initialCredits : 0,
      user_type,
      first_name: req.body.first_name || null,
      last_name: req.body.last_name || null,
      id_card_number: req.body.id_card_number || null,
      company_name: req.body.company_name || null,
      tax_id: req.body.tax_id || null,
      branch_name: req.body.branch_name || null,
      address: req.body.address,
      phone_number: req.body.phone_number,
    })
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    logger.info({ msg: 'user_registered', email })
    res.status(201).json({ token, user: pickUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password || '')
    if (!email || !password) return res.status(400).json({ message: 'email_and_password_required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'invalid_credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'invalid_credentials' })
    if (!user.apiKey) {
      user.apiKey = genApiKey()
      await user.save()
    }
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    logger.info({ msg: 'user_login', email })
    res.json({ token, user: pickUser(user) })
  } catch (err) {
    next(err)
  }
})

router.get('/me', authJwt, async (req, res, next) => {
  try {
    res.json({ user: pickUser(req.user) })
  } catch (err) {
    next(err)
  }
})

export default router
