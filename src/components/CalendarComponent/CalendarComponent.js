// src/components/CalendarComponent/CalendarComponent.js
import React, { useState, useEffect } from 'react';
import styles from './CalendarComponent.module.css';

// Função auxiliar para formatar uma data Date object para AAAA-MM-DD (para comparação)
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês + 1 porque é de 0 a 11
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função auxiliar para obter o nome do mês
const getMonthName = (monthIndex) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return monthNames[monthIndex];
};

// Recebe 'events' (todos os eventos), 'onDaySelect' (função para chamar ao clicar no dia)
// e 'selectedDate' (a data atualmente selecionada no formato AAAA-MM-DD para destaque)
function CalendarComponent({ events, onDaySelect, selectedDate }) {
  // Estado para controlar qual mês/ano está sendo exibido no calendário
  const [displayDate, setDisplayDate] = useState(new Date());

  // Cria um Set de datas (strings AAAA-MM-DD) que possuem eventos para checagem rápida
  const datesWithEvents = new Set(
    events.map(event => event.dataEvento)
  );

  // Renderiza os dias do calendário para o mês/ano atual de 'displayDate'
  const renderCalendarDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth(); // Mês é 0-indexed (0 para Janeiro, 11 para Dezembro)

    const firstDayOfMonth = new Date(year, month, 1);
    // lastDayOfMonth: criando uma data com o dia 0 do próximo mês, que retorna o último dia do mês atual
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();

    // firstDayOfWeek: Dia da semana em que o primeiro dia do mês cai (0 = domingo, 1 = segunda, ..., 6 = sábado)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const days = []; // Array que irá armazenar os elementos JSX para cada dia do calendário

    // Preenche os dias vazios no início do mês para alinhar o primeiro dia com o dia da semana correto
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-start-${i}`} className={styles.emptyDay}></div>);
    }

    // Preenche os dias do mês
    for (let i = 1; i <= numDaysInMonth; i++) {
      const currentDayDate = new Date(year, month, i);
      const formattedDay = formatDateToYYYYMMDD(currentDayDate); // Formato AAAA-MM-DD para comparação

      const hasEvent = datesWithEvents.has(formattedDay); // Verifica se há evento neste dia
      const isToday = formattedDay === formatDateToYYYYMMDD(new Date()); // Verifica se é o dia de hoje
      const isSelected = formattedDay === selectedDate; // Verifica se é o dia selecionado no calendário

      days.push(
        <div
          key={`day-${i}`} // Chave única para cada dia
          className={`${styles.calendarDay} ${hasEvent ? styles.hasEvent : ''} ${isToday ? styles.isToday : ''} ${isSelected ? styles.isSelected : ''}`}
          onClick={() => onDaySelect(formattedDay)} // Chama a função onDaySelect com a data clicada
        >
          {i} {/* Exibe o número do dia */}
        </div>
      );
    }

    // Preenche os dias vazios no final do mês para completar a última semana (garante 6 semanas completas na grid)
    const totalCells = days.length;
    // O calendário tem uma grade de 7 dias * 6 semanas = 42 células.
    // Preenche o restante para completar a última linha da grade, se necessário.
    const remainingCells = 42 - totalCells;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className={styles.emptyDay}></div>);
    }

    return days;
  };

  // Função para navegar para o mês anterior
  const goToPrevMonth = () => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1); // Decrementa o mês
      return newDate;
    });
  };

  // Função para navegar para o próximo mês
  const goToNextMonth = () => {
    setDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1); // Incrementa o mês
      return newDate;
    });
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Barra de navegação de Mês/Ano */}
      <div className={styles.calendarHeader}>
        <button onClick={goToPrevMonth} className={styles.navButton}>&lt;</button> {/* Botão "Mês Anterior" */}
        <div className={styles.monthYearDisplay}>
          {getMonthName(displayDate.getMonth())} {displayDate.getFullYear()} {/* Exibe o mês e ano atuais */}
        </div>
        <button onClick={goToNextMonth} className={styles.navButton}>&gt;</button> {/* Botão "Próximo Mês" */}
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className={styles.weekdays}>
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
      </div>

      {/* Grid de dias do calendário */}
      <div className={styles.calendarGrid}>
        {renderCalendarDays()} {/* Renderiza todos os dias do mês */}
      </div>
    </div>
  );
}

export default CalendarComponent;