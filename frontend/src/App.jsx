import React from 'react';
import {
  BrowserRouter, Link, NavLink, Navigate, Route, Routes,
} from 'react-router-dom';
import Admin from './pages/Admin';
import AdminLayout from './pages/AdminLayout';
import Empresas from './pages/Empresas';
import Home from './pages/Home';
import ReservaConsulta from './pages/ReservaConsulta';
import SalidaDetalle from './pages/SalidaDetalle';
import Panel from './pages/Panel';

function NoEncontrada() {
  return (
    <main className="container client-page detail-page">
      <section className="detail-card detail-vacia">
        <h1>Página no encontrada</h1>
        <p>La dirección que buscas no existe.</p>
        <Link to="/" className="button primary">Volver al inicio</Link>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="site-header">
          <div className="container site-header-content">
            <NavLink to="/" end className="brand">
              <img src="/images/logo-lanchaya.png" alt="LanchaYa" className="brand-logo" />
              <span>LANCHA YA!</span>
            </NavLink>
            <nav aria-label="Navegación principal">
              <NavLink to="/" end>Consultar salidas</NavLink>
              <NavLink to="/reserva">Consultar reserva</NavLink>
            </nav>
          </div>
        </header>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/salidas/:id" element={<SalidaDetalle />} />
            <Route path="/reserva" element={<ReservaConsulta />} />
            <Route path="/reservas" element={<Navigate to="/reserva" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="empresas" element={<Empresas />} />
              <Route path="panel" element={<Panel />} />
            </Route>
            <Route path="/empresas" element={<Navigate to="/admin/empresas" replace />} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </div>
        <footer className="site-footer">
          <div className="container footer-content">
            <div className="footer-brand">
              <img src="/images/logo-lanchaya.png" alt="" className="footer-logo" />
              <div>
                <strong>LANCHA YA!</strong>
                <p>Salidas fluviales desde Iquitos hacia la Amazonía.</p>
              </div>
            </div>
            <nav className="footer-nav" aria-label="Enlaces del pie">
              <NavLink to="/" end>Consultar salidas</NavLink>
              <NavLink to="/reserva">Consultar reserva</NavLink>
              <NavLink to="/admin" className="footer-admin-link">Admin</NavLink>
            </nav>
            <p className="footer-copy">Puertos Henry, Masusa, Productores y Bellavista Nanay.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
