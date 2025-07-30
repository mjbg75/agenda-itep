// src/components/EditEventModal.js

import React, { useState, useEffect } from 'react';
import styles from './AddCompromissoModal.module.css'; // Reutiliza os estilos de modal
import ConfirmPasswordModal from './ConfirmPasswordModal'; // Importa o modal de confirmação de senha
import { auth } from '../services/firebaseConfig'; // Importa 'auth' do Firebase
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Importa funções de reautenticação

function EditEventModal({ isOpen, onClose, eventData, onUpdateEvent, onDeleteEvent }) {
  // Estados para os campos do formulário
  const [titulo, setTitulo] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [horaEvento, setHoraEvento] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');

  // Estados para controlar o modal de confirmação de senha
  const [isConfirmPasswordModalOpen, setIsConfirmPasswordModalOpen] = useState(false);
  const [actionToPerform, setActionToPerform] = useState(null); // 'update' ou 'delete'

  // Efeito para preencher os campos do formulário quando o modal abre ou os dados do evento mudam
  // E para limpar os campos quando o modal fecha
  useEffect(() => {
    if (isOpen && eventData) {
      setTitulo(eventData.titulo || '');
      setDataEvento(eventData.dataEvento || '');
      setHoraEvento(eventData.horaEvento || '');
      setLocal(eventData.local || '');
      setDescricao(eventData.descricao || '');
    } else if (!isOpen) {
      // Limpa os campos ao fechar o modal
      setTitulo('');
      setDataEvento('');
      setHoraEvento('');
      setLocal('');
      setDescricao('');
      // Garante que o modal de senha também fecha e reseta estados auxiliares
      setIsConfirmPasswordModalOpen(false);
      setActionToPerform(null);
    }
  }, [isOpen, eventData]); // Dependências: re-executa quando isOpen ou eventData mudam

  // Função para reautenticar o usuário com a senha fornecida
  const reauthenticateUser = async (password) => {
    const user = auth.currentUser;
    // Verifica se há um usuário logado e se ele tem um e-mail (necessário para EmailAuthProvider)
    if (!user || !user.email) {
      throw new Error("Usuário não logado ou e-mail indisponível para reautenticação.");
    }

    try {
      // Cria uma credencial de e-mail e senha
      const credential = EmailAuthProvider.credential(user.email, password);
      // Tenta reautenticar o usuário com a credencial
      await reauthenticateWithCredential(user, credential);
      console.log("Usuário reautenticado com sucesso!");
      return true; // Retorna true se a reautenticação for bem-sucedida
    } catch (error) {
      console.error("Erro na reautenticação:", error);
      let errorMessage = "Erro ao confirmar senha. Verifique se a senha está correta.";
      // Mensagens de erro mais amigáveis baseadas nos códigos de erro do Firebase
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Senha incorreta.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Usuário não encontrado.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Credenciais inválidas. Tente novamente.";
      }
      alert(errorMessage); // Exibe um alerta com a mensagem de erro
      throw new Error(errorMessage); // Lança o erro para a função chamadora (handlePasswordConfirmation)
    }
  };

  // Handler para o envio do formulário de atualização (primeiro passo: abre o modal de senha)
  const handleUpdate = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página
    setActionToPerform('update'); // Define que a ação a ser realizada é uma atualização
    setIsConfirmPasswordModalOpen(true); // Abre o modal de confirmação de senha
  };

  // Handler para o clique no botão de exclusão (primeiro passo: abre o modal de senha)
  const handleDelete = async () => {
    setActionToPerform('delete'); // Define que a ação a ser realizada é uma exclusão
    setIsConfirmPasswordModalOpen(true); // Abre o modal de confirmação de senha
  };

  // Função que é chamada pelo ConfirmPasswordModal após a senha ser submetida
  const handlePasswordConfirmation = async (password) => {
    try {
      await reauthenticateUser(password); // Tenta reautenticar o usuário com a senha fornecida
      setIsConfirmPasswordModalOpen(false); // Fecha o modal de confirmação de senha se a reautenticação for bem-sucedida

      // Se a reautenticação for bem-sucedida, prossegue com a ação original (update ou delete)
      if (actionToPerform === 'update') {
        // Prepara os dados atualizados
        const updatedData = {
          titulo,
          dataEvento,
          horaEvento,
          local,
          descricao,
        };
        // Chama a função onUpdateEvent passada via props para atualizar no Firestore
        await onUpdateEvent(eventData.id, updatedData);
        onClose(); // Fecha o modal de edição principal
      } else if (actionToPerform === 'delete') {
        // Chama a função onDeleteEvent passada via props para excluir do Firestore
        // A confirmação `window.confirm` foi removida, pois a confirmação de senha é suficiente.
        await onDeleteEvent(eventData.id);
        onClose(); // Fecha o modal de edição principal
      }
      setActionToPerform(null); // Reseta a ação após a conclusão
    } catch (error) {
      // Erro já foi tratado e alertado dentro de `reauthenticateUser`
      // Apenas registra aqui para depuração; o modal de senha permanecerá aberto para nova tentativa.
      console.error("Erro após reautenticação:", error.message);
    }
  };

  // Função auxiliar para formatar a data de AAAA-MM-DD para DD/MM/AAAA para exibição
  const formatarDataBrasileira = (dataAmericana) => {
    if (!dataAmericana) return '';
    const [ano, mes, dia] = dataAmericana.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Não renderiza o modal se não estiver aberto ou se não houver dados de evento
  if (!isOpen || !eventData) return null;

  return (
    <>
      {/* Overlay e conteúdo do modal de edição principal */}
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          {/* Botão de fechar o modal */}
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          <h2>Editar/Excluir Evento</h2>
          {/* Formulário de edição */}
          <form onSubmit={handleUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="edit-titulo">Título:</label>
              <input
                type="text"
                id="edit-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-dataEvento">Data:</label>
              <input
                type="date"
                id="edit-dataEvento"
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-horaEvento">Hora:</label>
              <input
                type="time"
                id="edit-horaEvento"
                value={horaEvento}
                onChange={(e) => setHoraEvento(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-local">Local:</label>
              <input
                type="text"
                id="edit-local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="edit-descricao">Descrição:</label>
              <textarea
                id="edit-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="4"
              ></textarea>
            </div>
            {/* Grupo de botões de ação (Salvar e Excluir) */}
            <div className={styles.actionButtonGroup}>
              <button type="submit" className={styles.submitButton}>
                Salvar Alterações
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                Excluir Evento
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmação de senha (renderizado condicionalmente) */}
      <ConfirmPasswordModal
        isOpen={isConfirmPasswordModalOpen} // Controla a visibilidade
        onClose={() => {
          setIsConfirmPasswordModalOpen(false); // Fecha o modal de senha
          setActionToPerform(null); // Reseta a ação pendente
        }}
        onConfirm={handlePasswordConfirmation} // Passa a função que lida com a senha confirmada
      />
    </>
  );
}

export default EditEventModal;