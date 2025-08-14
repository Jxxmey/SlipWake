/**
 * K-API client with flexible auth:
 * - K_API_MODE=mock | oauth2 | basic
 * - Mutual TLS via K_API_CERT_PATH/K_API_KEY_PATH (optional but recommended)
 *
 * Endpoints (sandbox examples - adjust per your K-API product contract):
 * - OAuth token:   /v2/oauth/token
 * - Slip verify:   /v2/transfer-slip/verify  (or the specific path given in your product)
 *
 * Note: K-API security typically requires 2-Way SSL (Mutual TLS). Prepare client cert/key. 
 * Ref: KBank Open API docs. 
 */
import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { logger } from './logger.js';

const {
  K_API_MODE = 'mock',
  K_API_BASE_URL,
  K_API_OAUTH_TOKEN_URL,
  K_API_CLIENT_ID,
  K_API_CLIENT_SECRET,
  K_API_KEY,
  K_API_BASIC_USER,
  K_API_BASIC_PASS,
  K_API_CERT_PATH,
  K_API_KEY_PATH,
  K_API_PASSPHRASE
} = process.env;

// HTTPS agent with mTLS if certs available
let httpsAgent;
try {
  if (K_API_CERT_PATH && K_API_KEY_PATH && fs.existsSync(K_API_CERT_PATH) && fs.existsSync(K_API_KEY_PATH)) {
    httpsAgent = new https.Agent({
      cert: fs.readFileSync(K_API_CERT_PATH),
      key: fs.readFileSync(K_API_KEY_PATH),
      passphrase: K_API_PASSPHRASE || undefined,
      rejectUnauthorized: true
    });
    logger.info({ msg: 'mTLS agent enabled for K-API' });
  }
} catch (e) {
  logger.warn({ msg: 'mTLS setup warning', err: e.message });
}

const axiosBase = axios.create({
  baseURL: K_API_BASE_URL,
  httpsAgent,
  timeout: 15000
});

async function getOauthToken() {
  const tokenUrl = K_API_OAUTH_TOKEN_URL;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: K_API_CLIENT_ID,
    client_secret: K_API_CLIENT_SECRET
  });
  const res = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    httpsAgent
  });
  return res.data.access_token;
}

/**
 * Verify slip against K-API
 * @param {Object} p
 * @param {string} [p.transactionRef] - transaction reference or slip ref
 * @param {string} [p.qrRawData] - raw QR string from slip
 * @param {number} [p.amount] - THB amount (optional validation)
 */
export async function verifySlipKbank({ transactionRef, qrRawData, amount }) {
  if (K_API_MODE === 'mock') {
    // Simulate deterministic success for development
    const payload = {
      ref: transactionRef || 'QRDATA',
      verified: true,
      amount,
      channel: 'mock',
      bank: 'KBANK',
      slip_datetime: new Date().toISOString()
    };
    logger.info({ msg: 'K-API mock verify', transactionRef, hasQr: !!qrRawData });
    return { success: true, data: payload };
  }

  let headers = { 'Content-Type': 'application/json' };
  if (K_API_MODE === 'oauth2') {
    const token = await getOauthToken();
    headers.Authorization = `Bearer ${token}`;
  } else if (K_API_MODE === 'basic') {
    const b64 = Buffer.from(`${K_API_BASIC_USER}:${K_API_BASIC_PASS}`).toString('base64');
    headers.Authorization = `Basic ${b64}`;
  }

  if (K_API_KEY) headers['x-api-key'] = K_API_KEY;

  // NOTE: Replace path below with the exact path in your Slip Verification API product
  const path = '/v2/transfer-slip/verify';

  const body = {
    transactionReference: transactionRef,
    qrRawData,
    amount
  };

  logger.info({ msg: 'Calling K-API slip verify', path, mode: K_API_MODE });
  const res = await axiosBase.post(path, body, { headers });
  // Normalize response
  return { success: true, data: res.data };
}
