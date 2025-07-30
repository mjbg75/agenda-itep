// src/AgendaMainScreen.js

import React, { useState, useEffect } from 'react';
// Importe as funções do firestoreService
import {
  subscribeToEventos,
  subscribeToProcessos,
  addCompromisso,
  checkExistingEvent,
  updateCompromisso, // Importar função de atualização
  deleteCompromisso  // Importar função de exclusão
} from './services/firestoreService';
import AddCompromissoModal from './components/AddCompromissoModal';
import EditEventModal from './components/EditEventModal'; // Importar o modal de edição
import styles from './AgendaMainScreen.module.css'; // Mantenha este CSS
import CalendarComponent from './components/CalendarComponent/CalendarComponent'; // Certifique-se de que este caminho está correto

// REMOVIDO: import logosInstitucionais from './assets/images/logos-institucionais.png';

// Função auxiliar para formatar a data de AAAA-MM-DD para DD/MM/AAAA (para exibição)
const formatarDataBrasileira = (dataAmericana) => {
  if (!dataAmericana) return '';
  const [ano, mes, dia] = dataAmericana.split('-');
  return `${dia}/${mes}/${ano}`;
};

// Função auxiliar para obter a data de hoje no formato AAAA-MM-DD (para comparação e pré-preenchimento)
const getTodayAmericanFormat = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Mês + 1 porque é de 0 a 11
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AgendaMainScreen({ currentUser, userName, onLogout }) {
  const [eventos, setEventos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddCompromissoModalOpen, setIsAddCompromissoModalOpen] = useState(false);
  // Estado para armazenar a data selecionada no calendário (formato AAAA-MM-DD)
  // Inicializa com a data de hoje
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayAmericanFormat());

  // ESTADOS PARA O MODAL DE EDIÇÃO/EXCLUSÃO
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [currentEventToEdit, setCurrentEventToEdit] = useState(null); // Armazena o evento a ser editado

  useEffect(() => {
    let unsubscribeEventos;
    let unsubscribeProcessos;

    const setupListeners = async () => {
      try {
        // Subscreve para atualizações em tempo real dos eventos
        unsubscribeEventos = subscribeToEventos((data) => {
          setEventos(data);
        });

        // Subscreve para atualizações em tempo real dos processos
        unsubscribeProcessos = subscribeToProcessos((data) => {
          setProcessos(data);
          setLoading(false); // Define loading como falso após carregar os dados iniciais
        });

      } catch (err) {
        console.error("Erro ao configurar listeners:", err);
        setError("Erro ao carregar dados. Verifique suas permissões ou conexão.");
        setLoading(false);
      }
    };

    setupListeners();

    // Função de limpeza: será executada quando o componente for desmontado
    return () => {
      if (unsubscribeEventos) unsubscribeEventos();
      if (unsubscribeProcessos) unsubscribeProcessos();
    };
  }, []);

  // FILTROS:
  // Eventos para o dia selecionado no calendário
  const eventosDoDiaSelecionado = eventos.filter(item => {
    if (!item.dataEvento) return false;
    return item.dataEvento === selectedCalendarDate;
  }).sort((a, b) => {
    // Ordena os eventos do dia por hora
    const timeA = a.horaEvento || '00:00'; // Assume 00:00 se a hora não estiver definida
    const timeB = b.horaEvento || '00:00';
    return timeA.localeCompare(timeB); // Compara strings de hora
  });

  // Processos para o dia selecionado no calendário
  const processosDoDiaSelecionado = processos.filter(item => {
    if (!item.dataEvento) return false; // Assumindo que processos também têm dataEvento
    return item.dataEvento === selectedCalendarDate;
  }).sort((a, b) => {
      // Ordena processos, por exemplo, por número de processo ou data de criação
      return (a.numeroProcesso || '').localeCompare(b.numeroProcesso || ''); // Exemplo: ordena por número do processo
  });

  // Handler para quando um dia é clicado no CalendarComponent
  const handleCalendarDayClick = (dateString) => {
    setSelectedCalendarDate(dateString);
  };

  // Função que será passada para o AddCompromissoModal para lidar com a adição
  const handleAddCompromissoFromModal = async (compromissoData) => {
    try {
      const { dataEvento, horaEvento } = compromissoData;

      // 1. Verificar conflito de eventos na mesma data e hora
      const hasConflict = await checkExistingEvent(dataEvento, horaEvento);

      if (hasConflict) {
        // Exibe um alerta e pede confirmação ao usuário
        const confirmAdd = window.confirm(
          `Já existe um evento marcado para ${formatarDataBrasileira(dataEvento)} às ${horaEvento}.\n\nDeseja adicionar este novo evento mesmo assim?`
        );
        if (!confirmAdd) {
          // Se o usuário clicar em "Cancelar", lança um erro para parar o processo
          throw new Error("Adição de evento cancelada pelo usuário.");
        }
      }

      // 2. Adicionar o compromisso ao Firestore
      const result = await addCompromisso(compromissoData);
      if (result.success) {
        console.log("Evento adicionado com sucesso:", result.id);
        // O `onSnapshot` no useEffect já cuidará da atualização do estado `eventos`.
      } else {
        console.error("Falha ao adicionar evento:", result.error);
        alert(`Erro ao adicionar evento: ${result.error}`);
        throw new Error(result.error); // Lança o erro para ser capturado no modal
      }
    } catch (error) {
      console.error("Erro no processamento do evento (handleAddCompromissoFromModal):", error);
      // Re-lança o erro para o modal saber que a operação não foi bem-sucedida
      throw error;
    }
  };

  // NOVO: Função para abrir o modal de edição ao clicar em um evento
  const handleEditClick = (event) => {
    setCurrentEventToEdit(event); // Define qual evento será editado
    setIsEditEventModalOpen(true); // Abre o modal
  };

  // NOVO: Função para lidar com a atualização de um evento (chamada do EditEventModal)
  const handleUpdateEvent = async (id, updatedData) => {
    try {
      const { dataEvento, horaEvento } = updatedData;

      // Verifica conflito, excluindo o próprio evento que está sendo editado (passando o ID)
      const hasConflict = await checkExistingEvent(dataEvento, horaEvento, id);

      if (hasConflict) {
        const confirmUpdate = window.confirm(
          `Já existe outro evento marcado para ${formatarDataBrasileira(dataEvento)} às ${horaEvento}.\n\nDeseja atualizar este evento mesmo assim?`
        );
        if (!confirmUpdate) {
          throw new Error("Atualização de evento cancelada pelo usuário.");
        }
      }

      const result = await updateCompromisso(id, updatedData);
      if (result.success) {
        console.log("Evento atualizado com sucesso:", id);
        // A UI será atualizada automaticamente via onSnapshot
      } else {
        console.error("Falha ao atualizar evento:", result.error);
        alert(`Erro ao atualizar evento: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Erro ao atualizar evento (handleUpdateEvent):", error);
      throw error;
    }
  };

  // NOVO: Função para lidar com a exclusão de um evento (chamada do EditEventModal)
  const handleDeleteEvent = async (id) => {
    try {
      const result = await deleteCompromisso(id);
      if (result.success) {
        console.log("Evento excluído com sucesso:", id);
        // A UI será atualizada automaticamente via onSnapshot
      } else {
        console.error("Falha ao excluir evento:", result.error);
        alert(`Erro ao excluir evento: ${result.error}`);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Erro ao excluir evento (handleDeleteEvent):", error);
      throw error;
    }
  };


  // Renderiza uma mensagem de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <p className={styles.loadingText}>Carregando dados...</p>
      </div>
    );
  }

  // Renderiza o conteúdo principal da agenda
  return (
    <div className={styles.mainContainer}>
      {/* Exibe mensagem de erro, se houver */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.contentWrapper}>
        {/* COLUNA 1: Calendário */}
        <div className={`${styles.column} ${styles.calendarColumn}`}>
          <h2 className={styles.columnTitle}>CALENDÁRIO</h2>
          {/* Adicione um wrapper para o CalendarComponent para melhor controle de estilo */}
          <div className={styles.calendarComponentContainer}> {/* ESTA DIV AJUDA NO ALINHAMENTO */}
            <CalendarComponent
              events={eventos} // Passa todos os eventos para o calendário destacar os dias
              onDaySelect={handleCalendarDayClick} // Callback para quando um dia é clicado
              selectedDate={selectedCalendarDate} // A data atualmente selecionada no calendário
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.submitButton} // ALTERADO: Usando submitButton para padronizar cor e estilo
              onClick={() => {
                setIsAddCompromissoModalOpen(true); // Abre o modal de adicionar evento
              }}
            >
              Adicionar Evento
            </button>
            <button className={styles.submitButton}>Adicionar Processo</button> {/* ALTERADO: Usando submitButton */}
          </div>
        </div>

        {/* COLUNA 2: Eventos do Dia Selecionado */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>EVENTOS</h2>
          <p className={styles.selectedDateDisplay}>
            {/* Exibe a data selecionada em formato brasileiro */}
            {formatarDataBrasileira(selectedCalendarDate)}
          </p>
          <div className={styles.listContainer}>
            {eventosDoDiaSelecionado.length > 0 ? (
              <ul className={styles.itemsList}>
                {eventosDoDiaSelecionado.map(item => (
                  // FAZ O ITEM CLICÁVEL PARA ABRIR O MODAL DE EDIÇÃO
                  <li
                    key={item.id}
                    className={styles.eventoItemDetails}
                    onClick={() => handleEditClick(item)} // Adiciona o onClick aqui para abrir o modal de edição
                    style={{ cursor: 'pointer' }} // Adiciona um cursor de ponteiro para indicar que é clicável
                  >
                    <h4>{item.titulo}</h4>
                    <p>Data: <strong>{formatarDataBrasileira(item.dataEvento)}</strong></p>
                    <p>Hora: <strong>{item.horaEvento}</strong></p>
                    <p>Local: {item.local}</p>
                    {item.descricao && <p>Descrição: {item.descricao}</p>} {/* Exibe a descrição se ela existir */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.placeholderText}>Não existem eventos cadastrados para esta data.</p>
            )}
          </div>
        </div>

        {/* COLUNA 3: Processos do Dia Selecionado */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>PROCESSOS</h2>
          <p className={styles.selectedDateDisplay}>
            {/* Exibe a data selecionada em formato brasileiro */}
            {formatarDataBrasileira(selectedCalendarDate)}
          </p>
          <div className={styles.listContainer}>
            {processosDoDiaSelecionado.length > 0 ? (
              <ul className={styles.itemsList}>
                {processosDoDiaSelecionado.map(item => (
                  <li key={item.id} className={styles.processoItemDefault}>
                    <h4>{item.numeroProcesso}</h4>
                    <p>Assunto: {item.assunto}</p>
                    <p>Status: <strong>{item.status}</strong></p>
                    {/* Adicione outros campos de processo aqui se houver */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.placeholderText}>Não existem processos cadastrados para esta data.</p>
            )}
          </div>
        </div>
      </div>

      {/* NOVO: Container para o rodapé com informações da instituição e do usuário */}
      <div className={styles.footerUser}>
        {/* Lado Esquerdo: Texto Institucional (Revertido para o texto) */}
        <div className={styles.institutionalInfo}> {/* CLASSE ANTIGA REVERTIDA */}
          <span className={styles.institutionalText}>Governo do Estado do Rio Grande do Norte</span>
          <span className={styles.institutionalText}>Secretaria de Segurança Pública e Defesa Social</span>
          <span className={styles.institutionalText}>Instituto Técnico-Científico de Perícia</span>
          <span className={styles.institutionalText}>Gabinete da Direção Geral</span>
        </div>

        {/* Lado Direito: Informações do Usuário e Botão de Sair */}
        <div className={styles.userLogoutSection}>
          <div className={styles.userInfo}>
            <span className={styles.userNameDisplay}>{userName}</span>
            {currentUser && currentUser.email && (
              <span className={styles.userEmailDisplay}>({currentUser.email})</span>
            )}
          </div>
          <button onClick={onLogout} className={styles.logoutButton}>Sair</button>
        </div>
      </div>

      {/* Modal para adicionar novo compromisso (evento) */}
      <AddCompromissoModal
        isOpen={isAddCompromissoModalOpen} // Controla se o modal está visível
        onClose={() => setIsAddCompromissoModalOpen(false)} // Função para fechar o modal
        onCompromissoAdded={() => {
          console.log("Notificação: Evento adicionado com sucesso pelo modal! (O estado `eventos` será atualizado via onSnapshot)");
        }}
        initialDate={selectedCalendarDate} // Passa a data selecionada do calendário para pré-preencher
        onAddCompromisso={handleAddCompromissoFromModal} // Passa a função que lida com a validação e adição
      />

      {/* NOVO: Modal para editar/excluir evento */}
      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={() => setIsEditEventModalOpen(false)}
        eventData={currentEventToEdit} // Passa os dados do evento clicado
        onUpdateEvent={handleUpdateEvent} // Passa a função para atualizar
        onDeleteEvent={handleDeleteEvent} // Passa a função para excluir
      />
    </div>
  );
}

export default AgendaMainScreen;