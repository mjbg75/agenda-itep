import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import styles from './SignUpScreen.module.css';

function SignUpScreen({ onSignUpSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Conta Auth criada. UID:", user.uid, "Email:", user.email);

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        name: name,
        cpf: cpf,
        createdAt: new Date(),
      });

      console.log("Documento do usuário salvo no Firestore para UID:", user.uid);

      onSignUpSuccess();
    } catch (err) {
      console.error("Erro no cadastro:", err.code, err.message);
      let errorMessage = "Ocorreu um erro no cadastro. Tente novamente.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Este email já está em uso.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "A senha é muito fraca (mínimo de 6 caracteres).";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "O formato do email é inválido.";
      } else if (err.code === 'permission-denied' || err.code === 'unauthenticated') {
          errorMessage = "Permissão negada para salvar dados. Verifique as regras do Firestore.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Cadastro</h2>
      <form onSubmit={handleSignUp} className={styles.form}>
        <input
          type="text"
          placeholder="Nome Completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="text"
          placeholder="CPF (apenas números)"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className={styles.input}
        />
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
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Confirme a Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.input}
        />
        {error && <p className={styles.errorText}>{error}</p>}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p className={styles.switchText}>
        Já tem uma conta?{' '}
        <span onClick={onSwitchToLogin} className={styles.switchLink}>
          Login
        </span>
      </p>
    </div>
  );
}

export default SignUpScreen;