# LANCHA YA! — Iquitos

**LANCHA YA!** concentra las salidas fluviales en un solo lugar: destino, hora, precio, puerto y cupos.

Los pasajeros consultan y filtran. El administrador registra, edita y elimina salidas.

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
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js 22 + Express 4 |
| Base de datos | SQLite (`node:sqlite`) |
| Deploy | Vercel (frontend) + Render (API) |

---

## Qué puedes hacer

- Ver salidas ordenadas por fecha
- Filtrar por destino, fecha, tipo, precio y periodo (`hoy` o `48h`)
- Buscar por empresa o embarcación
- Ordenar y paginar resultados desde el servidor
- Ver cupos con color (verde / amarillo / rojo)
- Admin: crear, editar y eliminar salidas
- Admin: gestionar empresas activas y asociarlas a las salidas

---

## Cómo correrlo en local

Necesitas **Node.js 22+**.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API en `http://localhost:3000`

La base SQLite usa `DATA_PATH` como ruta opcional al archivo. Si `salidas` ya
tiene registros, el seed no se vuelve a ejecutar. Para refrescar una base local
existente, detén el backend, respalda el archivo indicado por `DATA_PATH` y
elimínalo; al iniciar nuevamente se creará y sembrará desde
`backend/src/data/salidas.json`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App en `http://localhost:5173` (consume `http://localhost:3000/api` por defecto).

Si los puertos 3000 o 5173 quedan ocupados por procesos node viejos, ejecuta desde la raíz `powershell -ExecutionPolicy Bypass -File scripts/liberar-puertos.ps1`: muestra qué proceso los usa y cierra solo los que son node.

---

## Estructura

```
LanchaYaIquitos/
├── backend/     # API REST + SQLite
├── frontend/    # React (Home + Admin)
├── render.yaml
└── README.md
```

Rutas web:

- `/` — consulta pública
- `/admin` — gestión de salidas

---

## API

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/salidas` | Lista (filtros: `destino`, `fecha`, `tipo`, `q`, `precioMin`, `precioMax`, `rango`; orden: `orden=fecha|precio|duracion`, `dir=asc|desc`; paginación: `page`, `limit`) |
| GET | `/api/salidas/:id` | Detalle |
| POST | `/api/salidas` | Crear |
| PUT | `/api/salidas/:id` | Actualizar |
| PATCH | `/api/salidas/:id/estado` | Cambiar estado |
| POST | `/api/salidas/:id/reservas` | Crear reserva |
| GET | `/api/salidas/:id/reservas` | Listar reservas de una salida |
| DELETE | `/api/reservas/:id` | Cancelar reserva y devolver cupos |
| GET | `/api/reservas/:codigo` | Consultar reserva por código |
| DELETE | `/api/salidas/:id` | Eliminar |
| GET | `/api/destinos` | Destinos únicos |
| GET | `/api/empresas` | Empresas activas |
| GET | `/api/empresas/:id` | Detalle de empresa activa |
| POST | `/api/empresas` | Crear empresa |
| PUT | `/api/empresas/:id` | Actualizar empresa |
| DELETE | `/api/empresas/:id` | Dar de baja empresa |
| GET | `/api/empresas/:id/salidas` | Salidas de una empresa |
| GET | `/api/health` | Estado del servidor |

La base SQLite se crea sola y se siembra con 12 salidas desde `backend/src/data/salidas.json`.
Las empresas antiguas se migran con RUC temporales `20000000001`,
`20000000002`, etc. Estos RUC son editables, pero permanecen reservados cuando
una empresa se da de baja. Una empresa con salidas futuras responde `409` al
intentar darla de baja.
Los estados válidos de una salida son `programada`, `abordando`, `zarpó`,
`zarpo` y `cancelada`; `zarpo` se normaliza a `zarpó`.
Las reservas generan códigos únicos con formato `LY-XXXXX` y no requieren
pago. Las salidas canceladas o zarpadas no aceptan reservas.

---

## Deploy

- **Frontend (Vercel):** root `frontend` · env `VITE_API_URL=https://lanchayaiquitos.onrender.com/api`
- **Backend (Render):** root `backend` · `npm install` / `npm start` · env `NODE_VERSION=22`
