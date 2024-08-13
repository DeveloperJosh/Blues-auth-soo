# Blue-Auth SSO Integration Guide

If you are looking for the docs, you can find them [here](https://wiki.mutable.ai/DeveloperJosh/Blues-auth-sso).

This guide provides instructions on how to integrate the Blue-Auth SSO (Single Sign-On) service into your web application. By following this guide, you will be able to authenticate users through Blue-Auth and retrieve user data securely.

## Getting Started

To begin, you need to create an account on the Blue-Auth website and register a new application to obtain the required credentials: **Client ID** and **Client Secret**.

## How to Use

### 1. **Create an Account on Blue-Auth**
- Visit the [Blue-Auth website](https://auth.blue-dev.xyz) and sign up for an account.
- After registering, log in to your Blue-Auth account.

### 2. **Create a New Application**
- Navigate to the "Home" section of your Blue-Auth dashboard.
- Click on "Create New Application" and fill out the required details such as your application's name and description.
- Once your application is created, you will be given a **Client ID** and **Client Secret**. Make sure to keep these credentials safe as they are required to integrate SSO with your application.

### 3. **Set Up Redirect URLs**
- During the setup process in Blue-Auth, specify the callback URL for your application. This URL is where users will be redirected after authentication.
- Example of a callback URL: `https://yourwebsite.com/callback`.

### 4. **Make Requests to Blue-Auth**

To access protected resources from Blue-Auth, you need to include the following in every request:

- **JWT Token**: The token provided to your application after a user authenticates.
- **Client ID**: Your application's unique identifier.
- **Client Secret**: Your application's secret key.

### Example Request in Node.js

Here is a simple example of how to make a request to Blue-Auth to retrieve user data using Node.js:

```javascript
const axios = require('axios');

const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const JWT_TOKEN = 'user_jwt_token'; // This is obtained after user authentication

axios.post('https://auth.blue-dev.xyz/api/user/me', {
  client_id: CLIENT_ID,
}, {
  headers: {
    Authorization: `Bearer ${JWT_TOKEN}`,
    "X-Client-Secret": CLIENT_SECRET,
  }
})
.then(response => {
  console.log('User Data:', response.data);
})
.catch(error => {
  console.error('Error fetching user data:', error.response.data);
});

```

### In this example:

- Replace your_client_id and your_client_secret with the actual values provided by Blue-Auth.
- Replace user_jwt_token with the JWT token you receive after the user authenticates.

### 5. Important Notes
The client_id and client_secret must be kept secure and should not be exposed in the client-side code.
Ensure that your requests are made over HTTPS to protect the transmitted data.

### 6. Can i use Blue-Auth with my existing user database?
Yes, you can integrate Blue-Auth with your existing user database by mapping the user data retrieved from Blue-Auth to your database schema. You can use the user's email address or unique identifier to match the user data from Blue-Auth with your database records.

### 7. How can i try Blue-Auth SSO?

You can make your own client using the Blue-Auth API, or you can use the client provided in the this repository. To use the client, follow these steps:

- Clone the repository to your local machine.
- Run `npm install` to install the required dependencies.
- Create a `.env` file in the root directory of the project.
- Add the following environment variables to the `.env` file:

```plaintext
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
SSO_URL=https://auth.blue-dev.xyz
REDIRECT_URI=http://localhost:3000/callback
```

- Run `npm start` to start the client application.
- Open your browser and navigate to `http://localhost:3000` to test the Blue-Auth SSO integration.

# Conclusion
By following these steps, you can securely integrate Blue-Auth SSO into your web application, allowing you to authenticate users and retrieve their data using the provided API.