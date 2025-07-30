// src/components/ConfirmPasswordModal.js

import React, { useState } from 'react';
import styles from './AddCompromissoModal.module.css';

function ConfirmPasswordModal({ isOpen, onClose, onConfirm }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password.trim() === '') {
      setError('A senha não pode estar vazia.');
      return;
    }
    onConfirm(password);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={() => { onClose(); setPassword(''); setError(''); }}>&times;</button>
        <h2>Confirmar Senha</h2>
        <p>Para sua segurança, por favor, digite sua senha para continuar.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">Senha:</label>
            <input
              type="password"
              id="confirm-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.errorMessage} style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <div className={styles.actionButtonGroup}>
            {/* MODIFICAÇÃO AQUI: De styles.addButton para styles.submitButton */}
            <button type="button" className={styles.submitButton} onClick={() => { onClose(); setPassword(''); setError(''); }}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfirmPasswordModal;