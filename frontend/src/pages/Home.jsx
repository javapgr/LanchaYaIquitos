import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import ReservaForm from '../components/ReservaForm';
import SalidaCard from '../components/SalidaCard';
import { crearReserva, obtenerDestinos, obtenerSalidas } from '../services/api';

function Home() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState({ q: '', destino: '', fecha: '', tipo: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [salidaReservando, setSalidaReservando] = useState(null);
  const [codigoReserva, setCodigoReserva] = useState('');

  const cargarSalidas = useCallback(async () => {
    setCargando(true);
    try {
      setSalidas(await obtenerSalidas(filtros));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    obtenerDestinos().then(setDestinos).catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => {
    document.body.classList.add('client-background');
    return () => document.body.classList.remove('client-background');
  }, []);
  useEffect(() => { cargarSalidas(); }, [cargarSalidas]);

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }

  function irAListado() {
    document.getElementById('salidas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function reservar(datos) {
    try {
      const reserva = await crearReserva(salidaReservando.id, datos);
      setCodigoReserva(reserva.codigo);
      setSalidaReservando(null);
      await cargarSalidas();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <>
      <header className="hero client-hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Iquitos · Río Amazonas</p>
          <h1>LANCHA YA!</h1>
          <p className="hero-lead">Horarios, destinos y precios de las salidas fluviales, en un solo lugar.</p>
          <button type="button" className="button primary hero-cta" onClick={irAListado}>
            Ver salidas
          </button>
        </div>
      </header>
      <main className="container client-page" id="salidas">
        <section className="listing">
          <div className="section-title">
            <h2>Salidas disponibles</h2>
            <span>{salidas.length} resultados</span>
          </div>
          <Filtros
            filtros={filtros}
            destinos={destinos}
            onChange={cambiarFiltro}
            onLimpiar={() => setFiltros({ q: '', destino: '', fecha: '', tipo: '' })}
          />
          {cargando && <p className="status">Cargando salidas...</p>}
          {!cargando && error && <p className="status error-message">{error}</p>}
          {!cargando && !error && salidas.length === 0 && (
            <p className="status">No hay salidas para los filtros seleccionados.</p>
          )}
          {!cargando && !error && salidas.length > 0 && (
            <div className="cards">
              {salidas.map((salida) => (
                <SalidaCard
                  key={salida.id}
                  salida={salida}
                  onReservar={setSalidaReservando}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      {salidaReservando && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSalidaReservando(null);
        }}>
          <div className="modal">
            <button type="button" className="close-button" aria-label="Cerrar reserva" onClick={() => setSalidaReservando(null)}>×</button>
            <ReservaForm
              salida={salidaReservando}
              onReservar={reservar}
              onCancelar={() => setSalidaReservando(null)}
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
            <button type="button" className="button primary" onClick={() => setCodigoReserva('')}>Continuar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
