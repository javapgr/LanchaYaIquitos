# LanchaYa Iquitos

Consulta y administración de salidas fluviales desde Iquitos: destinos, horarios, precios y cupos.

## Estructura

```
lanchaya/
├── backend/          # API Express (puerto 3000)
├── frontend/         # React + Vite
├── SPEC.md           # Fuente de verdad
└── README.md
```

## Requisitos

- Node.js 20 o superior

## Backend

```bash
cd backend
npm install
npm run dev
```

API en `http://localhost:3000`.

Scripts:

- `npm start` — producción (`node src/index.js`)
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

Datos: `backend/src/data/salidas.json` (12 registros iniciales).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Por defecto consume `http://localhost:3000/api`. Puedes cambiarlo con `VITE_API_URL`.

Rutas:

- `/` — listado público con filtros (solo lectura)
- `/admin` — registrar, editar y eliminar salidas

Scripts:

- `npm run dev` — servidor de desarrollo Vite
- `npm run build` — build de producción
- `npm run preview` — previsualizar el build

## Extras implementados

- Indicador de cupos con color: verde (> 20), amarillo (6–20), rojo (0–5).
- Búsqueda por texto de empresa o embarcación (`?q=`).

## Fuera de alcance

Login, pagos, ventas y despliegue.
