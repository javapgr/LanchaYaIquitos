import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import ReservaForm from '../components/ReservaForm';
import SalidaCard from '../components/SalidaCard';
import { useToast } from '../components/Toast';
import { crearReserva, obtenerDestinos, obtenerSalidas } from '../services/api';
import { borrarFiltros, guardarFiltros, leerFiltrosGuardados } from '../utils/filtrosStorage';

const FILTROS_INICIALES = {
  q: '', destino: '', fecha: '', tipo: '', precioMin: '', precioMax: '',
  rango: '', orden: 'fecha', dir: 'asc',
};
const POR_PAGINA = 6;

function Home() {
  const toast = useToast();
  const [filtrosIniciales] = useState(() => leerFiltrosGuardados(FILTROS_INICIALES));
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [busqueda, setBusqueda] = useState(filtrosIniciales.q);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({ total: 0, totalPaginas: 1 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [salidaReservando, setSalidaReservando] = useState(null);
  const [errorReserva, setErrorReserva] = useState('');
  const [codigoReserva, setCodigoReserva] = useState('');

  const cargarSalidas = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await obtenerSalidas({ ...filtros, page: pagina, limit: POR_PAGINA });
      setSalidas(resultado.salidas);
      setPaginacion(resultado.paginacion);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }, [filtros, pagina]);

  useEffect(() => {
    obtenerDestinos().then(setDestinos).catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => {
    document.body.classList.add('client-background');
    return () => document.body.classList.remove('client-background');
  }, []);
  useEffect(() => { cargarSalidas(); }, [cargarSalidas]);
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPagina(1);
      setFiltros((actuales) => {
        if (actuales.q === busqueda) return actuales;
        const siguientes = { ...actuales, q: busqueda };
        guardarFiltros(siguientes);
        return siguientes;
      });
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  function cambiarFiltro(event) {
    const siguientes = { ...filtros, [event.target.name]: event.target.value };
    setFiltros(siguientes);
    guardarFiltros(siguientes);
    setPagina(1);
  }

  function limpiarFiltros() {
    borrarFiltros();
    setBusqueda('');
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
  }

  function abrirReserva(salida) {
    setErrorReserva('');
    setSalidaReservando(salida);
  }

  function irAListado() {
    document.getElementById('salidas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function reservar(datos) {
    setErrorReserva('');
    try {
      const reserva = await crearReserva(salidaReservando.id, datos);
      setCodigoReserva(reserva.codigo);
      setSalidaReservando(null);
      toast.success(`Reserva ${reserva.codigo} creada`);
      await cargarSalidas();
    } catch (requestError) {
      setErrorReserva(requestError.message);
      toast.error(requestError.message);
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
            <span>{paginacion.total} resultados</span>
          </div>
          <Filtros
            filtros={filtros}
            destinos={destinos}
            onChange={cambiarFiltro}
            busqueda={busqueda}
            onSearchChange={(event) => setBusqueda(event.target.value)}
            onLimpiar={limpiarFiltros}
          />
          {cargando && <p className="status">Cargando salidas...</p>}
          {!cargando && error && <p className="status error-message">{error}</p>}
          {!cargando && !error && salidas.length === 0 && (
            <p className="status">No hay salidas para los filtros seleccionados.</p>
          )}
          {!cargando && !error && salidas.length > 0 && (
            <>
              <div className="cards">
                {salidas.map((salida) => (
                  <SalidaCard
                    key={salida.id}
                    salida={salida}
                    onReservar={abrirReserva}
                  />
                ))}
              </div>
              <nav className="pagination" aria-label="Paginación de salidas">
                <button type="button" className="button secondary" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {pagina} de {paginacion.totalPaginas}
                </span>
                <button
                  type="button"
                  className="button secondary"
                  disabled={pagina >= paginacion.totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                >
                  Siguiente
                </button>
              </nav>
            </>
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
            <button type="button" className="button primary" onClick={() => setCodigoReserva('')}>Continuar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
