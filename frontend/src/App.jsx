import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
