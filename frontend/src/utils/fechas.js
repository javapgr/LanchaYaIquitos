const ZONA_LIMA = 'America/Lima';

function partesDesdeTexto(valor) {
  const coincidencia = String(valor ?? '').match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  );
  if (!coincidencia) return null;
  return {
    anio: Number(coincidencia[1]),
    mes: Number(coincidencia[2]),
    dia: Number(coincidencia[3]),
    hora: Number(coincidencia[4]),
    minuto: Number(coincidencia[5]),
  };
}

export function partesLima(valor) {
  const texto = String(valor ?? '');
  const partes = partesDesdeTexto(texto);
  const tieneZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(texto);

  if (partes && !tieneZona) return partes;

  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime())) return null;

  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_LIMA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const datos = {};
  formateador.formatToParts(fecha).forEach((parte) => {
    if (parte.type !== 'literal') datos[parte.type] = Number(parte.value);
  });

  if (!datos.year || !datos.month || !datos.day) return null;
  return {
    anio: datos.year,
    mes: datos.month,
    dia: datos.day,
    hora: datos.hour,
    minuto: datos.minute,
  };
}

export function timestampLima(valor) {
  const partes = partesLima(valor);
  if (!partes) return null;
  return Date.UTC(
    partes.anio,
    partes.mes - 1,
    partes.dia,
    partes.hora + 5,
    partes.minuto,
    0,
  );
}

export function haPasado(valor) {
  const objetivo = timestampLima(valor);
  return objetivo !== null && objetivo <= Date.now();
}

export function formatearFecha(valor) {
  const partes = partesLima(valor);
  if (!partes) return 'Fecha inválida';
  return `${String(partes.dia).padStart(2, '0')}/${String(partes.mes).padStart(2, '0')}/${partes.anio}`;
}

export function formatearHora(valor) {
  const partes = partesLima(valor);
  if (!partes) return '--:--';
  return `${String(partes.hora).padStart(2, '0')}:${String(partes.minuto).padStart(2, '0')}`;
}

export function formatearFechaHora(valor) {
  return `${formatearFecha(valor)} ${formatearHora(valor)}`;
}

export function crearMensajeWhatsApp(salida) {
  return [
    `Salida a ${salida.destino}`,
    `${formatearFecha(salida.fechaHora)} a las ${formatearHora(salida.fechaHora)} (hora de Lima)`,
    `Puerto: ${salida.puerto}`,
    'LanchaYa!',
  ].join(' · ');
}

export function crearUrlWhatsApp(salida, urlPublica = '') {
  const mensaje = crearMensajeWhatsApp(salida);
  const texto = urlPublica ? `${mensaje} ${urlPublica}` : mensaje;
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
