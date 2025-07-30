// src/services/firestoreService.js

// Importações necessárias do Firebase Firestore
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
  doc,       // NOVO: para referenciar um documento específico
  updateDoc, // NOVO: para atualizar um documento
  deleteDoc  // NOVO: para deletar um documento
} from 'firebase/firestore';

/**
 * Adiciona um novo compromisso (Evento ou Processo) à coleção 'compromissos'.
 * @param {object} compromissoData - Os dados do compromisso a serem adicionados.
 * @returns {Promise<{success: boolean, id?: string, error?: string}>} Um objeto indicando o sucesso da operação e o ID do documento, ou erro.
 */
export const addCompromisso = async (compromissoData) => {
  try {
    const dataWithTimestamp = {
      ...compromissoData,
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, "compromissos"), dataWithTimestamp);
    console.log("Documento escrito com ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Erro ao adicionar documento: ", e);
    return { success: false, error: e.message };
  }
};

/**
 * Inscreve-se em tempo real nas alterações da coleção 'compromissos' (eventos).
 * @param {function} callback - Função a ser chamada com a lista atualizada de eventos.
 * @returns {function} Uma função de 'unsubscribe' para parar de escutar as atualizações.
 */
export const subscribeToEventos = (callback) => {
  const q = collection(db, "compromissos");
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const eventos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(eventos);
  }, (error) => {
    console.error("Erro ao buscar eventos:", error);
  });
  return unsubscribe;
};

/**
 * Inscreve-se em tempo real nas alterações da coleção 'processos'.
 * @param {function} callback - Função a ser chamada com a lista atualizada de processos.
 * @returns {function} Uma função de 'unsubscribe' para parar de escutar as atualizações.
 */
export const subscribeToProcessos = (callback) => {
  const q = collection(db, "processos");
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const processos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(processos);
  }, (error) => {
    console.error("Erro ao buscar processos:", error);
  });
  return unsubscribe;
};

/**
 * Verifica se já existe um evento na coleção 'compromissos' para a data e hora especificadas.
 * @param {string} date - Data do evento no formato 'AAAA-MM-DD'.
 * @param {string} time - Hora do evento no formato 'HH:MM'.
 * @param {string} [excludeId=null] - ID do documento a ser excluído da verificação (útil para edição).
 * @returns {Promise<boolean>} Retorna true se um evento existente for encontrado, false caso contrário.
 */
export const checkExistingEvent = async (date, time, excludeId = null) => {
  try {
    let q = query(
      collection(db, "compromissos"),
      where("dataEvento", "==", date),
      where("horaEvento", "==", time)
    );

    // Se um ID for fornecido para exclusão, adiciona uma condição para ignorá-lo
    if (excludeId) {
      q = query(q, where("__name__", "!=", excludeId)); // "__name__" refere-se ao ID do documento
    }

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erro ao verificar evento existente:", error);
    return false;
  }
};

/**
 * **NOVA FUNÇÃO:** Atualiza um compromisso existente na coleção 'compromissos'.
 * @param {string} id - O ID do documento do compromisso a ser atualizado.
 * @param {object} newData - Os novos dados do compromisso (parcial ou completo).
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateCompromisso = async (id, newData) => {
  try {
    const docRef = doc(db, "compromissos", id);
    await updateDoc(docRef, newData);
    console.log("Documento atualizado com ID: ", id);
    return { success: true };
  } catch (e) {
    console.error("Erro ao atualizar documento: ", e);
    return { success: false, error: e.message };
  }
};

/**
 * **NOVA FUNÇÃO:** Deleta um compromisso existente da coleção 'compromissos'.
 * @param {string} id - O ID do documento do compromisso a ser deletado.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteCompromisso = async (id) => {
  try {
    const docRef = doc(db, "compromissos", id);
    await deleteDoc(docRef);
    console.log("Documento deletado com ID: ", id);
    return { success: true };
  } catch (e) {
    console.error("Erro ao deletar documento: ", e);
    return { success: false, error: e.message };
  }
};