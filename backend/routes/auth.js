import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  user_type: Joi.string().valid('individual','company').required(),
  first_name: Joi.string().when('user_type', { is: 'individual', then: Joi.required() }),
  last_name: Joi.string().when('user_type', { is: 'individual', then: Joi.required() }),
  id_card_number: Joi.string().when('user_type', { is: 'individual', then: Joi.required() }),
  company_name: Joi.string().when('user_type', { is: 'company', then: Joi.required() }),
  tax_id: Joi.string().when('user_type', { is: 'company', then: Joi.required() }),
  branch_name: Joi.string().allow(''),
  address: Joi.string().required(),
  phone_number: Joi.string().required()
});

router.post('/register', async (req, res) => {
  const payload = req.body;
  const { error } = registerSchema.validate(payload);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const existing = await User.findOne({ email: payload.email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const user = new User({
    email: payload.email,
    user_type: payload.user_type,
    individual: payload.user_type === 'individual' ? {
      first_name: payload.first_name,
      last_name: payload.last_name,
      id_card_number: payload.id_card_number
    } : undefined,
    company: payload.user_type === 'company' ? {
      company_name: payload.company_name,
      tax_id: payload.tax_id,
      branch_name: payload.branch_name || ''
    } : undefined,
    address: payload.address,
    phone_number: payload.phone_number,
    api_key: User.generateApiKey()
  });

  await user.setPassword(payload.password);
  await user.save();

  logger.info({ msg: 'User registered', user_id: user._id.toString() });

  res.json({
    message: 'Registered',
    user: user.toSafeJSON()
  });
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.verifyPassword(req.body.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

  logger.info({ msg: 'User login', user_id: user._id.toString() });

  res.json({
    token,
    user: user.toSafeJSON()
  });
});

router.get('/me', authJwt, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) { next(err) }
})

export default router;
