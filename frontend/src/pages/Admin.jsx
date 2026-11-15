import React, { useCallback, useEffect, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import Filtros from '../components/Filtros';
import SalidaForm from '../components/SalidaForm';
import { useToast } from '../components/Toast';
import {
  actualizarEstadoSalida, actualizarSalida, crearSalida, eliminarSalida,
  obtenerDestinos, obtenerEmpresas, obtenerSalidas,
} from '../services/api';
import { claseCupos, etiquetaCupos } from '../utils/cupos';
import { formatearFechaHora } from '../utils/fechas';

const POR_PAGINA = 5;
const FILTROS_INICIALES = {
  q: '', destino: '', fecha: '', tipo: '', precioMin: '', precioMax: '',
  rango: '', orden: 'fecha', dir: 'asc',
};

function Admin() {
  const toast = useToast();
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [paginacion, setPaginacion] = useState({ total: 0, totalPaginas: 1 });
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [salidaEditando, setSalidaEditando] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [salidaEliminando, setSalidaEliminando] = useState(null);

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
    obtenerEmpresas().then(setEmpresas).catch((requestError) => setError(requestError.message));
  }, []);
  useEffect(() => { cargarSalidas(); }, [cargarSalidas]);
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPagina(1);
      setFiltros((actuales) => ({ ...actuales, q: busqueda }));
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  function cerrarFormulario() {
    setSalidaEditando(null);
    setFormularioAbierto(false);
    setErrorFormulario('');
  }

  function abrirNuevaSalida() {
    setSalidaEditando(null);
    setErrorFormulario('');
    setFormularioAbierto(true);
  }

  function cambiarFiltro(event) {
    setFiltros({ ...filtros, [event.target.name]: event.target.value });
    setPagina(1);
  }

  function editar(salida) {
    setSalidaEditando(salida);
    setErrorFormulario('');
    setFormularioAbierto(true);
  }

  async function guardar(salida) {
    setErrorFormulario('');
    try {
      if (salidaEditando) await actualizarSalida(salidaEditando.id, salida);
      else await crearSalida(salida);
      toast.success(salidaEditando ? 'Salida actualizada correctamente' : 'Salida registrada correctamente');
      cerrarFormulario();
      await cargarSalidas();
    } catch (requestError) {
      setErrorFormulario(requestError.message);
      toast.error(requestError.message);
    }
  }

  async function eliminarSalidaConfirmada() {
    if (!salidaEliminando) return;
    try {
      await eliminarSalida(salidaEliminando.id);
      toast.success('Salida eliminada correctamente');
      setSalidaEliminando(null);
      await cargarSalidas();
    } catch (requestError) {
      setSalidaEliminando(null);
      toast.error(requestError.message);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await actualizarEstadoSalida(id, estado);
      toast.success(`Estado actualizado a ${estado}`);
      await cargarSalidas();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  return (
    <>
      <button type="button" className="button primary open-form-button" onClick={abrirNuevaSalida}>
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
            <SalidaForm
              salida={salidaEditando}
              empresas={empresas}
              onGuardar={guardar}
              onCancelar={cerrarFormulario}
              errorServidor={errorFormulario}
            />
          </div>
        </div>
      )}
      {salidaEliminando && (
        <ConfirmModal
          titulo="Eliminar salida"
          mensaje={`¿Deseas eliminar la salida a ${salidaEliminando.destino}? Esta acción no se puede deshacer.`}
          confirmarTexto="Eliminar"
          onConfirmar={eliminarSalidaConfirmada}
          onCancelar={() => setSalidaEliminando(null)}
        />
      )}
      <section className="listing">
        <div className="section-title"><h2>Salidas registradas</h2><span>{paginacion.total} resultados</span></div>
        <Filtros
          filtros={filtros}
          destinos={destinos}
          onChange={cambiarFiltro}
          busqueda={busqueda}
          onSearchChange={(event) => setBusqueda(event.target.value)}
          onLimpiar={() => {
            setBusqueda('');
            setFiltros(FILTROS_INICIALES);
            setPagina(1);
          }}
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
                <span role="columnheader">Estado</span>
                <span role="columnheader">Acciones</span>
              </div>
              {salidas.map((salida) => (
                <div className="admin-list-row" role="row" key={salida.id}>
                  <span data-label="Destino" role="cell">{salida.destino}</span>
                  <span data-label="Empresa" role="cell">{salida.empresa}</span>
                  <span data-label="Tipo" role="cell">{salida.tipo}</span>
                  <span data-label="Fecha" role="cell">{formatearFechaHora(salida.fechaHora)}</span>
                  <span data-label="Puerto" role="cell">{salida.puerto}</span>
                  <span data-label="Precio" role="cell">S/ {Number(salida.precio).toFixed(2)}</span>
                  <span data-label="Cupos" role="cell">
                    <span className={`cupos ${claseCupos(salida.cupos)}`} title={etiquetaCupos(salida.cupos)}>
                      {salida.cupos} / {salida.capacidad}
                    </span>
                  </span>
                  <span data-label="Estado" role="cell">
                    <select value={salida.estado} onChange={(event) => cambiarEstado(salida.id, event.target.value)}>
                      <option value="programada">Programada</option>
                      <option value="abordando">Abordando</option>
                      <option value="zarpó">Zarpó</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </span>
                  <span data-label="Acciones" role="cell" className="admin-list-actions">
                    <button type="button" className="button secondary" onClick={() => editar(salida)}>Editar</button>
                    <button type="button" className="button danger" onClick={() => setSalidaEliminando(salida)}>Eliminar</button>
                  </span>
                </div>
              ))}
            </div>
            <nav className="pagination" aria-label="Paginación de salidas">
              <button
                type="button"
                className="button secondary"
                disabled={pagina <= 1}
                onClick={() => setPagina(pagina - 1)}
              >
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
    </>
  );
}

export default Admin;
