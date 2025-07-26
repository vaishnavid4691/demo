const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['vendor', 'supplier'], required: true },
  isVerified: { type: Boolean, default: false }, // Only for suppliers
  FSSAI_Number: {
    type: String,
    validate: {
      validator: function (v) {
        // FSSAI number is 14 digits
        return /^\d{14}$/.test(v);
      },
      message: props => `${props.value} is not a valid FSSAI number!`,
    },
    required: function () { return this.role === 'supplier'; },
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);