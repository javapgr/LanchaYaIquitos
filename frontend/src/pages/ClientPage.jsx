import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import SalidaCard from '../components/SalidaCard';
import { obtenerDestinos, obtenerSalidas } from '../services/api';

function ClientPage() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState({ destino: '', fecha: '', tipo: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
  useEffect(() => { cargarSalidas(); }, [cargarSalidas]);

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Transporte fluvial de Iquitos</p>
        <h1>Encuentra tu próxima salida</h1>
        <p>Consulta horarios, destinos y precios de las empresas fluviales.</p>
      </header>
      <section className="listing">
        <div className="section-title"><h2>Salidas disponibles</h2><span>{salidas.length} resultados</span></div>
        <Filtros
          filtros={filtros}
          destinos={destinos}
          onChange={cambiarFiltro}
          onLimpiar={() => setFiltros({ destino: '', fecha: '', tipo: '' })}
        />
        {cargando && <p className="status">Cargando salidas...</p>}
        {!cargando && error && <p className="status error-message">{error}</p>}
        {!cargando && !error && salidas.length === 0 && <p className="status">No hay salidas para los filtros seleccionados.</p>}
        {!cargando && !error && <div className="cards">{salidas.map((salida) => <SalidaCard key={salida.id} salida={salida} />)}</div>}
      </section>
    </main>
  );
}

export default ClientPage;
