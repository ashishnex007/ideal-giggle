import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {BrowserRouter as Router} from "react-router-dom";
// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';
// redux
import { Provider } from 'react-redux';
import store from './hooks/store.ts';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <React.StrictMode>
      <Provider store = {store}>
        <Router>
          <App />
        </Router>
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
)
