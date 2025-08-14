import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
  api_key: { type: String, index: true },
  route: { type: String, enum: ['public','internal'], default: 'public' },
  request_payload: { type: Object },
  response_payload: { type: Object },
  result_status: { type: String, enum: ['success','fail'], index: true },
  cost_thb: { type: Number, default: 0 },
  amount: { type: Number },
  reference: { type: String },
  ip: { type: String },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

verificationLogSchema.index({ created_at: -1 });

const VerificationLog = mongoose.model('verification_logs', verificationLogSchema);
export default VerificationLog;
