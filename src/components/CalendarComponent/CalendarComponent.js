// src/components/CalendarComponent/CalendarComponent.js

import React, { useState, useEffect } from 'react'; // Mantenha useEffect se for usá-lo
import './CalendarComponent.css'; // Assegure-se de que este CSS existe ou crie-o.

const CalendarComponent = ({ events, onDaySelect, selectedDate }) => {
  // Use um estado para a data interna se o componente precisar gerenciá-la,
  // mas aqui estamos recebendo de props.
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date(selectedDate));

  // O useEffect pode ser usado para reagir a mudanças de props ou para lógica de inicialização.
  // Se você não precisar dele, remova-o da importação acima e deste bloco.
  useEffect(() => {
    // Exemplo: Atualizar a data de exibição quando selectedDate muda
    setCurrentDisplayDate(new Date(selectedDate));
  }, [selectedDate]); // Reage quando selectedDate muda

  // Função auxiliar para obter o dia da semana em português
  const getDayName = (dayIndex) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayIndex];
  };

  // Função para gerar os dias do mês
  const generateDays = () => {
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Dia da semana do primeiro dia (0=Dom, 6=Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total de dias no mês

    const days = [];

    // Preencher dias vazios do mês anterior
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Preencher os dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const formattedDayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasEvent = events.some(event => event.dataEvento === formattedDayDate);
      days.push({
        date: formattedDayDate,
        day: i,
        isCurrentMonth: true,
        isSelected: formattedDayDate === selectedDate,
        hasEvent: hasEvent
      });
    }
    return days;
  };

  const days = generateDays();

  const handlePrevMonth = () => {
    setCurrentDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };


  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{currentDisplayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {/* Dias da semana */}
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={`day-name-${index}`} className="calendar-day-name">
            {getDayName(index)}
          </div>
        ))}

        {/* Dias do mês */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day ? (day.isSelected ? 'selected' : '') : 'empty'} ${day && day.hasEvent ? 'has-event' : ''}`}
            onClick={() => day && day.isCurrentMonth && onDaySelect(day.date)}
          >
            {day ? day.day : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarComponent;