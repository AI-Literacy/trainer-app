import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initializeApp } from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyA3upnecQIXW5bqHUcrh7EBqbKfeQG0ank",
  authDomain: "ai-lit-trainer.firebaseapp.com",
  projectId: "ai-lit-trainer",
  storageBucket: "ai-lit-trainer.appspot.com",
  messagingSenderId: "1044287385311",
  appId: "1:1044287385311:web:b6229a42cd34814bd4036a"
};


initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
