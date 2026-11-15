const express = require('express');
const { obtenerEstadisticas } = require('../controllers/estadisticas.controller');

const router = express.Router();

router.get('/estadisticas', obtenerEstadisticas);

module.exports = router;
