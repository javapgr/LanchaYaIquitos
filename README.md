# LANCHA YA! — Iquitos

**LANCHA YA!** concentra las salidas fluviales en un solo lugar: destino, hora, precio, puerto y cupos.

Los pasajeros consultan y filtran. El administrador registra, edita y elimina salidas, gestiona empresas, reservas y ve estadísticas.

**Integrantes:**
Dev-Danilo Said Bardales Panduro

---

## Demo

| | URL |
|---|---|
| App | https://lanchaya.vercel.app |
| API | https://lanchayaiquitos.onrender.com/api/salidas |
| Health | https://lanchayaiquitos.onrender.com/api/health |

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + Vite + React Router + Recharts |
| Backend | Node.js 22 + Express 4 |
| Base de datos | SQLite (`node:sqlite`) |
| Deploy | Vercel (frontend) + Render (API) |

---

## Qué puedes hacer

- Ver salidas ordenadas por fecha
- Filtrar por destino, fecha y tipo (`lancha`, `rapido`, `deslizador`)
- Buscar por empresa o embarcación
- Ver cupos con color (verde / amarillo / rojo)
- Reservar cupos y consultar reserva por código
- Admin: crear, editar y eliminar salidas; cambiar estado
- Admin: gestionar empresas activas y asociarlas a las salidas
- Admin: panel de estadísticas (`/admin/panel`)

---

## Cómo correrlo en local

Necesitas **Node.js 22+**.

### Variables de entorno (backend)

Copia `backend/.env.example` a `backend/.env`:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del API (por defecto `3000`) |
| `DATA_PATH` | Ruta opcional al archivo SQLite. Si está vacío, usa `backend/src/data/salidas.db` |
| `CORS_ORIGIN` | Orígenes permitidos (ej. `http://localhost:5173`) |

Frontend: `frontend/.env.example` → `VITE_API_URL` (por defecto `http://localhost:3000/api`).

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API en `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App en `http://localhost:5173`.

Si los puertos 3000 o 5173 quedan ocupados, desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/liberar-puertos.ps1
```

### Reiniciar el seed

La base SQLite se crea sola. Si la tabla `salidas` ya tiene registros, el seed **no** se vuelve a ejecutar.

Para sembrar de nuevo:

1. Detén el backend.
2. Respaldá el archivo de `DATA_PATH` (o `backend/src/data/salidas.db`) si lo necesitas.
3. Elimina ese archivo (y sus `-wal` / `-shm` si existen).
4. Vuelve a iniciar el backend: se crea la BD y se siembra desde `backend/src/data/salidas.json`.

Las fechas del seed son **relativas a la fecha actual** (`diasDesdeHoy`): incluye salidas de hoy, mañana y los días siguientes, para que el filtro por fecha de hoy funcione en una BD nueva.

---

## Estructura

```
LanchaYaIquitos/
├── backend/     # API REST + SQLite
├── frontend/    # React (Home + Admin + Panel)
├── docs/        # Colección Postman/Thunder
├── scripts/
├── render.yaml
└── README.md
```

Rutas web:

- `/` — consulta pública
- `/admin` — gestión de salidas
- `/admin/panel` — estadísticas
- `/empresas` — gestión de empresas
- `/reservas` — consulta de reserva por código

Colección HTTP: importa `docs/LanchaYa.postman_collection.json` en Postman o Thunder Client.

---

## API

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/salidas` | Lista (filtros: `destino`, `fecha`, `tipo`, `q`) |
| GET | `/api/salidas/:id` | Detalle |
| POST | `/api/salidas` | Crear |
| PUT | `/api/salidas/:id` | Actualizar |
| PATCH | `/api/salidas/:id/estado` | Cambiar estado |
| DELETE | `/api/salidas/:id` | Eliminar |
| POST | `/api/salidas/:id/reservas` | Crear reserva |
| GET | `/api/salidas/:id/reservas` | Listar reservas de una salida |
| DELETE | `/api/reservas/:id` | Cancelar reserva y devolver cupos |
| GET | `/api/reservas/:codigo` | Consultar reserva por código |
| GET | `/api/destinos` | Destinos únicos |
| GET | `/api/empresas` | Empresas activas |
| GET | `/api/empresas/:id` | Detalle de empresa activa |
| POST | `/api/empresas` | Crear empresa |
| PUT | `/api/empresas/:id` | Actualizar empresa |
| DELETE | `/api/empresas/:id` | Dar de baja empresa |
| GET | `/api/empresas/:id/salidas` | Salidas de una empresa |
| GET | `/api/estadisticas` | Totales, por destino/tipo y cupos |
| GET | `/api/health` | Estado del servidor |

Errores de negocio usan `{ "error": true, "mensaje": "..." }` (400 / 404 / 409 según el caso).

La base SQLite se siembra con 12 salidas desde `backend/src/data/salidas.json`.
Las empresas antiguas se migran con RUC temporales `20000000001`, etc.
Una empresa con salidas futuras responde `409` al intentar darla de baja.
Estados válidos: `programada`, `abordando`, `zarpó`, `zarpo`, `cancelada` (`zarpo` → `zarpó`).
Las reservas generan códigos `LY-XXXXX`. Salidas canceladas o zarpadas no aceptan reservas.

---

## Deploy

- **Frontend (Vercel):** root `frontend` · env `VITE_API_URL=https://lanchayaiquitos.onrender.com/api`
- **Backend (Render):** root `backend` · `npm install` / `npm start` · env `NODE_VERSION=22`
