export const FILTROS_STORAGE_KEY = 'lanchaya:filtros';

export function leerFiltrosGuardados(base) {
  const iniciales = { ...base };
  if (typeof window === 'undefined') return iniciales;

  try {
    const guardado = window.localStorage.getItem(FILTROS_STORAGE_KEY);
    if (!guardado) return iniciales;

    const datos = JSON.parse(guardado);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      window.localStorage.removeItem(FILTROS_STORAGE_KEY);
      return iniciales;
    }

    const filtros = { ...iniciales };
    Object.keys(iniciales).forEach((clave) => {
      if (typeof datos[clave] === 'string') filtros[clave] = datos[clave];
    });
    return filtros;
  } catch {
    try {
      window.localStorage.removeItem(FILTROS_STORAGE_KEY);
    } catch {
      // Si el navegador bloquea localStorage, seguimos con los filtros por defecto.
    }
    return iniciales;
  }
}

export function guardarFiltros(filtros) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtros));
  } catch {
    // La página debe seguir funcionando aunque localStorage esté bloqueado o lleno.
  }
}

export function borrarFiltros() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(FILTROS_STORAGE_KEY);
  } catch {
    // Sin localStorage no hay nada que borrar.
  }
}
