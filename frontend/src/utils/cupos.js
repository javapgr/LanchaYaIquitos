export function claseCupos(cupos) {
  if (cupos > 20) return 'cupos-verde';
  if (cupos > 5) return 'cupos-amarillo';
  return 'cupos-rojo';
}

export function etiquetaCupos(cupos) {
  if (cupos > 20) return 'Disponible';
  if (cupos > 5) return 'Limitado';
  if (cupos > 0) return 'Agotándose';
  return 'Agotado';
}
