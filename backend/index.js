// 必要なモジュールをインポート
const serverless = require('serverless-http'); // serverless-httpモジュールを利用することで、AWS Lambdaと連携しやすくなる
const express = require('express'); // Express.jsを利用してAPIサーバーを構築
const cors = require('cors'); // CORS制御を実現するためのモジュール
const qs = require('qs'); // クエリストリングを操作するためのモジュール
const axios = require('axios'); // HTTPリクエストを簡単に行うためのライブラリ

const app = express();

// CORSの設定
const corsOptions = {
  origin: process.env.FRONT_URL, // フロントエンドのURLを環境変数から取得
  credentials: true // クレデンシャルを含むリクエストを許可する
};

// CORS設定とJSONパーサーをミドルウェアとして適用
app.use(cors(corsOptions));
app.use(express.json());

// Google認証用のエンドポイント
app.post('/api/v1/auth/google', async (req, res) => {
  const { code } = req.body;

  // codeがリクエストに含まれていない場合は400エラーを返す
  if (code === undefined) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  let accessToken = '';
  let refreshToken = '';

  // Google OAuthの認証情報を設定
  const params = {
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.FRONT_URL,
    grant_type: 'authorization_code'
  }

  // Googleにアクセストークンをリクエスト
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

  // 取得したアクセストークンを利用してユーザー情報を取得
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

  // ユーザー情報とトークンをクライアントに返す
  return res.status(200).json({
    user: user, // ユーザ情報
    access_token: accessToken, // アクセストークン
    refresh_token: refreshToken, // リフレッシュトークン
    status: 200 // ステータスコード
  });
});

// サーバーレスアプリケーションとしてエクスポート
module.exports.handler = serverless(app);
