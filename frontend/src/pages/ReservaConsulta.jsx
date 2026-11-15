import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/Toast';
import { eliminarReserva, obtenerReserva } from '../services/api';
import { formatearFechaHora } from '../utils/fechas';

function ReservaConsulta() {
  const toast = useToast();
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);

  async function consultar(event) {
    event.preventDefault();
    setCargando(true);
    setError('');
    setReserva(null);
    try {
      setReserva(await obtenerReserva(codigo.trim().toUpperCase()));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }

  async function cancelarReserva() {
    if (!reserva) return;
    try {
      await eliminarReserva(reserva.id);
      toast.success(`Reserva ${reserva.codigo} cancelada correctamente`);
      setReserva(null);
      setConfirmandoCancelacion(false);
    } catch (requestError) {
      toast.error(requestError.message);
      setError(requestError.message);
      setConfirmandoCancelacion(false);
    }
  }

  return (
    <main className="container admin-page">
      <section className="form-panel reservation-lookup">
        <h1>Consultar reserva</h1>
        <p>Ingresa tu código, por ejemplo LY-4F7K2.</p>
        <form className="form-actions" onSubmit={consultar}>
          <input
            aria-label="Código de reserva"
            placeholder="LY-4F7K2"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value)}
          />
          <button className="button primary">Consultar</button>
        </form>
        {cargando && <p className="status">Consultando...</p>}
        {!cargando && error && <p className="error-message" role="alert">{error}</p>}
        {!cargando && reserva && (
          <>
            <dl className="details reservation-details">
              <div><dt>Código</dt><dd>{reserva.codigo}</dd></div>
              <div><dt>Pasajero</dt><dd>{reserva.nombre}</dd></div>
              <div><dt>Empresa</dt><dd>{reserva.empresa}</dd></div>
              <div><dt>Destino</dt><dd>{reserva.destino}</dd></div>
              <div><dt>Salida</dt><dd>{formatearFechaHora(reserva.fechaHora)} (Lima)</dd></div>
              <div><dt>Puerto</dt><dd>{reserva.puerto}</dd></div>
              <div><dt>Cantidad</dt><dd>{reserva.cantidad}</dd></div>
            </dl>
            <div className="form-actions">
              <Link to={`/salidas/${reserva.salidaId}`} className="button secondary">Ver salida</Link>
              <button
                type="button"
                className="button danger"
                onClick={() => setConfirmandoCancelacion(true)}
              >
                Cancelar reserva
              </button>
            </div>
          </>
        )}
      </section>
      {confirmandoCancelacion && reserva && (
        <ConfirmModal
          titulo="Cancelar reserva"
          mensaje={`¿Cancelar la reserva ${reserva.codigo} a nombre de ${reserva.nombre}? Los cupos volverán a estar disponibles.`}
          confirmarTexto="Cancelar reserva"
          cancelarTexto="Volver"
          onConfirmar={cancelarReserva}
          onCancelar={() => setConfirmandoCancelacion(false)}
        />
      )}
    </main>
  );
}

export default ReservaConsulta;
