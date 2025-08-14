import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const billingIndividualSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  id_card_number: String
}, { _id: false });

const billingCompanySchema = new mongoose.Schema({
  company_name: String,
  tax_id: String,
  branch_name: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  password_hash: { type: String, required: true },
  api_key: { type: String, unique: true, index: true },
  user_type: { type: String, enum: ['individual','company'], required: true },
  individual: billingIndividualSchema,
  company: billingCompanySchema,
  address: String,
  phone_number: String,
  credit_thb: { type: Number, default: Number(process.env.INITIAL_CREDIT_THB || 0) },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

userSchema.methods.setPassword = async function(plain) {
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(plain, salt);
};

userSchema.methods.verifyPassword = async function(plain) {
  return bcrypt.compare(plain, this.password_hash);
};

userSchema.statics.generateApiKey = function() {
  return crypto.randomBytes(24).toString('hex');
};

userSchema.methods.toSafeJSON = function() {
  return {
    id: this._id.toString(),
    email: this.email,
    user_type: this.user_type,
    individual: this.individual,
    company: this.company,
    address: this.address,
    phone_number: this.phone_number,
    credit_thb: this.credit_thb,
    role: this.role,
    api_key: this.api_key,
    created_at: this.created_at
  };
};

const User = mongoose.model('users', userSchema);
export default User;
