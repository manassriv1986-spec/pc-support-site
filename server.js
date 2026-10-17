const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');
  const path = require('path');
  require('dotenv').config();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // THIS LINE IS THE KEY - It tells the server to serve files from the 'public' folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/cases', require('./routes/cases'));
  app.use('/api/payments', require('./routes/payments'));

  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

  app.get('/', (req, res) => {
    res.send('PC Support Backend is running! Visit /support.html to start.');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
