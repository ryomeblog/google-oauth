const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const qs = require('qs');
const axios = require('axios');

const app = express();

// CORSオプション
const corsOptions = {
  origin: process.env.FRONT_URL,
  credentials: true
};

// CORS設定を適用
app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/v1/auth/google', async (req, res) => {
  const { code } = req.body;

  if (code === undefined) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  let accessToken = '';
  let refreshToken = '';
  const params = {
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.FRONT_URL,
    grant_type: 'authorization_code'
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.google.com/o/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(params)
    });
    console.log(response.data);
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  let user = {};
  try {
    const response = await axios({
      method: 'get',
      url: 'https://www.googleapis.com/oauth2/v1/userinfo',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });
    console.log(response.data);
    user = response.data;
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(200).json({
    user: user,
    access_token: accessToken,
    refresht_oken: refreshToken,
    status: 200
  });
});


module.exports.handler = serverless(app);
