import express from 'express';
import Joi from 'joi';
import mongoose from 'mongoose';
import authApiKey from '../middlewares/authApiKey.js';
import { verifySlipKbank } from '../utils/kbankApi.js';
import VerificationLog from '../models/VerificationLog.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

const schema = Joi.object({
  transactionRef: Joi.string().allow(''),
  qrRawData: Joi.string().allow(''),
  amount: Joi.number().min(0).required()
}).or('transactionRef','qrRawData');

router.post('/', authApiKey, async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = req.user;
    const COST = 2;

    if ((user.credit_thb || 0) < COST) {
      return res.status(402).json({ error: 'Insufficient credit. Please top up.' });
    }

    // Call K-API
    const kapi = await verifySlipKbank({
      transactionRef: req.body.transactionRef,
      qrRawData: req.body.qrRawData,
      amount: req.body.amount
    });

    // Only deduct credit if verify success
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      if (kapi.success) {
        user.credit_thb = (user.credit_thb || 0) - COST;
        await user.save({ session });

        await VerificationLog.create([{
          user_id: user._id,
          api_key: user.api_key,
          route: 'public',
          request_payload: req.body,
          response_payload: kapi.data,
          result_status: 'success',
          cost_thb: COST,
          amount: req.body.amount,
          reference: req.body.transactionRef || null,
          ip: req.ip
        }], { session });

        await session.commitTransaction();
      } else {
        await VerificationLog.create([{
          user_id: user._id,
          api_key: user.api_key,
          route: 'public',
          request_payload: req.body,
          response_payload: kapi,
          result_status: 'fail',
          cost_thb: 0,
          amount: req.body.amount,
          reference: req.body.transactionRef || null,
          ip: req.ip
        }], { session });
        await session.abortTransaction();
      }
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    logger.info({ msg: 'Verify slip completed', user_id: user._id.toString(), success: kapi.success });

    return res.json({
      charged: kapi.success ? COST : 0,
      credit_balance: user.credit_thb,
      result: kapi
    });
  } catch (err) {
    next(err);
  }
});

export default router;
