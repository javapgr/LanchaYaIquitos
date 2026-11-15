const tiposPermitidos = ['lancha', 'rapido', 'deslizador'];

function normalizarFechaHora(valor) {
  if (typeof valor !== 'string' || Number.isNaN(Date.parse(valor))) {
    return null;
  }

  const fechaSinZona = valor.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (fechaSinZona && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(valor.slice(16))) {
    return `${fechaSinZona[1]}T${fechaSinZona[2]}`;
  }

  return new Date(valor).toISOString().slice(0, 16);
}

function validarSalida(body, { esNuevo = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'El cuerpo de la solicitud debe ser un objeto';
  }

  for (const campo of ['empresa', 'embarcacion', 'destino', 'puerto', 'fechaHora']) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      return `El campo ${campo} es obligatorio`;
    }
  }

  if (!tiposPermitidos.includes(body.tipo)) {
    return 'El tipo debe ser lancha, rapido o deslizador';
  }

  if (typeof body.precio !== 'number' || !Number.isFinite(body.precio) || body.precio <= 0) {
    return 'El precio debe ser un número mayor que 0';
  }

  const fechaHora = normalizarFechaHora(body.fechaHora);
  if (!fechaHora) {
    return 'La fechaHora debe ser una fecha válida en formato ISO 8601';
  }

  if (esNuevo && new Date(fechaHora) < new Date()) {
    return 'La fechaHora no puede estar en el pasado';
  }

  if (
    typeof body.duracionHoras !== 'number' ||
    !Number.isFinite(body.duracionHoras) ||
    body.duracionHoras <= 0
  ) {
    return 'La duracionHoras debe ser un número mayor que 0';
  }

  if (!Number.isInteger(body.cupos) || body.cupos < 0) {
    return 'Los cupos deben ser un número entero igual o mayor que 0';
  }

  return null;
}

function obtenerId(parametro) {
  const id = Number(parametro);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function datosSalida(body) {
  const { id: _ignorado, ...datos } = body;
  return {
    empresa: datos.empresa.trim(),
    embarcacion: datos.embarcacion.trim(),
    tipo: datos.tipo,
    destino: datos.destino.trim(),
    puerto: datos.puerto.trim(),
    fechaHora: normalizarFechaHora(datos.fechaHora),
    duracionHoras: datos.duracionHoras,
    precio: datos.precio,
    cupos: datos.cupos,
  };
}

module.exports = {
  validarSalida,
  obtenerId,
  datosSalida,
  normalizarFechaHora,
};
