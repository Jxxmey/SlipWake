import express from 'express';
import Joi from 'joi';
import authApiKey from '../middlewares/authApiKey.js';
import { buildEmvPayload, buildReference, toQrDataUrl } from '../utils/generateQR.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const schema = Joi.object({
  merchantId: Joi.string().required(),     // Biller/Merchant ID
  amount: Joi.number().min(0.01).required(),
  description: Joi.string().allow('').default(''),
  currency: Joi.string().valid('THB').default('THB')
});

router.post('/', authApiKey, async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { merchantId, amount } = req.body;

  // Ref: YYYYMMDD + UnixSeconds + Amount(2d) + API Key
  const ref = buildReference({ amount, apiKey: req.user.api_key });

  const payload = buildEmvPayload({
    merchantId,
    amount,
    ref
  });

  const dataUrl = await toQrDataUrl(payload);
  logger.info({ msg: 'QR generated', user_id: req.user._id.toString() });

  res.json({
    reference: ref,
    emv_payload: payload,
    qr_image_data_url: dataUrl
  });
});

export default router;
