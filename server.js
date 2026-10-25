const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/payments', require('./routes/payments'));

async function startServer() {
  let dbUri = process.env.MONGO_URI;

  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(dbUri, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.warn('Atlas SSL/Network handshake blocked. Switching to Local In-Memory MongoDB for testing...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    dbUri = mongod.getUri();
    await mongoose.connect(dbUri);
    console.log('Connected to Local In-Memory MongoDB');
  }

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Explicit route to ensure Render finds support.html
  app.get('/support.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'support.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit http://localhost:' + PORT + '/support.html to test');
  });
}

startServer();