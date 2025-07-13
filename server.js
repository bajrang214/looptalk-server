const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS setup for local and live frontend
app.use(cors({
  origin: ['http://localhost:3000', 'https://looptalk-client.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads')); // To serve images

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));