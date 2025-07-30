// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
// IMPORTAÇÃO DE FIRESTORE: APENAS UMA VEZ AQUI DO MÓDULO 'firebase/firestore'
import { getFirestore } from 'firebase/firestore';
// IMPORTAÇÕES DE AUTH: APENAS UMA VEZ AQUI DO MÓDULO 'firebase/auth'
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword // Mantenha se você usa esta função em LoginScreen
} from 'firebase/auth';

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

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Obtenha instâncias dos serviços e exporte-as
export const db = getFirestore(app);
export const auth = getAuth(app); // Garanta que 'auth' está sendo exportado aqui
