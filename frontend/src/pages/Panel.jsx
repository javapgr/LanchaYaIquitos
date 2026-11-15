import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { obtenerEstadisticas } from '../services/api';

const COLOR_DESTINO = '#14532d';
const COLOR_TIPO = '#0b3d4a';

function Panel() {
  const { showToast } = useToast();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      try {
        const estadisticas = await obtenerEstadisticas();
        if (!activo) return;
        setDatos(estadisticas);
        setError('');
      } catch (requestError) {
        if (!activo) return;
        const mensaje = requestError.message || 'No se pudo conectar con el servidor';
        setDatos(null);
        setError(mensaje);
        showToast(mensaje, 'error');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, [showToast]);

  const precioPromedioGeneral = useMemo(() => {
    if (!datos || !datos.totalSalidas || !datos.porDestino?.length) return 0;
    const suma = datos.porDestino.reduce(
      (acum, fila) => acum + (Number(fila.precioPromedio) * Number(fila.total)),
      0,
    );
    return Math.round((suma / datos.totalSalidas) * 100) / 100;
  }, [datos]);

  const vacio = !cargando && !error && datos && datos.totalSalidas === 0;

  return (
    <main className="container admin-page panel-page">
      <nav className="admin-subnav" aria-label="Menú de administración">
        <NavLink to="/admin" end>Salidas</NavLink>
        <NavLink to="/empresas">Empresas</NavLink>
        <NavLink to="/admin/panel">Panel</NavLink>
      </nav>

      <header className="admin-hero">
        <p className="eyebrow">Administración</p>
        <h1>Panel de estadísticas</h1>
        <p>Resumen de salidas, cupos y precios por destino y tipo.</p>
      </header>

      {cargando && <p className="status">Cargando estadísticas...</p>}
      {!cargando && error && <p className="status error-message">{error}</p>}
      {vacio && <p className="status">Aún no hay datos</p>}

      {!cargando && !error && datos && datos.totalSalidas > 0 && (
        <>
          <section className="panel-cards" aria-label="Totales">
            <article className="panel-card">
              <p>Total de salidas</p>
              <strong>{datos.totalSalidas}</strong>
            </article>
            <article className="panel-card">
              <p>Cupos reservados</p>
              <strong>{datos.cuposReservados}</strong>
            </article>
            <article className="panel-card">
              <p>Cupos disponibles</p>
              <strong>{datos.cuposDisponibles}</strong>
            </article>
            <article className="panel-card">
              <p>Precio promedio general</p>
              <strong>S/ {precioPromedioGeneral.toFixed(2)}</strong>
            </article>
          </section>

          <section className="panel-charts" aria-label="Gráficos">
            <div className="panel-chart-block">
              <h2>Salidas por destino</h2>
              <div className="chart-frame" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datos.porDestino}
                    margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
                    <XAxis
                      dataKey="destino"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 11, fill: '#1a2a22' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#1a2a22' }} />
                    <Tooltip
                      formatter={(valor) => [`${valor}`, 'Salidas']}
                      contentStyle={{ borderRadius: 10, borderColor: '#c5d2ca' }}
                    />
                    <Bar dataKey="total" fill={COLOR_DESTINO} name="Salidas" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel-chart-block">
              <h2>Salidas por tipo de embarcación</h2>
              <div className="chart-frame" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={datos.porTipo}
                    margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
                    <XAxis
                      dataKey="tipo"
                      interval={0}
                      tick={{ fontSize: 12, fill: '#1a2a22' }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#1a2a22' }} />
                    <Tooltip
                      formatter={(valor) => [`${valor}`, 'Salidas']}
                      contentStyle={{ borderRadius: 10, borderColor: '#c5d2ca' }}
                    />
                    <Bar dataKey="total" fill={COLOR_TIPO} name="Salidas" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="panel-table-wrap" aria-labelledby="tabla-precios-titulo">
            <h2 id="tabla-precios-titulo">Precio promedio por destino</h2>
            <table className="panel-table">
              <thead>
                <tr>
                  <th scope="col">Destino</th>
                  <th scope="col">Salidas</th>
                  <th scope="col">Precio promedio</th>
                </tr>
              </thead>
              <tbody>
                {datos.porDestino.map((fila) => (
                  <tr key={fila.destino}>
                    <td>{fila.destino}</td>
                    <td>{fila.total}</td>
                    <td>S/ {Number(fila.precioPromedio).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}

export default Panel;
