// src/App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebaseConfig';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen'; // Assegure-se de que este é o nome correto do seu arquivo SignUpScreen
import AgendaMainScreen from './AgendaMainScreen';

import styles from './App.module.css'; // Este arquivo CSS ainda existe, mas será menos usado

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserName(userDocSnap.data().name || '');
          } else {
            console.log("Documento do usuário não encontrado no Firestore!");
            setUserName(user.email);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário:", error);
          setUserName(user.email);
        }
      } else {
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []); // auth e db não precisam ser dependências se são importados diretamente

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsSigningUp(false);
      setUserName('');
    } catch (error) {
      console.error("Erro ao fazer logout:", error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Carregando autenticação...</p>
      </div>
    );
  }

  if (currentUser) {
    return (
      // Removido o mainAppContainer e o cabeçalho.
      // AgendaMainScreen agora é renderizado diretamente e
      // receberá as props necessárias para o rodapé.
      <AgendaMainScreen
        currentUser={currentUser}
        userName={userName}
        onLogout={handleLogout} // Passa a função de logout como prop
      />
    );
  }

  return (
    <div>
      {isSigningUp ? (
        <SignUpScreen
          onSignUpSuccess={() => {
            alert('Cadastro realizado com sucesso! Faça login agora.');
            setIsSigningUp(false);
          }}
          onSwitchToLogin={() => setIsSigningUp(false)}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={() => {
            // A lógica de busca de nome já está no useEffect do App.js
          }}
          onSwitchToSignUp={() => setIsSigningUp(true)}
        />
      )}
    </div>
  );
}

export default App;