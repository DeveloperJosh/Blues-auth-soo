const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Enable CORS for requests
app.use(cors({
  origin: 'https://auth.blue-dev.xyz', // Allow requests from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Necessary for sending credentials (Authorization header)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up view engine to render HTML pages
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Client ID, Secret, and SSO URL (should be provided by your SSO service)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SSO_URL = process.env.SSO_URL;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Home route (serves the main page)
app.get('/', (req, res) => {
  res.render('index');
});

// Login route (redirects to SSO login)
app.get('/login', (req, res) => {
  const loginUrl = `${SSO_URL}/sso/login?client_id=${CLIENT_ID}&callback_url=${encodeURIComponent(CALLBACK_URL)}&client_secret=${CLIENT_SECRET}`;
  res.redirect(loginUrl);
});

// Callback route (receives the JWT token from the SSO)
app.get('/callback', (req, res) => {
  const token = req.query.token;

  if (token) {
    // Render the saveToken view to save the token in local storage
    res.render('save', { token });
  } else {
    res.status(400).send('Error: No token received');
  }
});

// Logout route (just redirects to login as token is now stored in localStorage)
app.get('/logout', (req, res) => {
  res.redirect('/login');
});

// API route to fetch user data using the token from the Authorization header
app.get('/api/user/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const response = await axios.post(`${SSO_URL}/api/user/me`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
