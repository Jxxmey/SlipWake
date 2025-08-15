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

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-internal-token']
}));
app.use(express.json({ limit: '2mb' }));

app.use(morgan('combined', { stream: httpStream }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

const { MONGO_URI, PORT = 8080 } = process.env;

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => logger.info('MongoDB connected'))
  .catch(err => {
    logger.error({ msg: 'MongoDB connection error', err });
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/verify-slip', verifySlipRoutes);
app.use('/api/generate-qr', generateQRRoutes);
app.use('/api/v', internalVerifyRoutes);

// Home
app.get('/', (_req, res) => {
  const htmlResponse = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K-API Slip Verify</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f7f9;
            color: #2c3e50;
        }
        .container {
            text-align: center;
            background-color: #ffffff;
            padding: 60px 80px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            width: 90%;
            animation: fadeIn 0.8s ease-in-out;
            transition: transform 0.3s ease;
        }
        .container:hover {
            transform: translateY(-5px);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            font-size: 2.5em;
            font-weight: 700;
            color: #34495e;
            margin-bottom: 8px;
        }
        p {
            font-size: 1em;
            color: #7f8c8d;
            margin-bottom: 35px;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            font-size: 1em;
            font-weight: 600;
            color: #ffffff;
            background-color: #3498db;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
        }
        .button:hover {
            background-color: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
        }
        .button:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>K-API Slip Verify</h1>
        <p>Your API is up and running smoothly. ✨</p>
        <a href="https://slipwake.online" class="button">Go to SlipWake</a>
    </div>

</body>
</html>
  `;
  res.send(htmlResponse);
});

// Health
app.get('/health', (_req, res) => {
  const healthHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Health Status</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f7f9;
            color: #2c3e50;
        }
        .container {
            text-align: center;
            background-color: #ffffff;
            padding: 60px 80px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            width: 90%;
            animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            font-size: 2.5em;
            font-weight: 700;
            color: #2ecc71;
            margin-bottom: 8px;
        }
        p {
            font-size: 1.1em;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        .status-text {
            font-size: 1.5em;
            font-weight: 600;
            margin-top: 10px;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>API Status</h1>
        <p class="status-text" style="color: #2ecc71;">Running smoothly</p>
        <p>Current time: <span>${new Date().toISOString()}</span></p>
    </div>

</body>
</html>
  `;
  res.send(healthHtml);
});

// Swagger
const openapi = {
  openapi: '3.0.0',
  info: { title: 'K-API Slip Verify', version: '1.0.0' },
  servers: [{ url: 'http://localhost:' + (process.env.PORT || 8080) }],
  paths: {
    '/api/auth/register': { post: { summary: 'Register', responses: { 200: { description: 'OK' } } } },
    '/api/auth/login': { post: { summary: 'Login', responses: { 200: { description: 'OK' } } } },
    '/api/verify-slip': { post: { summary: 'Verify Slip (charge 2 THB)', responses: { 200: { description: 'OK' } } } },
    '/api/generate-qr': { post: { summary: 'Generate Thai QR', responses: { 200: { description: 'OK' } } } },
    '/api/v': { post: { summary: 'Internal Verify (no charge)', responses: { 200: { description: 'OK' } } } },
    '/health': { get: { summary: 'Health', responses: { 200: { description: 'OK' } } } }
  }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/favicon.ico', (_req, res) => res.status(204).end());

// 404 (ต้องอยู่หลัง routes ทั้งหมด)
app.use((_req, res) => {
  const notFoundHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 Not Found</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f7f9;
            color: #2c3e50;
        }
        .container {
            text-align: center;
            background-color: #ffffff;
            padding: 60px 80px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            width: 90%;
            animation: fadeIn 0.8s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 {
            font-size: 5em;
            font-weight: 700;
            color: #e74c3c;
            margin-bottom: 0;
        }
        h2 {
            font-size: 1.8em;
            font-weight: 600;
            color: #34495e;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        p {
            font-size: 1em;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            padding: 14px 30px;
            font-size: 1em;
            font-weight: 600;
            color: #ffffff;
            background-color: #3498db;
            border: none;
            border-radius: 8px;
            text-decoration: none;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
        }
        .button:hover {
            background-color: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
        }
        .button:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
        <a href="https://slipwake.online" class="button">Go to Homepage</a>
    </div>

</body>
</html>
    `;
  res.status(404).send(notFoundHtml);
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ msg: `Server listening on :${PORT}` });
});