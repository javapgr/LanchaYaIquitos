import React from 'react';

function BarraCupos({ capacidad, cupos }) {
  const capacidadNumero = Math.max(0, Number(capacidad) || 0);
  const cuposNumero = Math.max(0, Math.min(capacidadNumero, Number(cupos) || 0));
  const disponible = capacidadNumero > 0 ? (cuposNumero / capacidadNumero) * 100 : 0;
  const ocupado = capacidadNumero > 0 ? 100 - disponible : 0;

  let clase = 'barra-roja';
  if (disponible > 50) clase = 'barra-verde';
  else if (disponible >= 20) clase = 'barra-amarilla';

  return (
    <div
      className={`barra-cupos ${clase}`}
      role="progressbar"
      aria-label="Ocupación de cupos"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={Math.round(ocupado)}
      data-testid="barra-cupos"
      data-disponible={Math.round(disponible)}
    >
      <div className="barra-cupos-track">
        <div className="barra-cupos-fill" style={{ width: `${ocupado}%` }} />
      </div>
      <div className="barra-cupos-texto">
        <span>{cuposNumero} de {capacidadNumero} cupos disponibles</span>
        <span>{Math.round(ocupado)}% ocupado</span>
      </div>
    </div>
  );
}

export default BarraCupos;
