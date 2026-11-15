const express = require('express');
const {
  crearReserva,
  listarReservas,
  eliminarReserva,
  obtenerReservaPorCodigo,
} = require('../controllers/reservas.controller');

const router = express.Router();

router.get('/salidas/:id/reservas', listarReservas);
router.post('/salidas/:id/reservas', crearReserva);
router.delete('/reservas/:id', eliminarReserva);
router.get('/reservas/:codigo', obtenerReservaPorCodigo);

module.exports = router;
