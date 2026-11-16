export function partirDuracion(valor) {
  const total = Number(valor);
  if (!Number.isFinite(total) || total < 0) {
    return { horas: '', minutos: '' };
  }
  const horas = Math.floor(total);
  const minutos = Math.round((total - horas) * 60);
  if (minutos === 60) {
    return { horas: String(horas + 1), minutos: '0' };
  }
  return { horas: String(horas), minutos: String(minutos) };
}

export function combinarDuracion(horas, minutos) {
  const h = Number(horas);
  const m = Number(minutos);
  const horasOk = Number.isFinite(h) && h >= 0;
  const minutosOk = Number.isFinite(m) && m >= 0 && m < 60;
  if (!horasOk || !minutosOk) return null;
  const total = h + (m / 60);
  return total > 0 ? Math.round(total * 100) / 100 : null;
}

export function formatearDuracion(valor) {
  const { horas, minutos } = partirDuracion(valor);
  const h = Number(horas) || 0;
  const m = Number(minutos) || 0;
  if (h === 0 && m === 0) return '-';
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`;
  if (h === 0) return m === 1 ? '1 minuto' : `${m} minutos`;
  const textoHoras = h === 1 ? '1 h' : `${h} h`;
  const textoMinutos = m === 1 ? '1 min' : `${m} min`;
  return `${textoHoras} ${textoMinutos}`;
}
