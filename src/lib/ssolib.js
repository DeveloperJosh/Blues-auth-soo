const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class SSOClient {
  constructor({ clientId, clientSecret, ssoUrl, callbackUrl }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.ssoUrl = ssoUrl;
    this.callbackUrl = callbackUrl;
  }

  getLoginUrl() {
    return `${this.ssoUrl}/sso/login?client_id=${this.clientId}&callback_url=${encodeURIComponent(this.callbackUrl)}`;
  }

  handleCallback(query) {
    const token = query.token;
    console.log('Token:', token);
    if (!token) {
      throw new Error('No token received');
    }
    return token;
  }

  async fetchUserData(token) {
    try {
      const response = await axios.post(`${this.ssoUrl}/api/user/me`, {
        client_id: this.clientId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Client-Secret': this.clientSecret,
        },
      });
      console.log('User data:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user data: ${error.response ? error.response.data.message : error.message}`);
    }
  }

  renderSaveTokenPage(token) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Save Token</title>
        <script>
          window.onload = function () {
            localStorage.setItem('token', '${token}');
            window.location.href = '/';
          };
        </script>
      </head>
      <body>
        <p>Saving your session securely...</p>
      </body>
      </html>
    `;
  }
}

module.exports = SSOClient;
