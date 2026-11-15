import React from 'react';

function Filtros({
  filtros, destinos, onChange, onLimpiar, busqueda = filtros.q, onSearchChange = onChange,
}) {
  return (
    <section className="filters">
      <label className="filter-search">
        Buscar
        <input
          type="search"
          name="q"
          value={busqueda}
          onChange={onSearchChange}
          placeholder="Empresa o embarcación"
        />
      </label>
      <label>
        Destino
        <select name="destino" value={filtros.destino} onChange={onChange}>
          <option value="">Todos los destinos</option>
          {destinos.map((destino) => (
            <option key={destino} value={destino}>{destino}</option>
          ))}
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
      <label>
        Precio mínimo
        <input type="number" name="precioMin" min="0" step="0.01" value={filtros.precioMin} onChange={onChange} />
      </label>
      <label>
        Precio máximo
        <input type="number" name="precioMax" min="0" step="0.01" value={filtros.precioMax} onChange={onChange} />
      </label>
      <label>
        Periodo
        <select name="rango" value={filtros.rango} onChange={onChange}>
          <option value="">Todas las fechas</option>
          <option value="hoy">Solo hoy</option>
          <option value="48h">Próximas 48 horas</option>
        </select>
      </label>
      <label>
        Ordenar por
        <select name="orden" value={filtros.orden} onChange={onChange}>
          <option value="fecha">Fecha</option>
          <option value="precio">Precio</option>
          <option value="duracion">Duración</option>
        </select>
      </label>
      <label>
        Dirección
        <select name="dir" value={filtros.dir} onChange={onChange}>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </label>
      <button type="button" className="button secondary clear-button" onClick={onLimpiar}>
        Limpiar filtros
      </button>
    </section>
  );
}

export default Filtros;
