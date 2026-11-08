const express = require('express');
const {
  listarSalidas,
  obtenerSalida,
  crearSalida,
  actualizarSalida,
  eliminarSalida,
  listarDestinos,
} = require('../controllers/salidas.controller');

const router = express.Router();

router.get('/destinos', listarDestinos);
router.get('/salidas', listarSalidas);
router.get('/salidas/:id', obtenerSalida);
router.post('/salidas', crearSalida);
router.put('/salidas/:id', actualizarSalida);
router.delete('/salidas/:id', eliminarSalida);

module.exports = router;
