import React, { useCallback, useEffect, useState } from 'react';
import Filtros from '../components/Filtros';
import SalidaForm from '../components/SalidaForm';
import {
  actualizarSalida, crearSalida, eliminarSalida, obtenerDestinos, obtenerSalidas,
} from '../services/api';
import { claseCupos, etiquetaCupos } from '../utils/cupos';

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
      <header className="hero admin-hero">
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
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Destino</th>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Puerto</th>
                  <th>Precio</th>
                  <th>Cupos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salidas.map((salida) => (
                  <tr key={salida.id}>
                    <td data-label="Destino">{salida.destino}</td>
                    <td data-label="Empresa">{salida.empresa}</td>
                    <td data-label="Tipo">{salida.tipo}</td>
                    <td data-label="Fecha">{formatearFecha(salida.fechaHora)}</td>
                    <td data-label="Puerto">{salida.puerto}</td>
                    <td data-label="Precio">S/ {Number(salida.precio).toFixed(2)}</td>
                    <td data-label="Cupos">
                      <span className={`cupos ${claseCupos(salida.cupos)}`}>
                        {salida.cupos} · {etiquetaCupos(salida.cupos)}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <div className="table-actions">
                        <button type="button" className="button secondary" onClick={() => editar(salida)}>Editar</button>
                        <button type="button" className="button danger" onClick={() => eliminar(salida.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Admin;
