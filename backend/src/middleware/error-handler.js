function responderError(res, status, mensaje) {
  return res.status(status).json({ error: true, mensaje });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return responderError(res, 400, 'El cuerpo JSON no es válido');
  }

  console.error(error);
  return responderError(res, 500, 'Error interno del servidor');
}

module.exports = { errorHandler, responderError };
