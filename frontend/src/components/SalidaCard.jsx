import React from 'react';
import { claseCupos, etiquetaCupos } from '../utils/cupos';
import { formatearDuracion } from '../utils/duracion';

function claseEstado(estado) {
  return estado === 'zarpó' ? 'zarpo' : estado;
}

function SalidaCard({ salida, onReservar }) {
  const fecha = new Date(salida.fechaHora);
  const noAceptaReservas = ['zarpó', 'zarpo', 'cancelada'].includes(salida.estado)
    || salida.cupos <= 0;

  return (
    <article className="card">
      <div className="card-header">
        <span className={`tag tag-${salida.tipo}`}>{salida.tipo}</span>
        <span className={`estado estado-${claseEstado(salida.estado)}`}>{salida.estado}</span>
        <span className={`cupos ${claseCupos(salida.cupos)}`} title={`${salida.cupos} cupos · ${etiquetaCupos(salida.cupos)}`}>
          {salida.cupos} · {etiquetaCupos(salida.cupos)}
        </span>
      </div>
      <h3>{salida.destino}</h3>
      <p className="empresa">{salida.empresa} · {salida.embarcacion}</p>
      <dl className="details">
        <div>
          <dt>Salida</dt>
          <dd>
            {fecha.toLocaleDateString('es-PE')} ·{' '}
            {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </dd>
        </div>
        <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
        <div><dt>Duración</dt><dd>{formatearDuracion(salida.duracionHoras)}</dd></div>
      </dl>
      <strong className="price">S/ {salida.precio.toFixed(2)}</strong>
      {onReservar && (
        <div className="card-actions">
          <button
            type="button"
            className="button primary"
            disabled={noAceptaReservas}
            onClick={() => onReservar(salida)}
          >
            {salida.cupos > 0 ? 'Reservar' : 'Agotado'}
          </button>
        </div>
      )}
    </article>
  );
}

export default SalidaCard;
