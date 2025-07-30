// src/LoginScreen.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import styles from './LoginScreen.module.css';

function LoginScreen({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      let errorMessage = "Erro ao fazer login. Verifique suas credenciais.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Email ou senha inválidos.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Formato de email inválido.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "Muitas tentativas de login falhas. Tente novamente mais tarde.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}> {/* formCard agora engloba o header */}
        <div className={styles.header}>
          <h1 className={styles.title}>SIGEA</h1>
          <p className={styles.subtitle}>Sistema de Gerenciamento de Agenda</p>
        </div>
        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          {error && <p className={styles.errorText}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
        <p className={styles.switchText}>
          Não tem conta?{' '}
          <span onClick={onSwitchToSignUp} className={styles.switchLink}>
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;