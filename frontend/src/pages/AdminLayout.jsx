import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <main className="container admin-page">
      <nav className="admin-subnav" aria-label="Administración">
        <NavLink to="/admin" end>Salidas</NavLink>
        <NavLink to="/admin/empresas">Empresas</NavLink>
      </nav>
      <Outlet />
    </main>
  );
}

export default AdminLayout;
