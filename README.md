# Blue-Auth SSO Example

This is an example of how to use the Blue-Auth SSO service to authenticate users in a web application.

## Getting Started

To get started, you will need to create an account on the Blue-Auth website and create a new application. You will need the client ID and client secret for your application.

## How to use 

### 1. **Create an Account on Blue-Auth**
   - Visit the [Blue-Auth website](#) and sign up for an account.
   - Once registered, log in to your Blue-Auth account.

### 2. **Create a New Application**
   - In your Blue-Auth dashboard, navigate to the "Home" section.
   - Click on "Create New Application" and fill in the required details such as your application name and description.
   - After creating the application, you will be provided with a **Client ID** and **Client Secret**. Make sure to keep these credentials secure as they are essential for integrating SSO with your application. (These will be emailed to you, so make sure to check your email)

### 3. **Set Up Redirect URLs**
   - In your Blue-Auth SSO setup process, you will be provided with a callback URL that will be used to authenticate users on your site.
   - Example: `https://yourwebsite.com/callback`.

### 4. **Integrate Blue-Auth SSO in Your Web Application**

#### 4.1 **Backend Setup**

1. **Install Required Dependencies**
   - If you're using Node.js and Express, install the necessary packages:
     ```bash
     npm install express axios cors dotenv
     ```

2. **Create an Express Server**
   - Set up a basic Express server to handle the authentication process.
   - Use the following example as a starting point:

   ```javascript
   const express = require('express');
   const cors = require('cors');
   const axios = require('axios');
   const path = require('path');
   require('dotenv').config();

   const app = express();

   // Enable CORS for requests from localhost:3000
   app.use(cors({
     origin: 'http://localhost:3000',
     methods: ['GET', 'POST'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   }));

   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));

   // Set up view engine to render HTML pages
   app.set('views', path.join(__dirname, 'views'));
   app.set('view engine', 'ejs');

   // Client ID, Secret, and SSO URL
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

     axios.get(`${SSO_URL}/api/user/me`, {
       headers: {
         Authorization: `Bearer ${token}`
       }
     })
       .then(response => {
         res.render('index', { user: response.data });
       })
       .catch(error => {
         console.error('Error fetching user data:', error);
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
       res.cookie('token', token, { httpOnly: true, secure: true });
       res.redirect('/');
     } else {
       res.status(400).send('Error: No token received');
     }
   });

   // Start the server
   const PORT = process.env.PORT || 4000;
   app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
   });

3. **Environment Variables**
   - Create a `.env` file in your project directory and add the following environment variables:
    ```plaintext
    CLIENT_ID=YOUR_CLIENT_ID
    CLIENT_SECRET=YOUR_CLIENT_SECRET`
    SSO_URL=auth.blue-dev.xyz (no backslash)
    CALLBACK_URL=YOUR_CALLBACK_URL (e.g., http://localhost:4000/callback no backslash)
    ```