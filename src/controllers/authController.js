const User = require('../models/User');
const { generateToken } = require('../config/jwt');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, FSSAI_Number } = req.body;
    if (role === 'supplier' && !FSSAI_Number) {
      return res.status(400).json({ message: 'FSSAI Number is required for suppliers' });
    }
    const user = new User({ name, email, password, role, FSSAI_Number });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};