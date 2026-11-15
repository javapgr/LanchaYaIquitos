import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useToast } from '../components/Toast';
import { obtenerEstadisticas } from '../services/api';

function Panel() {
  const toast = useToast();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerEstadisticas()
      .then(setEstadisticas)
      .catch((requestError) => {
        setError(requestError.message);
        toast.error(requestError.message);
      })
      .finally(() => setCargando(false));
  }, [toast]);

  if (cargando) return <p className="status">Cargando estadísticas...</p>;
  if (error) return <p className="status error-message">Error de conexión: {error}</p>;
  if (!estadisticas || estadisticas.totalSalidas === 0) {
    return <p className="status">Aún no hay datos</p>;
  }

  const promedio = Number(estadisticas.precioPromedioGeneral || 0).toFixed(2);
  const grafico = (datos, clave, etiqueta) => (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={clave} tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={65} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(valor) => [valor, 'Salidas']} />
          <Bar dataKey="total" name={etiqueta} fill="#14532d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <section className="panel-page">
      <div className="admin-hero">
        <p className="eyebrow">Administración</p>
        <h1>Panel de estadísticas</h1>
        <p>Resumen de salidas, cupos y precios registrados.</p>
      </div>
      <div className="stats-cards">
        <article className="stat-card"><span>Salidas</span><strong>{estadisticas.totalSalidas}</strong></article>
        <article className="stat-card"><span>Cupos reservados</span><strong>{estadisticas.cuposReservados}</strong></article>
        <article className="stat-card"><span>Cupos disponibles</span><strong>{estadisticas.cuposDisponibles}</strong></article>
        <article className="stat-card"><span>Precio promedio</span><strong>S/ {promedio}</strong></article>
      </div>
      <div className="charts-grid">
        <article className="panel-section">
          <h2>Salidas por destino</h2>
          {grafico(estadisticas.porDestino, 'destino', 'Destino')}
        </article>
        <article className="panel-section">
          <h2>Salidas por tipo de embarcación</h2>
          {grafico(estadisticas.porTipo, 'tipo', 'Tipo')}
        </article>
      </div>
      <section className="panel-section">
        <h2>Precio promedio por destino</h2>
        <div className="table-scroll">
          <table className="stats-table">
            <caption className="sr-only">Precio promedio y total de salidas por destino</caption>
            <thead><tr><th scope="col">Destino</th><th scope="col">Salidas</th><th scope="col">Precio promedio</th></tr></thead>
            <tbody>
              {estadisticas.porDestino.map((fila) => (
                <tr key={fila.destino}>
                  <th scope="row">{fila.destino}</th>
                  <td>{fila.total}</td>
                  <td>S/ {Number(fila.precioPromedio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default Panel;
