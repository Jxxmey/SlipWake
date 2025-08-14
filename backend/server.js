import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { logger, httpStream } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import verifySlipRoutes from './routes/verifySlip.js';
import internalVerifyRoutes from './routes/internalVerify.js';
import generateQRRoutes from './routes/generateQR.js';
import errorHandler from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-internal-token']
}));
app.use(express.json({ limit: '2mb' }));

// Logging
app.use(morgan('combined', { stream: httpStream }));

// Rate limit (protect public endpoints)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Mongo connection
const { MONGO_URI, PORT = 8080 } = process.env;

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => logger.info('MongoDB connected'))
  .catch(err => {
    logger.error({ msg: 'MongoDB connection error', err });
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify-slip', verifySlipRoutes);   // หักเครดิต
app.use('/api/generate-qr', generateQRRoutes);
app.use('/api/v', internalVerifyRoutes);         // internal ไม่หักเครดิต

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- Add Home & Docs BEFORE 404 and error handler ----

// Home
app.get('/', (_req, res) => {
  res.json({
    name: 'K-API Slip Verify',
    status: 'running',
    docs: '/docs',
    health: '/health',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/verify-slip',
      'POST /api/generate-qr',
      'POST /api/v (internal)'
    ]
  });
});

// Swagger (minimal)
const openapi = {
  openapi: '3.0.0',
  info: { title: 'K-API Slip Verify', version: '1.0.0' },
  servers: [{ url: 'http://localhost:' + (process.env.PORT || 8080) }],
  paths: {
    '/api/auth/register': { post: { summary: 'Register', responses: { 200: { description: 'OK' } } } },
    '/api/auth/login':    { post: { summary: 'Login',    responses: { 200: { description: 'OK' } } } },
    '/api/verify-slip':   { post: { summary: 'Verify Slip (charge 2 THB)', responses: { 200: { description: 'OK' } } } },
    '/api/generate-qr':   { post: { summary: 'Generate Thai QR', responses: { 200: { description: 'OK' } } } },
    '/api/v':             { post: { summary: 'Internal Verify (no charge)', responses: { 200: { description: 'OK' } } } },
    '/health':            { get:  { summary: 'Health', responses: { 200: { description: 'OK' } } } }
  }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// (optional) avoid favicon 404 noise
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// 404 (must be after all routes)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler (always last)
app.use(errorHandler);

// Start server (keep LAST)
app.listen(PORT, () => {
  logger.info({ msg: `Server listening on :${PORT}` });
});
