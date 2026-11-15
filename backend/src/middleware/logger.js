function logger(req, res, next) {
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duracionMs.toFixed(1)} ms`);
  });

  next();
}

module.exports = logger;
