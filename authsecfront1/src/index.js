import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Modal from 'react-modal';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


Modal.setAppElement('#root');


const clientId ="86090769905-dqdmq8kn19frc6a3ad8rhi2aqmkakopj.apps.googleusercontent.com"
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="12030874472-fk8qrfa64n3442orkv28moqolng600v6.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
