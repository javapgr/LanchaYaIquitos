function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function textoReserva(reserva) {
  const salida = String(reserva.fechaHora || '').replace('T', ' ');
  return [
    'LANCHA YA! — Comprobante de reserva',
    '--------------------------------',
    `Código: ${reserva.codigo}`,
    `Pasajero: ${reserva.nombre || '-'}`,
    `Destino: ${reserva.destino || '-'}`,
    `Salida: ${salida || '-'}`,
    `Cantidad: ${reserva.cantidad ?? '-'}`,
    reserva.empresa ? `Empresa: ${reserva.empresa}` : null,
    '',
    'Guarda este código para consultar tu reserva en LANCHA YA!',
  ].filter((linea) => linea !== null).join('\n');
}

function htmlReserva(reserva) {
  const salida = String(reserva.fechaHora || '').replace('T', ' ');
  const empresa = reserva.empresa
    ? `<div class="row"><span>Empresa</span><strong>${escaparHtml(reserva.empresa)}</strong></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reserva ${escaparHtml(reserva.codigo)} — LANCHA YA!</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --verde: #14532d;
      --rio: #0b3d4a;
      --arena: #f2efe8;
      --muted: #5b6b62;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: "Nunito Sans", "Segoe UI", sans-serif;
      color: #1a2a22;
      background: var(--arena);
    }
    .ticket {
      width: min(440px, 100%);
      background: #fff;
      border: 1px solid rgba(20, 83, 45, 0.12);
      border-radius: 18px;
      padding: 28px 24px;
      box-shadow: 0 12px 28px rgba(11, 61, 74, 0.12);
    }
    .brand {
      font-family: Fraunces, Georgia, serif;
      color: var(--verde);
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: .04em;
      margin: 0 0 4px;
    }
    .eyebrow {
      margin: 0 0 18px;
      color: var(--muted);
      font-size: .85rem;
      font-weight: 600;
    }
    .codigo {
      display: block;
      text-align: center;
      font-family: Fraunces, Georgia, serif;
      font-size: 2rem;
      letter-spacing: .14em;
      color: var(--rio);
      background: #e7f2ea;
      border-radius: 12px;
      padding: 14px 12px;
      margin: 0 0 18px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 0;
      border-bottom: 1px solid #e5ece7;
      font-size: .95rem;
    }
    .row span { color: var(--muted); font-weight: 600; }
    .row strong { text-align: right; font-weight: 700; }
    .nota {
      margin: 18px 0 0;
      color: var(--muted);
      font-size: .88rem;
      line-height: 1.45;
      text-align: center;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .ticket { box-shadow: none; border: 0; }
    }
  </style>
</head>
<body>
  <article class="ticket">
    <p class="brand">LANCHA YA!</p>
    <p class="eyebrow">Comprobante de reserva</p>
    <strong class="codigo">${escaparHtml(reserva.codigo)}</strong>
    <div class="row"><span>Pasajero</span><strong>${escaparHtml(reserva.nombre || '-')}</strong></div>
    <div class="row"><span>Destino</span><strong>${escaparHtml(reserva.destino || '-')}</strong></div>
    <div class="row"><span>Salida</span><strong>${escaparHtml(salida || '-')}</strong></div>
    <div class="row"><span>Cantidad</span><strong>${escaparHtml(reserva.cantidad ?? '-')}</strong></div>
    ${empresa}
    <p class="nota">Guarda este código para consultar tu reserva en LANCHA YA!</p>
  </article>
</body>
</html>`;
}

export function descargarReserva(reserva) {
  const contenido = htmlReserva(reserva);
  const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `reserva-${reserva.codigo}.html`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export async function copiarCodigoReserva(codigo) {
  await navigator.clipboard.writeText(codigo);
}
