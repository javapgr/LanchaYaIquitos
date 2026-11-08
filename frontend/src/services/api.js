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
    throw new Error(body.error || 'No se pudo completar la solicitud');
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
export const crearSalida = (salida) =>
  request('/salidas', { method: 'POST', body: JSON.stringify(salida) });
export const actualizarSalida = (id, salida) =>
  request(`/salidas/${id}`, { method: 'PUT', body: JSON.stringify(salida) });
export const eliminarSalida = (id) => request(`/salidas/${id}`, { method: 'DELETE' });
