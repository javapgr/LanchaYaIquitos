const express = require('express');
const {
  listarEmpresas,
  obtenerEmpresa,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
  listarSalidasEmpresa,
} = require('../controllers/empresas.controller');

const router = express.Router();

router.get('/empresas', listarEmpresas);
router.get('/empresas/:id/salidas', listarSalidasEmpresa);
router.get('/empresas/:id', obtenerEmpresa);
router.post('/empresas', crearEmpresa);
router.put('/empresas/:id', actualizarEmpresa);
router.delete('/empresas/:id', eliminarEmpresa);

module.exports = router;
