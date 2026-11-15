const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.mensaje || 'No se pudo completar la solicitud');
  }

  return response.status === 204 ? null : response.json();
}

export function obtenerSalidas(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });
  const query = params.toString();
  return request(`/salidas${query ? `?${query}` : ''}`);
}

export const obtenerDestinos = () => request('/destinos');
export const obtenerEmpresas = () => request('/empresas');
export const obtenerEmpresa = (id) => request(`/empresas/${id}`);
export const crearEmpresa = (empresa) =>
  request('/empresas', { method: 'POST', body: JSON.stringify(empresa) });
export const actualizarEmpresa = (id, empresa) =>
  request(`/empresas/${id}`, { method: 'PUT', body: JSON.stringify(empresa) });
export const eliminarEmpresa = (id) => request(`/empresas/${id}`, { method: 'DELETE' });
export const obtenerSalidasEmpresa = (id) => request(`/empresas/${id}/salidas`);
export const crearSalida = (salida) =>
  request('/salidas', { method: 'POST', body: JSON.stringify(salida) });
export const actualizarSalida = (id, salida) =>
  request(`/salidas/${id}`, { method: 'PUT', body: JSON.stringify(salida) });
export const actualizarEstadoSalida = (id, estado) =>
  request(`/salidas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) });
export const eliminarSalida = (id) => request(`/salidas/${id}`, { method: 'DELETE' });
