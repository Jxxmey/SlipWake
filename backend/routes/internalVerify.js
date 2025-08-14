import express from 'express';
import Joi from 'joi';
import authJwt from '../middlewares/authJwt.js';
import { verifySlipKbank } from '../utils/kbankApi.js';
import VerificationLog from '../models/VerificationLog.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const schema = Joi.object({
  transactionRef: Joi.string().allow(''),
  qrRawData: Joi.string().allow(''),
  amount: Joi.number().min(0).required()
}).or('transactionRef','qrRawData');

router.post('/', authJwt, async (req, res, next) => {
  try {
    const internalToken = req.headers['x-internal-token'];
    if (!internalToken || internalToken !== process.env.INTERNAL_TOKEN) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const kapi = await verifySlipKbank({
      transactionRef: req.body.transactionRef,
      qrRawData: req.body.qrRawData,
      amount: req.body.amount
    });

    await VerificationLog.create({
      user_id: req.user?._id || null,
      api_key: null,
      route: 'internal',
      request_payload: req.body,
      response_payload: kapi.data || kapi,
      result_status: kapi.success ? 'success' : 'fail',
      cost_thb: 0,
      amount: req.body.amount,
      reference: req.body.transactionRef || null,
      ip: req.ip
    });

    logger.info({ msg: 'Internal verify done', success: kapi.success });

    res.json({
      charged: 0,
      result: kapi
    });
  } catch (err) {
    next(err);
  }
});

export default router;
