import React from 'react';
import { Link } from 'react-router-dom';
import BarraCupos from './BarraCupos';
import { formatearFecha, formatearHora } from '../utils/fechas';

function claseEstado(estado) {
  return estado === 'zarpó' ? 'zarpo' : estado;
}

function SalidaCard({ salida, onReservar }) {
  const noAceptaReservas = ['zarpó', 'zarpo', 'cancelada'].includes(salida.estado)
    || salida.cupos <= 0;

  return (
    <article className="card" data-testid="salida-card">
      <div className="card-header">
        <span className={`tag tag-${salida.tipo}`}>{salida.tipo}</span>
        <span className={`estado estado-${claseEstado(salida.estado)}`}>{salida.estado}</span>
      </div>
      <h3>
        <Link to={`/salidas/${salida.id}`} className="card-title-link">{salida.destino}</Link>
      </h3>
      <p className="empresa">{salida.empresa} · {salida.embarcacion}</p>
      <dl className="details">
        <div>
          <dt>Salida</dt>
          <dd>{formatearFecha(salida.fechaHora)} · {formatearHora(salida.fechaHora)}</dd>
        </div>
        <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
        <div><dt>Duración</dt><dd>{salida.duracionHoras} horas</dd></div>
      </dl>
      <BarraCupos capacidad={salida.capacidad} cupos={salida.cupos} />
      <strong className="price">S/ {Number(salida.precio).toFixed(2)}</strong>
      <div className="card-actions">
        <Link to={`/salidas/${salida.id}`} className="button secondary">Ver detalle</Link>
        {onReservar && (
          <button
            type="button"
            className="button primary"
            disabled={noAceptaReservas}
            onClick={() => onReservar(salida)}
          >
            {salida.cupos > 0 ? 'Reservar' : 'Agotado'}
          </button>
        )}
      </div>
    </article>
  );
}

export default SalidaCard;
