const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Enable CORS for requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent with requests
}));

// Add middleware to parse cookies
app.use(cookieParser());

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

// Home route (simulates a protected page)
app.get('/', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  // This route fetches user data from the SSO service using the token (It requires read permissions)
  axios.post(`${SSO_URL}/api/user/me`, {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => {
      res.render('index', { user: response.data });
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      res.clearCookie('token'); // Clear the cookie if the token is invalid
      res.redirect('/login');
    });
});

// Login route (redirects to SSO login)
app.get('/login', (req, res) => {
  const loginUrl = `${SSO_URL}/sso/login?client_id=${CLIENT_ID}&callback_url=${encodeURIComponent(CALLBACK_URL)}&client_secret=${CLIENT_SECRET}`;
  res.redirect(loginUrl);
});

// Callback route (receives the JWT token)
app.get('/callback', (req, res) => {
  const token = req.query.token;

  if (token) {
    // Save the token in a cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { httpOnly: true, secure: isProduction, sameSite: 'Strict' });
    res.redirect('/');
  } else {
    res.status(400).send('Error: No token received');
  }
});

// Logout route (clears the token cookie)
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
