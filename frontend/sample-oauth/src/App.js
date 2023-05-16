import React, { useState } from 'react';
import axios from 'axios';
import GoogleButton from 'react-google-button'
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

const GoogleAuthComponent = () => {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const GoogleAuthComponentLogin = () => {
    const login = useGoogleLogin({
      onSuccess: (codeResponse) => responseGoogle(codeResponse),
      flow: "auth-code",
      scope: "email profile openid",
    });

    const responseGoogle = (codeResponse) => {
      console.log(JSON.stringify(codeResponse));
      axios.post(`${process.env.REACT_APP_API_URL}/api/v1/auth/google`, { code: codeResponse.code })
        .then(response => {
          console.log(response);
          setId(response.data.user.id);
          setEmail(response.data.user.email);
          setGivenName(response.data.user.given_name);
          setAccessToken(response.data.access_token);
          setRefreshToken(response.data.refresht_oken);
          setIsLoggedIn(true);
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
    };

    return (
      <>
        {!isLoggedIn ? (
          <GoogleButton
            onClick={() => { login(); }}
          />
        ) : (
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
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleAuthComponentLogin />
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthComponent;