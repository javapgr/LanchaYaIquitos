# SPEC — LanchaYa Iquitos

Fuente de verdad del proyecto. El código sigue a este documento.

## Objetivo

Aplicación web para consultar y administrar salidas fluviales desde Iquitos (empresas, destinos, horarios, precios y cupos).

## Alcance cerrado

Sin login, pagos ni ventas.

## Stack

- Backend: Node.js 20 + Express 4, CommonJS. Paquetes: `express`, `cors`, `better-sqlite3`, `nodemon` (dev). Puerto 3000 (o `PORT` en producción).
- Persistencia: SQLite (`backend/src/data/salidas.db`) con `better-sqlite3`. Semilla inicial desde `salidas.json` si la base está vacía.
- Frontend: React 18 + Vite, JavaScript (sin TypeScript), `fetch` o `axios`, `react-router-dom`. CSS propio (sin Tailwind ni librerías UI).
- No agregar dependencias fuera de este spec sin aprobación.

## Estructura

```
lanchaya/
├── backend/src/{index.js, db.js, routes/salidas.js, controllers/salidas.controller.js, data/salidas.json}
├── frontend/src/{App.jsx, pages/{Home,Admin}.jsx, components/{SalidaCard,Filtros,SalidaForm}.jsx, services/api.js}
└── README.md
```

## Modelo de salida

Campos:

- `id` (number, autogenerado)
- `empresa` (string)
- `embarcacion` (string)
- `tipo` (`lancha` | `rapido` | `deslizador`)
- `destino` (string)
- `puerto` (string)
- `fechaHora` (ISO 8601)
- `duracionHoras` (number > 0)
- `precio` (number > 0)
- `cupos` (entero >= 0)

Datos iniciales: al menos 12 registros sembrados desde `salidas.json`.

## Backend

- Rutas solo definen paths; la lógica va en el controller.
- Usar `express.json()`, `cors()` y middleware de errores al final `(err, req, res, next)`.
- Códigos: GET 200, POST 201, PUT 200/404, DELETE 204/404, validación 400.
- Errores 400: `{ "error": "mensaje claro en español" }`.
- `id` autogenerado. Nunca confiar en el `id` del body.
- Validar POST y PUT con `validarSalida(body, { esNuevo })`.
- En altas (`esNuevo`), `fechaHora` no puede estar en el pasado.
- Filtros `?destino=&fecha=&tipo=&q=` combinables; destino sin distinguir mayúsculas; `fecha` = `YYYY-MM-DD` contra `fechaHora`; `q` busca texto en `empresa` o `embarcacion` (sin distinguir mayúsculas).
- Listado ordenado por `fechaHora` ascendente.

### Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/salidas` | Listar (con filtros opcionales) |
| GET | `/api/salidas/:id` | Obtener una |
| POST | `/api/salidas` | Crear |
| PUT | `/api/salidas/:id` | Actualizar |
| DELETE | `/api/salidas/:id` | Eliminar |
| GET | `/api/destinos` | Destinos únicos ordenados |
| GET | `/api/health` | Salud del servicio |

## Frontend

- Rutas: `/` (Home: listado público con filtros, solo lectura) y `/admin` (formulario + listado con editar/eliminar). Navbar con links a ambas.
- Todas las llamadas HTTP solo en `services/api.js`.
- Componentes funcionales con hooks; presentacionales reciben props.
- Siempre manejar 3 estados: cargando, lista vacía, error de conexión.
- Validar el formulario con las mismas reglas del backend.
- Eliminar siempre con `window.confirm`.
- Mobile-first: legible en celular, estilo simple y limpio.
- Indicador de cupos con color: verde (> 20), amarillo (6–20), rojo (0–5).
- Búsqueda por texto de empresa o embarcación (`q`) en Home y Admin.

## Extras

- Persistencia SQLite en lugar de solo JSON.
- Despliegue: backend en Render, frontend en Vercel (`VITE_API_URL`, `CORS_ORIGIN`).

## Criterio de hecho

Cumple este spec, se ejecutó y se probó con evidencia real, sin errores, `console.log` de depuración ni código muerto.
