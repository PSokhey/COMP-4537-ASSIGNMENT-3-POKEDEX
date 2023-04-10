const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const connectDB = require('./db');
const jwt = require('jsonwebtoken');
const app = express();
const axios = require('axios');

const ACCESS_SECRET_KEY = 'access_secret_key_here';
const REFRESH_SECRET_KEY = 'refresh_secret_key_here';

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: ['http://localhost:3000', 'https://prabh-sokhey-pokedex.onrender.com'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

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


// ------------------- analytic route below for getting data-------------------

// POST to track when a Pokémon is clicked for details
app.post('/analytics/pokemon-clicked', authenticate, async (req, res) => {
  const { pokemonId } = req.body;
  const userId = req.user.userId;
  try {
    const event = new Event({ eventType: 'pokemon-clicked', userId, pokemonId });
    await event.save();
    res.status(200).send({ message: 'Pokemon click tracked', pokemonId, timestamp: event.timestamp });
  } catch (error) {
    res.status(500).send('Error tracking Pokemon click');
  }
});

// POST to track when a Pokémon image is generated
app.post('/analytics/pokemon-image-generated', authenticate, async (req, res) => {
  const { pokemonId } = req.body;
  const userId = req.user.userId;
  try {
    const event = new Event({ eventType: 'pokemon-image-generated', userId, pokemonId });
    await event.save();
    res.status(200).send({ message: 'Pokemon image generation tracked', pokemonId, timestamp: event.timestamp });
  } catch (error) {
    res.status(500).send('Error tracking Pokemon image generation');
  }
});


// ------------------- analytic route above for using data-------------------



// count the unique API users each day.
app.get('/analytics/unique-api-users', async (req, res) => {
  try {
    const uniqueApiUsers = await Event.aggregate([
      {
        $match: {
          eventType: { $in: ['pokemon-clicked', 'pokemon-image-generated'] },
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
        },
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: '$_id.day',
                },
              },
            },
          },
          count: 1,
        },
      },
    ]);

    res.status(200).send({ data: uniqueApiUsers });
  } catch (error) {
    res.status(500).send('Error fetching unique API users');
  }
});


// analytics for top users
app.get('/analytics/top-api-users', async (req, res) => {
  try {
    const topApiUsers = await Event.aggregate([
      {
        $match: {
          eventType: { $in: ['pokemon-clicked', 'pokemon-image-generated'] },
        },
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: { $arrayElemAt: ['$user.username', 0] },
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).send({ data: topApiUsers });
  } catch (error) {
    res.status(500).send('Error fetching top API users');
  }
});


// top users for each endpoint.
app.get('/analytics/top-users-per-endpoint', async (req, res) => {
  try {
    const topUsersPerEndpoint = await Event.aggregate([
      {
        $match: {
          eventType: { $in: ['pokemon-clicked', 'pokemon-image-generated'] },
        },
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            eventType: '$eventType',
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id.userId',
          eventType: '$_id.eventType',
          username: { $arrayElemAt: ['$user.username', 0] },
          count: 1,
        },
      },
      {
        $sort: { eventType: 1, count: -1 },
      },
    ]);

    res.status(200).send({ data: topUsersPerEndpoint });
  } catch (error) {
    res.status(500).send('Error fetching top users per endpoint');
  }
});

// getting errors by endpoint.
app.get('/analytics/errors-by-endpoint', async (req, res) => {
  try {
    const errorsByEndpoint = await Event.aggregate([
      {
        $match: {
          statusCode: { $gte: 400, $lt: 500 },
        },
      },
      {
        $group: {
          _id: {
            requestPath: '$requestPath',
            statusCode: '$statusCode',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          requestPath: '$_id.requestPath',
          statusCode: '$_id.statusCode',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).send({ data: errorsByEndpoint });
  } catch (error) {
    res.status(500).send('Error fetching 4xx errors by endpoint');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

