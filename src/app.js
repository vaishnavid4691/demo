const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/suppliers', require('./routes/supplier'));
app.use('/api/raw-materials', require('./routes/rawMaterial'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/reviews', require('./routes/review'));

app.get('/', (req, res) => res.send('BazaarSetu API Running'));

module.exports = app;