# LanchaYa Iquitos

Consulta y administración de salidas fluviales desde Iquitos: destinos, horarios, precios y cupos.

## Estructura

```
lanchaya/
├── backend/          # API Express + SQLite (puerto 3000)
├── frontend/         # React + Vite
├── SPEC.md           # Fuente de verdad
├── render.yaml       # Deploy backend (Render)
└── README.md
```

## Requisitos

- Node.js 22 o superior

## Backend

```bash
cd backend
npm install
npm run dev
```

API en `http://localhost:3000`.

Variables opcionales (ver `backend/.env.example`):

- `PORT`
- `DATABASE_PATH` — ruta del archivo SQLite (por defecto `src/data/salidas.db`)
- `CORS_ORIGIN` — orígenes permitidos separados por coma

Scripts:

- `npm start` — producción
- `npm run dev` — desarrollo con nodemon

### Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/salidas` | Listar (filtros: `destino`, `fecha`, `tipo`, `q`) |
| GET | `/api/salidas/:id` | Obtener una salida |
| POST | `/api/salidas` | Crear |
| PUT | `/api/salidas/:id` | Actualizar |
| DELETE | `/api/salidas/:id` | Eliminar |
| GET | `/api/destinos` | Destinos únicos |
| GET | `/api/health` | Salud |

Persistencia: SQLite (`src/data/salidas.db`). Si la base está vacía, se siembra desde `src/data/salidas.json` (12 registros).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Por defecto consume `http://localhost:3000/api`. Cámbialo con `VITE_API_URL` (ver `frontend/.env.example`).

Rutas:

- `/` — listado público con filtros (solo lectura)
- `/admin` — registrar, editar y eliminar salidas

Scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`

## Extras implementados

- Indicador de cupos con color: verde (> 20), amarillo (6–20), rojo (0–5)
- Búsqueda por texto de empresa o embarcación (`?q=`)
- Persistencia en SQLite (`node:sqlite`, Node 22+)
- Despliegue: Render (API) + Vercel (frontend)

## Despliegue

### Backend (Render)

1. Conecta el repo en [Render](https://render.com).
2. Usa `render.yaml` o crea un Web Service con:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
3. Variable `CORS_ORIGIN` = URL del frontend en Vercel (sin barra final).

### Frontend (Vercel)

1. Importa el repo en [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Build: `npm run build`
4. Output: `dist`
5. Variable `VITE_API_URL` = `https://TU-API.onrender.com/api`

## Fuera de alcance

Login, pagos y ventas.
