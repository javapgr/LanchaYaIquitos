import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import Home from './pages/Home';

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
              <NavLink to="/admin">Administración</NavLink>
            </nav>
          </div>
        </header>
        <div className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
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
              <NavLink to="/admin">Administración</NavLink>
            </nav>
            <p className="footer-copy">Puertos Henry, Masusa, Productores y Bellavista Nanay.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
