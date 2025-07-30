// src/services/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0ARt6AEBTWmFtu4oRXiAj3FhJnsBWcW0", // Seu API Key
  authDomain: "agenda-itep-app.firebaseapp.com",
  projectId: "agenda-itep-app",
  storageBucket: "agenda-itep-app.firebasestorage.app",
  messagingSenderId: "914220966845",
  appId: "1:914220966845:web:316b7b9763ac1277a7a8d4",
  measurementId: "G-XQ4D3XPYY8"
};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Instância de autenticação

// Exporte as instâncias que serão usadas em outros arquivos
export { db, auth };
