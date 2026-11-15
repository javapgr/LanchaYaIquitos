import React, { useCallback, useEffect, useState } from 'react';
import EmpresaForm from '../components/EmpresaForm';
import {
  actualizarEmpresa, crearEmpresa, eliminarEmpresa, obtenerEmpresas,
} from '../services/api';

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarEmpresas = useCallback(async () => {
    setCargando(true);
    try {
      setEmpresas(await obtenerEmpresas());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarEmpresas(); }, [cargarEmpresas]);

  function cerrarFormulario() {
    setEmpresaEditando(null);
    setFormularioAbierto(false);
  }

  async function guardar(empresa) {
    try {
      if (empresaEditando) await actualizarEmpresa(empresaEditando.id, empresa);
      else await crearEmpresa(empresa);
      cerrarFormulario();
      await cargarEmpresas();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function eliminar(empresa) {
    if (!window.confirm(`¿Dar de baja a ${empresa.razonSocial}?`)) return;
    try {
      await eliminarEmpresa(empresa.id);
      await cargarEmpresas();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="container admin-page">
      <button type="button" className="button primary open-form-button" onClick={() => setFormularioAbierto(true)}>
        Registrar empresa
      </button>
      {formularioAbierto && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cerrarFormulario();
        }}>
          <div className="modal">
            <button type="button" className="close-button" aria-label="Cerrar formulario" onClick={cerrarFormulario}>×</button>
            <EmpresaForm empresa={empresaEditando} onGuardar={guardar} onCancelar={cerrarFormulario} />
          </div>
        </div>
      )}
      <section className="listing">
        <div className="section-title"><h2>Empresas activas</h2><span>{empresas.length} empresas</span></div>
        {cargando && <p className="status">Cargando empresas...</p>}
        {!cargando && error && <p className="status error-message">{error}</p>}
        {!cargando && !error && empresas.length === 0 && (
          <p className="status">No hay empresas activas.</p>
        )}
        {!cargando && !error && empresas.length > 0 && (
          <div className="admin-list" role="table" aria-label="Empresas activas">
            <div className="admin-list-head empresa-list-head" role="row">
              <span role="columnheader">Razón social</span>
              <span role="columnheader">RUC</span>
              <span role="columnheader">Teléfono</span>
              <span role="columnheader">Puerto base</span>
              <span role="columnheader">Acciones</span>
            </div>
            {empresas.map((empresa) => (
              <div className="admin-list-row empresa-list-row" role="row" key={empresa.id}>
                <span data-label="Razón social" role="cell">{empresa.razonSocial}</span>
                <span data-label="RUC" role="cell">{empresa.ruc}</span>
                <span data-label="Teléfono" role="cell">{empresa.telefono}</span>
                <span data-label="Puerto base" role="cell">{empresa.puertoBase}</span>
                <span data-label="Acciones" role="cell" className="admin-list-actions">
                  <button type="button" className="button secondary" onClick={() => {
                    setEmpresaEditando(empresa);
                    setFormularioAbierto(true);
                  }}>Editar</button>
                  <button type="button" className="button danger" onClick={() => eliminar(empresa)}>Dar de baja</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Empresas;
