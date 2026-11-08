import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import SalidaCard from '../components/SalidaCard';
import SalidaForm from '../components/SalidaForm';
import {
  actualizarSalida, crearSalida, eliminarSalida, obtenerDestinos, obtenerSalidas,
} from '../services/api';

function AdminPage() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState({ destino: '', fecha: '', tipo: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [salidaEditando, setSalidaEditando] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);

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

  function cerrarFormulario() {
    setSalidaEditando(null);
    setFormularioAbierto(false);
  }

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }

  async function guardar(salida) {
    try {
      if (salidaEditando) await actualizarSalida(salidaEditando.id, salida);
      else await crearSalida(salida);
      cerrarFormulario();
      await cargarSalidas();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Deseas eliminar esta salida?')) return;
    try {
      await eliminarSalida(id);
      await cargarSalidas();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">Panel de administración</p>
        <h1>Gestionar salidas</h1>
        <p>Registra, edita o elimina las salidas que verán los clientes.</p>
      </header>
      <button type="button" className="button primary open-form-button" onClick={() => setFormularioAbierto(true)}>
        Registrar salida
      </button>
      {formularioAbierto && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cerrarFormulario();
        }}>
          <div className="modal">
            <button type="button" className="close-button" aria-label="Cerrar formulario" onClick={cerrarFormulario}>×</button>
            <SalidaForm salida={salidaEditando} onGuardar={guardar} onCancelar={cerrarFormulario} />
          </div>
        </div>
      )}
      <section className="listing">
        <div className="section-title"><h2>Salidas registradas</h2><span>{salidas.length} resultados</span></div>
        <Filtros
          filtros={filtros}
          destinos={destinos}
          onChange={cambiarFiltro}
          onLimpiar={() => setFiltros({ destino: '', fecha: '', tipo: '' })}
        />
        {cargando && <p className="status">Cargando salidas...</p>}
        {!cargando && error && <p className="status error-message">{error}</p>}
        {!cargando && !error && <div className="cards">{salidas.map((salida) => <SalidaCard key={salida.id} salida={salida} onEditar={(seleccionada) => {
          setSalidaEditando(seleccionada);
          setFormularioAbierto(true);
        }} onEliminar={eliminar} />)}</div>}
      </section>
    </main>
  );
}

export default AdminPage;
