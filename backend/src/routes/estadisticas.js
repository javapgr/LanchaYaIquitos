const express = require('express');
const { listarEstadisticas } = require('../controllers/estadisticas.controller');

const router = express.Router();

router.get('/estadisticas', listarEstadisticas);

module.exports = router;
