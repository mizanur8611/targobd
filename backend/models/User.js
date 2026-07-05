const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'বাড়ি' },
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  area:     { type: String, required: true },
  address:  { type: String, required: true },
  isDefault:{ type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, unique: true, sparse: true, lowercase: true },
  phone:    { type: String, unique: true, sparse: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['customer', 'admin', 'vendor'], default: 'customer' },
  avatar:   { type: String, default: '' },
  addresses:[addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isVerified:{ type: Boolean, default: false },
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
