// 必要なモジュールとコンポーネントをインポート
import React, { useState } from 'react'; // ReactとuseStateフックをインポート
import axios from 'axios'; // HTTPリクエストを簡単に行うためのライブラリ
import GoogleButton from 'react-google-button'; // Googleのログインボタンコンポーネント
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"; // Google認証関連のProviderとHook

const GoogleAuthComponent = () => {
  // ステートの初期化
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const GoogleAuthComponentLogin = () => {
    // Googleログインの設定
    const login = useGoogleLogin({
      onSuccess: (codeResponse) => responseGoogle(codeResponse), // ログイン成功時の処理
      flow: "auth-code",
      scope: "email profile openid",
    });

    // ログイン成功時に実行される関数
    const responseGoogle = (codeResponse) => {
      console.log(JSON.stringify(codeResponse));
      // サーバーへアクセストークンをリクエスト
      axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/google`, { code: codeResponse.code })
        .then(response => {
          console.log(response);
          // ステートを更新
          setId(response.data.user.id);
          setEmail(response.data.user.email);
          setGivenName(response.data.user.given_name);
          setAccessToken(response.data.access_token);
          setRefreshToken(response.data.refresht_oken);
          setIsLoggedIn(true); // ログイン状態をtrueに設定
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
    };

    return (
      <>
        {!isLoggedIn ? (
          // ログインボタンを表示
          <GoogleButton
            onClick={() => { login(); }} // ボタンクリックでログイン処理を実行
          />
        ) : (
          // ログイン後の情報とログアウトボタンを表示
          <div>
            <p>Id: {id}</p>
            <p>Email: {email}</p>
            <p>GivenName: {givenName}</p>
            <p>AccessToken: {accessToken}</p>
            <p>RefreshToken: {refreshToken}</p>
            <button onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>
        )}
      </>
    );
  }

  // Google認証のProviderを設定してコンポーネントを返す
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleAuthComponentLogin />
    </GoogleOAuthProvider>
  );
}

// GoogleAuthComponentをエクスポート
export default GoogleAuthComponent;
