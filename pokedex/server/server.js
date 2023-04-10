const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('../models/User');
const connectDB = require('./db');
const jwt = require('jsonwebtoken'); // Add this import
const app = express();
const axios = require('axios');

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

// GET Pokémon details by ID
app.get('/pokemon/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json');
    const pokemon = response.data.find(p => p.id === parseInt(id));
    if (pokemon) {
      res.status(200).send(pokemon);
    } else {
      res.status(404).send({ message: 'Pokémon not found' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET Pokémon image by ID
app.get('/pokemon-image/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const paddedId = id.toString().padStart(3, '0');
  const imageUrl = `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${paddedId}.png`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    if (response.status === 200) {
      res.set('Content-Type', 'image/png');
      res.status(200).send(Buffer.from(response.data, 'binary'));
    } else {
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

