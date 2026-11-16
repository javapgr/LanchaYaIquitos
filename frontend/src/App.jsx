import React from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import Empresas from './pages/Empresas';
import Home from './pages/Home';
import Panel from './pages/Panel';
import ReservaConsulta from './pages/ReservaConsulta';

function esRutaAdmin(pathname) {
  return pathname.startsWith('/admin') || pathname.startsWith('/empresas');
}

function NavCliente() {
  return (
    <>
      <NavLink to="/" end>Consultar salidas</NavLink>
      <NavLink to="/reservas">Consultar reserva</NavLink>
      <NavLink to="/admin">Administración</NavLink>
    </>
  );
}

function NavAdmin() {
  return (
    <>
      <NavLink to="/admin" end>Salidas</NavLink>
      <NavLink to="/empresas">Empresas</NavLink>
      <NavLink to="/admin/panel">Panel</NavLink>
      <NavLink to="/" end className="nav-cliente-link">Vista cliente</NavLink>
    </>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const enAdmin = esRutaAdmin(pathname);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container site-header-content">
          <NavLink to={enAdmin ? '/admin' : '/'} end className="brand">
            <img src="/images/logo-lanchaya.png" alt="LanchaYa" className="brand-logo" />
            <span>LANCHA YA!{enAdmin ? ' · Admin' : ''}</span>
          </NavLink>
          <nav aria-label={enAdmin ? 'Navegación administración' : 'Navegación principal'}>
            {enAdmin ? <NavAdmin /> : <NavCliente />}
          </nav>
        </div>
      </header>
      <div className="app-main">
        <div key={pathname} className="page-transition">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reservas" element={<ReservaConsulta />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/panel" element={<Panel />} />
            <Route path="/empresas" element={<Empresas />} />
          </Routes>
        </div>
      </div>
      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <img src="/images/logo-lanchaya.png" alt="" className="footer-logo" />
            <div>
              <strong>LANCHA YA!</strong>
              <p>
                {enAdmin
                  ? 'Panel de administración de salidas, empresas y estadísticas.'
                  : 'Salidas fluviales desde Iquitos hacia la Amazonía.'}
              </p>
            </div>
          </div>
          {!enAdmin && (
            <nav className="footer-nav" aria-label="Enlaces del pie">
              <NavCliente />
            </nav>
          )}
          <p className="footer-copy">Puertos Henry, Masusa, Productores y Bellavista Nanay.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;
