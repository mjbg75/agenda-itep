// src/components/AddCompromissoModal.js

import React, { useState, useEffect } from 'react';
import styles from './AddCompromissoModal.module.css';

function AddCompromissoModal({ isOpen, onClose, onCompromissoAdded, initialDate, onAddCompromisso }) {
  const [titulo, setTitulo] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState(''); // Estado para a descrição

  // Efeito para preencher a data inicial e resetar os campos
  useEffect(() => {
    if (isOpen && initialDate) {
      setDataEvento(initialDate);
    } else if (!isOpen) {
      // Resetar todos os campos quando o modal fecha
      setTitulo('');
      setDataEvento('');
      setHoraEvento('');
      setLocal('');
      setDescricao(''); // Resetar descrição
    }
  }, [isOpen, initialDate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    const compromissoData = {
      titulo,
      dataEvento,
      horaEvento,
      local,
      descricao, // Incluir a descrição nos dados a serem enviados
      tipo: "evento",
    };

    try {
      await onAddCompromisso(compromissoData);
      onClose();
      onCompromissoAdded();
    } catch (error) {
      console.error("Erro ou cancelamento na adição do compromisso:", error.message);
      // O erro já é propagado para o AgendaMainScreen que pode exibir um alerta se necessário
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2>Adicionar Novo Evento</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="titulo">Título:</label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dataEvento">Data:</label>
            <input
              type="date"
              id="dataEvento"
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="horaEvento">Hora:</label>
            <input
              type="time"
              id="horaEvento"
              value={horaEvento}
              onChange={(e) => setHoraEvento(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="local">Local:</label>
            <input
              type="text"
              id="local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
          {/* CAMPO DE DESCRIÇÃO ADICIONADO */}
          <div className={styles.formGroup}>
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows="4" // Define o número de linhas visíveis para o textarea
            ></textarea>
          </div>
          {/* FIM DO CAMPO DE DESCRIÇÃO */}
          <button type="submit" className={styles.submitButton}>
            Adicionar Evento
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCompromissoModal;