import React, { useState } from 'react';
import { obtenerReserva } from '../services/api';

function ReservaConsulta() {
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

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
        {!cargando && error && <p className="error-message">{error}</p>}
        {!cargando && reserva && (
          <dl className="details reservation-details">
            <div><dt>Código</dt><dd>{reserva.codigo}</dd></div>
            <div><dt>Pasajero</dt><dd>{reserva.nombre}</dd></div>
            <div><dt>Destino</dt><dd>{reserva.destino}</dd></div>
            <div><dt>Salida</dt><dd>{reserva.fechaHora.replace('T', ' ')}</dd></div>
            <div><dt>Cantidad</dt><dd>{reserva.cantidad}</dd></div>
          </dl>
        )}
      </section>
    </main>
  );
}

export default ReservaConsulta;
