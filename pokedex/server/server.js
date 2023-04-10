const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('../models/User');
const connectDB = require('./db');
const jwt = require('jsonwebtoken'); // Add this import
const app = express();

// Add secret keys for JWT
const ACCESS_SECRET_KEY = 'access_secret_key_here';
const REFRESH_SECRET_KEY = 'refresh_secret_key_here';

// because REACT is on 3000, node is on 5000
const PORT = process.env.PORT || 5000;

// middleware


const corsOptions = {
  origin: ['http://localhost:3000', 'https://prabh-sokhey-pokedex.onrender.com'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));



app.use(bodyParser.json());

// connect to mongodb
connectDB();

// routes

// POST to add a new user
app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// POST to login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const accessToken = jwt.sign({ userId: user._id, role: user.role }, ACCESS_SECRET_KEY, {
        expiresIn: '1h',
      });
      const refreshToken = jwt.sign({ userId: user._id, role: user.role }, REFRESH_SECRET_KEY, {
        expiresIn: '7d',
      });
      res.status(200).send({ user, accessToken, refreshToken });
    } else {
      res.status(401).send('Incorrect username/password');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Middleware to verify the access token
// later for admin routes
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, ACCESS_SECRET_KEY, (err, user) => { // Use ACCESS_SECRET_KEY
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

