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
- Filtrar por destino, fecha y tipo (`lancha`, `rapido`, `deslizador`)
- Buscar por empresa o embarcación
- Ver cupos con color (verde / amarillo / rojo)
- Admin: crear, editar y eliminar salidas

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

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App en `http://localhost:5173` (consume `http://localhost:3000/api` por defecto).

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
| GET | `/api/salidas` | Lista (filtros: `destino`, `fecha`, `tipo`, `q`) |
| GET | `/api/salidas/:id` | Detalle |
| POST | `/api/salidas` | Crear |
| PUT | `/api/salidas/:id` | Actualizar |
| DELETE | `/api/salidas/:id` | Eliminar |
| GET | `/api/destinos` | Destinos únicos |
| GET | `/api/health` | Estado del servidor |

La base SQLite se crea sola y se siembra con 12 salidas desde `backend/src/data/salidas.json`.

---

## Deploy

- **Frontend (Vercel):** root `frontend` · env `VITE_API_URL=https://lanchayaiquitos.onrender.com/api`
- **Backend (Render):** root `backend` · `npm install` / `npm start` · env `NODE_VERSION=22`
