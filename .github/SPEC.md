# SPEC — LanchaYa Iquitos

## Qué es
App web full stack. Las empresas fluviales de Iquitos registran sus salidas (lanchas, rápidos, deslizadores) y los pasajeros las consultan y filtran por destino, fecha y tipo. Iquitos no tiene carretera al resto del país, el río es el transporte principal (Nauta, Requena, Yurimaguas, Pucallpa, Santa Rosa, Caballococha). Puertos: Henry, Masusa, Productores, Bellavista Nanay.

## Alcance
**Incluye:** API REST con CRUD de salidas + listado de destinos, frontend React que la consume, filtros, validación en backend y frontend, README.
**No incluye:** login, pagos, venta de pasajes, despliegue.
**Entrega:** hoy 08/11/2026 23:59. GitHub público + README + video 2–3 min + ZIP sin `node_modules` (`S#_ProyectoFullStack_Apellidos`).

## Modelo: `Salida`
| Campo | Tipo | Ejemplo |
|---|---|---|
| id | número (autogenerado) | 1 |
| empresa | texto | Transportes Río Itaya |
| embarcacion | texto | Don José II |
| tipo | `lancha` \| `rapido` \| `deslizador` | rapido |
| destino | texto | Nauta |
| puerto | texto | Puerto Productores |
| fechaHora | texto ISO 8601 | 2026-11-09T06:30 |
| duracionHoras | número | 2 |
| precio | número (S/) | 20 |
| cupos | número | 30 |

## API (backend, puerto 3000)
| Método | Ruta | Respuesta |
|---|---|---|
| GET | /api/salidas (`?destino=&fecha=&tipo=`) | 200 + arreglo |
| GET | /api/salidas/:id | 200 / 404 |
| POST | /api/salidas | 201 + objeto creado |
| PUT | /api/salidas/:id | 200 / 404 |
| DELETE | /api/salidas/:id | 204 / 404 |
| GET | /api/destinos | 200 + arreglo sin repetidos |

### Validaciones (400 con `{ "error": "mensaje claro" }`)
- `empresa`, `destino`, `puerto`, `fechaHora` obligatorios.
- `precio` número > 0.
- `tipo` solo `lancha`, `rapido`, `deslizador`.
- `fechaHora` no puede estar en el pasado al registrar (POST).
- Usar `express.json()`, `cors()` y middleware de manejo de errores.

## Frontend (React + Vite)
1. **Listado:** tarjetas con empresa, destino, puerto, fecha y hora, precio y tipo. Orden por fecha más próxima.
2. **Filtros:** select de destino (desde `/api/destinos`), input de fecha, select de tipo, botón "Limpiar filtros".
3. **Formulario:** registrar y editar, con validación antes de enviar (mismas reglas del backend).
4. **Eliminar:** con confirmación.
5. **Estados:** cargando, lista vacía, error de conexión.
6. **Diseño:** responsive, legible en celular.

## Datos semilla (`backend/src/data/salidas.json`)
Ya existen 4 registros (ids 1–4):
1. Transportes Río Itaya · Don José II · rapido · Nauta · Puerto Productores · 2026-11-09T06:30 · 2 h · S/20 · 30 cupos
2. Fluvial Amazonas · Eduardo VII · lancha · Yurimaguas · Puerto Henry · 2026-11-09T18:00 · 72 h · S/120 · 150 cupos
3. Expreso Marañón · Gilmer IV · rapido · Requena · Puerto Henry · 2026-11-10T05:00 · 4 h · S/70 · 40 cupos
4. Trifrontera Express · Golfinho · rapido · Santa Rosa · Puerto Henry · 2026-11-10T05:30 · 10 h · S/200 · 45 cupos

**Agregar al menos 8 más** (ids 5–12): empresas y embarcaciones ficticias, mezclar los 3 tipos, destinos variados (Nauta, Requena, Yurimaguas, Pucallpa, Santa Rosa, Caballococha), puertos variados (Henry, Masusa, Productores, Bellavista Nanay), fechas futuras desde 2026-11-09, precios realistas.

## Rúbrica (20 pts)
API completa 5 · Validaciones 3 · Frontend consume API 4 · Filtros 3 · Diseño/usabilidad 2 · Código y estructura 2 · README y video 1.

## Extras opcionales (+2)
Cupos con color (verde/amarillo/rojo) · búsqueda por texto de empresa/embarcación · SQLite · despliegue.

## Orden de trabajo sugerido
1. Repo + estructura + Express con `GET /api/salidas`.
2. CRUD, validaciones, filtros (probar en Thunder Client).
3. Vite + `api.js` + listado de tarjetas.
4. Filtros + formulario registro/edición.
5. Eliminar, estados, responsive.
6. README (integrantes, `npm install`, `npm run dev` de cada parte), video, entrega.
