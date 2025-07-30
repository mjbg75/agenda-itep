// src/components/EditEventModal.js

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Assegure-se de que react-modal está instalado: npm install react-modal
import styles from '../AgendaMainScreen.module.css'; // Ajuste o caminho se necessário

// Definir o elemento app para o react-modal (ajusta para sua raiz da aplicação, geralmente '#root')
Modal.setAppElement('#root');

const EditEventModal = ({ isOpen, onClose, eventData, onUpdateEvent, onDeleteEvent }) => {
  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    dataEvento: '',
    horaEvento: '',
    local: '',
    descricao: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // UseEffect para preencher o formulário quando o modal é aberto ou eventData muda
  useEffect(() => {
    if (isOpen && eventData) {
      setFormData({
        id: eventData.id || '',
        titulo: eventData.titulo || '',
        dataEvento: eventData.dataEvento || '',
        horaEvento: eventData.horaEvento || '',
        local: eventData.local || '',
        descricao: eventData.descricao || ''
      });
      setError(''); // Limpa erros anteriores
    }
  }, [isOpen, eventData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onUpdateEvent(formData.id, {
        titulo: formData.titulo,
        dataEvento: formData.dataEvento,
        horaEvento: formData.horaEvento,
        local: formData.local,
        descricao: formData.descricao
      });
      onClose(); // Fecha o modal após o sucesso
    } catch (err) {
      console.error("Erro ao atualizar evento:", err);
      setError(err.message || 'Erro ao atualizar o evento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setIsLoading(true);
      setError('');
      try {
        await onDeleteEvent(formData.id);
        onClose(); // Fecha o modal após a exclusão
      } catch (err) {
        console.error("Erro ao excluir evento:", err);
        setError(err.message || 'Erro ao excluir o evento.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Nenhuma necessidade de formatarDataBrasileira aqui se ela for usada apenas para exibição em AgendaMainScreen.js.
  // Se você precisasse dela aqui (ex: para exibir a data dentro do modal), você a definiria ou importaria aqui.
  // Como o erro do ESLint indicou que não era usada, ela foi removida deste contexto.

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      contentLabel="Editar Evento"
    >
      <div className={styles.modalHeader}>
        <h2>Editar Evento</h2>
        <button className={styles.modalCloseButton} onClick={onClose}>&times;</button>
      </div>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <label className={styles.formLabel}>
          Título:
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </label>
        <label className={styles.formLabel}>
          Data:
          <input
            type="date"
            name="dataEvento"
            value={formData.dataEvento}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </label>
        <label className={styles.formLabel}>
          Hora:
          <input
            type="time"
            name="horaEvento"
            value={formData.horaEvento}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </label>
        <label className={styles.formLabel}>
          Local:
          <input
            type="text"
            name="local"
            value={formData.local}
            onChange={handleChange}
            className={styles.formInput}
          />
        </label>
        <label className={styles.formLabel}>
          Descrição:
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className={styles.formTextArea}
            rows="4"
          />
        </label>

        <div className={styles.modalActions}>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            type="button"
            className={`${styles.submitButton} ${styles.deleteButton}`} // Adicione um estilo para o botão de exclusão se quiser
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditEventModal;