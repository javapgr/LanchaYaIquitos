import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BarraCupos from '../components/BarraCupos';
import CuentaRegresiva from '../components/CuentaRegresiva';
import ReservaForm from '../components/ReservaForm';
import { useToast } from '../components/Toast';
import { crearReserva, obtenerSalida } from '../services/api';
import {
  crearUrlWhatsApp, formatearFecha, formatearHora, haPasado,
} from '../utils/fechas';

function claseEstado(estado) {
  return estado === 'zarpó' ? 'zarpo' : estado;
}

function SalidaDetalle() {
  const { id } = useParams();
  const toast = useToast();
  const [salida, setSalida] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [error, setError] = useState('');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [errorReserva, setErrorReserva] = useState('');
  const [codigoReserva, setCodigoReserva] = useState('');

  useEffect(() => {
    document.body.classList.add('client-background');
    return () => document.body.classList.remove('client-background');
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setNoEncontrada(false);
    setError('');

    obtenerSalida(id)
      .then((datos) => {
        if (!cancelado) setSalida(datos);
      })
      .catch((requestError) => {
        if (cancelado) return;
        if (requestError.status === 404) setNoEncontrada(true);
        else setError(requestError.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [id]);

  async function reservar(datos) {
    setErrorReserva('');
    try {
      const reserva = await crearReserva(salida.id, datos);
      setCodigoReserva(reserva.codigo);
      setFormularioAbierto(false);
      toast.success(`Reserva ${reserva.codigo} creada`);
      const actualizada = await obtenerSalida(salida.id);
      setSalida(actualizada);
    } catch (requestError) {
      setErrorReserva(requestError.message);
      toast.error(requestError.message);
    }
  }

  if (cargando) {
    return (
      <main className="container client-page detail-page">
        <p className="status">Cargando salida...</p>
      </main>
    );
  }

  if (noEncontrada) {
    return (
      <main className="container client-page detail-page">
        <section className="detail-card detail-vacia">
          <h1>Salida no encontrada</h1>
          <p>El enlace puede haber cambiado o la salida ya no existe.</p>
          <Link to="/" className="button primary">Volver al listado</Link>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container client-page detail-page">
        <section className="detail-card detail-vacia">
          <h1>No se pudo cargar la salida</h1>
          <p className="error-message" role="alert">{error}</p>
          <Link to="/" className="button secondary">Volver al listado</Link>
        </section>
      </main>
    );
  }

  const sinReservaPorEstado = ['zarpó', 'zarpo', 'cancelada'].includes(salida.estado);
  const paso = haPasado(salida.fechaHora);
  const puedeReservar = !sinReservaPorEstado && !paso && Number(salida.cupos) > 0;
  const urlWhatsApp = crearUrlWhatsApp(salida, window.location.href);

  return (
    <main className="container client-page detail-page">
      <Link to="/" className="detail-back">← Volver a las salidas</Link>

      <article className="detail-card" data-testid="detalle-salida">
        <div className="detail-header">
          <div>
            <p className="eyebrow detail-eyebrow">{salida.tipo}</p>
            <h1>{salida.destino}</h1>
            <p className="detail-empresa">{salida.empresa} · {salida.embarcacion}</p>
          </div>
          <span className={`estado estado-${claseEstado(salida.estado)}`}>{salida.estado}</span>
        </div>

        <CuentaRegresiva fechaHora={salida.fechaHora} estado={salida.estado} />

        <div className="detail-grid">
          <section>
            <h2>Datos de la salida</h2>
            <dl className="details detail-datos">
              <div><dt>Fecha</dt><dd>{formatearFecha(salida.fechaHora)}</dd></div>
              <div><dt>Hora</dt><dd>{formatearHora(salida.fechaHora)} (Lima)</dd></div>
              <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
              <div><dt>Duración</dt><dd>{salida.duracionHoras} horas</dd></div>
              <div><dt>Precio</dt><dd>S/ {Number(salida.precio).toFixed(2)}</dd></div>
              <div><dt>Capacidad</dt><dd>{salida.capacidad} pasajeros</dd></div>
            </dl>
          </section>
          <section className="detail-cupos">
            <h2>Cupos restantes</h2>
            <BarraCupos capacidad={salida.capacidad} cupos={salida.cupos} />
          </section>
        </div>

        <div className="detail-actions">
          {!sinReservaPorEstado && (
            <button
              type="button"
              className="button primary"
              disabled={!puedeReservar}
              onClick={() => {
                setErrorReserva('');
                setFormularioAbierto(true);
              }}
            >
              {puedeReservar ? 'Reservar' : (paso ? 'Salida pasada' : 'Agotado')}
            </button>
          )}
          <a
            className="button secondary"
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp"
          >
            Compartir por WhatsApp
          </a>
        </div>
      </article>

      {formularioAbierto && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormularioAbierto(false);
          }}
        >
          <div className="modal">
            <button
              type="button"
              className="close-button"
              aria-label="Cerrar reserva"
              onClick={() => setFormularioAbierto(false)}
            >
              ×
            </button>
            <ReservaForm
              salida={salida}
              onReservar={reservar}
              onCancelar={() => setFormularioAbierto(false)}
              errorServidor={errorReserva}
            />
          </div>
        </div>
      )}

      {codigoReserva && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal reservation-success">
            <h2>Reserva confirmada</h2>
            <p>Guarda este código para consultar tu reserva:</p>
            <strong>{codigoReserva}</strong>
            <button type="button" className="button primary" onClick={() => setCodigoReserva('')}>
              Continuar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default SalidaDetalle;
