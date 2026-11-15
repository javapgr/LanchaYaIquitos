import React, { useEffect, useState } from 'react';
import { formatearFechaHora, timestampLima } from '../utils/fechas';

function partesRestantes(milisegundos) {
  const totalSegundos = Math.floor(milisegundos / 1000);
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

function CuentaRegresiva({ fechaHora, estado }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    setAhora(Date.now());
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [fechaHora]);

  const objetivo = timestampLima(fechaHora);

  if (!objetivo) {
    return <p className="countdown countdown-pasado">Fecha inválida</p>;
  }

  if (estado === 'cancelada') {
    return <p className="countdown countdown-pasado">Salida cancelada</p>;
  }

  if (['zarpó', 'zarpo'].includes(estado)) {
    return (
      <p className="countdown countdown-pasado" role="timer">
        Ya zarpó
      </p>
    );
  }

  const restante = objetivo - ahora;
  if (restante <= 0) {
    return (
      <p className="countdown countdown-pasado" role="timer">
        Ya zarpó
      </p>
    );
  }

  const { dias, horas, minutos, segundos } = partesRestantes(restante);

  return (
    <p className="countdown" role="timer" aria-live="off" data-testid="cuenta-regresiva">
      <span className="countdown-label">Faltan</span>
      <strong>
        {dias > 0 && `${dias} d `}
        {String(horas).padStart(2, '0')} h {String(minutos).padStart(2, '0')} m{' '}
        {String(segundos).padStart(2, '0')} s
      </strong>
      <span className="countdown-hora">Salida: {formatearFechaHora(fechaHora)} (hora de Lima)</span>
    </p>
  );
}

export default CuentaRegresiva;
