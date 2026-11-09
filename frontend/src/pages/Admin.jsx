import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import SalidaForm from '../components/SalidaForm';
import {
  actualizarSalida, crearSalida, eliminarSalida, obtenerDestinos, obtenerSalidas,
} from '../services/api';
import { claseCupos, etiquetaCupos } from '../utils/cupos';

const POR_PAGINA = 5;

function formatearFecha(fechaHora) {
  const fecha = new Date(fechaHora);
  return `${fecha.toLocaleDateString('es-PE')} · ${fecha.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function Admin() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState({ q: '', destino: '', fecha: '', tipo: '' });
  const [pagina, setPagina] = useState(1);
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
  useEffect(() => { setPagina(1); }, [filtros]);

  const totalPaginas = Math.max(1, Math.ceil(salidas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const salidasPagina = salidas.slice(inicio, inicio + POR_PAGINA);

  function cerrarFormulario() {
    setSalidaEditando(null);
    setFormularioAbierto(false);
  }

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
  }

  function editar(salida) {
    setSalidaEditando(salida);
    setFormularioAbierto(true);
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
    <main className="container admin-page">
      <header className="admin-hero">
        <p className="eyebrow">Panel de administración</p>
        <h1>Gestionar salidas</h1>
        <p>Registra, edita o elimina las salidas que verán los clientes.</p>
      </header>
      <button type="button" className="button primary open-form-button" onClick={() => setFormularioAbierto(true)}>
        Registrar salida
      </button>
      {formularioAbierto && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarFormulario();
          }}
        >
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
          onLimpiar={() => setFiltros({ q: '', destino: '', fecha: '', tipo: '' })}
        />
        {cargando && <p className="status">Cargando salidas...</p>}
        {!cargando && error && <p className="status error-message">{error}</p>}
        {!cargando && !error && salidas.length === 0 && (
          <p className="status">No hay salidas para los filtros seleccionados.</p>
        )}
        {!cargando && !error && salidas.length > 0 && (
          <>
            <div className="admin-list" role="table" aria-label="Salidas registradas">
              <div className="admin-list-head" role="row">
                <span role="columnheader">Destino</span>
                <span role="columnheader">Empresa</span>
                <span role="columnheader">Tipo</span>
                <span role="columnheader">Fecha</span>
                <span role="columnheader">Puerto</span>
                <span role="columnheader">Precio</span>
                <span role="columnheader">Cupos</span>
                <span role="columnheader">Acciones</span>
              </div>
              {salidasPagina.map((salida) => (
                <div className="admin-list-row" role="row" key={salida.id}>
                  <span data-label="Destino" role="cell">{salida.destino}</span>
                  <span data-label="Empresa" role="cell">{salida.empresa}</span>
                  <span data-label="Tipo" role="cell">{salida.tipo}</span>
                  <span data-label="Fecha" role="cell">{formatearFecha(salida.fechaHora)}</span>
                  <span data-label="Puerto" role="cell">{salida.puerto}</span>
                  <span data-label="Precio" role="cell">S/ {Number(salida.precio).toFixed(2)}</span>
                  <span data-label="Cupos" role="cell">
                    <span className={`cupos ${claseCupos(salida.cupos)}`} title={etiquetaCupos(salida.cupos)}>
                      {salida.cupos}
                    </span>
                  </span>
                  <span data-label="Acciones" role="cell" className="admin-list-actions">
                    <button type="button" className="button secondary" onClick={() => editar(salida)}>Editar</button>
                    <button type="button" className="button danger" onClick={() => eliminar(salida.id)}>Eliminar</button>
                  </span>
                </div>
              ))}
            </div>
            <nav className="pagination" aria-label="Paginación de salidas">
              <button
                type="button"
                className="button secondary"
                disabled={paginaActual <= 1}
                onClick={() => setPagina(paginaActual - 1)}
              >
                Anterior
              </button>
              <span className="pagination-info">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                type="button"
                className="button secondary"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPagina(paginaActual + 1)}
              >
                Siguiente
              </button>
            </nav>
          </>
        )}
      </section>
    </main>
  );
}

export default Admin;
