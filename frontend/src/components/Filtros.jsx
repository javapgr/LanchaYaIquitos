import React from 'react';

function Filtros({ filtros, destinos, onChange, onLimpiar }) {
  return (
    <section className="filters">
      <label>
        Destino
        <select name="destino" value={filtros.destino} onChange={onChange}>
          <option value="">Todos los destinos</option>
          {destinos.map((destino) => <option key={destino} value={destino}>{destino}</option>)}
        </select>
      </label>
      <label>
        Fecha
        <input type="date" name="fecha" value={filtros.fecha} onChange={onChange} />
      </label>
      <label>
        Tipo
        <select name="tipo" value={filtros.tipo} onChange={onChange}>
          <option value="">Todos los tipos</option>
          <option value="lancha">Lancha</option>
          <option value="rapido">Rápido</option>
          <option value="deslizador">Deslizador</option>
        </select>
      </label>
      <button type="button" className="button secondary clear-button" onClick={onLimpiar}>Limpiar filtros</button>
    </section>
  );
}

export default Filtros;
