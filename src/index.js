const express = require('express');
const cors = require('cors');
const path = require('path');
const SSOClient = require('./lib/ssolib'); 
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const ssoClient = new SSOClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    ssoUrl: process.env.SSO_URL,
    callbackUrl: process.env.CALLBACK_URL,
});

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

// Home route (serves the main page)
app.get('/', (req, res) => {
  res.render('index');
});

// Login route (redirects to SSO login)
app.get('/login', (req, res) => {
  const loginUrl = ssoClient.getLoginUrl();
  res.redirect(loginUrl);
});

// Callback route (receives the JWT token from the SSO)
app.get('/callback', (req, res) => {
  try {
    const token = ssoClient.handleCallback(req.query);
    const saveTokenPage = ssoClient.renderSaveTokenPage(token);
    res.send(saveTokenPage);
  } catch (error) {
    res.status(400).send('Error: ' + error.message);
  }
});

// API route to fetch user data using the token from the Authorization header
app.get('/api/user/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const userData = await ssoClient.fetchUserData(token);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

// Logout route (just redirects to login as token is now stored in localStorage)
app.get('/logout', (req, res) => {
  res.redirect('/login');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
