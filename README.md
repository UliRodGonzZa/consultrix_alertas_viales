# Sistema de Alertas Viales — CAPUFE
### Dashboard de Análisis de Datos — Equipo 2 · Consultrix

---

## Descripcion del proyecto

Dashboard interactivo construido en React (Atomic Design) + FastAPI + MongoDB para presentar el análisis de alertas viales en autopistas CAPUFE de México (2021–2025).

### Funcionalidades principales
- **5 pestañas**: Resumen, Tráfico, Accidentes, Modelo ML, Alertas
- **KPI Cards** con modales de detalle al hacer clic
- **9 gráficas interactivas** (Recharts): barras, líneas, mapas de calor, composites
- **Árbol de Decisión** (scikit-learn): matriz de confusión, reporte de clasificación, importancia de features
- **Formulario de predicción**: ingresa datos de un tramo y predice nivel ALTA / MEDIA / BAJA
- **Tabla de alertas** con filtros, búsqueda y modal de detalle por tramo

### Estructura Atomic Design
```
frontend/src/components/
├── atoms/          AlertBadge, Button, Spinner, Typography
├── molecules/      KpiCard, ChartCard, FormField
├── organisms/      Header, Sidebar, Modal
├── templates/      DashboardLayout
└── pages/          OverviewPage, TraficoPage, AccidentesPage, ModeloPage, AlertasPage
```

---

## Requisitos previos

| Herramienta | Version recomendada |
|-------------|---------------------|
| Node.js     | >= 18.x             |
| Python      | >= 3.10             |
| MongoDB     | >= 6.0              |
| Yarn        | >= 1.22             |
| pip         | >= 23               |

---

## Instalacion local paso a paso

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd <nombre-del-proyecto>
```

### 2. Preparar los archivos CSV

Coloca los 3 archivos CSV en la carpeta `data/` en la raíz del proyecto:

```
data/
├── 04_Tránsito_acumulado_año_en_curso_062025.csv
├── Aforo_CAPUFE_FNI_2023_092025.csv
└── sct_70_accidentes_dia.csv
```

### 3. Procesar los datos (generar dashboard_data.json)

```bash
cd <raíz del proyecto>
python3 scripts/process_data.py
```

> Esto genera `data/dashboard_data.json` con todos los datos pre-procesados que consume el backend.

Si no se tiene el script, ejecutar directamente desde la raiz:

```bash
python3 - << 'EOF'
import pandas as pd, numpy as np, json
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.preprocessing import MinMaxScaler

# (ejecuta el contenido del notebook Alertas_Sistema_Vial.ipynb)
EOF
```

### 4. Configurar el Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
```

Edita `backend/.env` con valores:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=alertas_viales
CORS_ORIGINS=http://localhost:3000
```

### 5. Iniciar el Backend

```bash
# Desde /backend (con venv activado)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

El API estará disponible en: `http://localhost:8001`
Documentación Swagger: `http://localhost:8001/docs`

### 6. Configurar el Frontend (React)

```bash
cd frontend

# Instalar dependencias
yarn install

# Configurar variable de entorno
cp .env.example .env
```

Edita `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 7. Iniciar el Frontend

```bash
# Desde /frontend
yarn start
```

El dashboard estará disponible en: `http://localhost:3000`

---

## Endpoints del API

| Método | Ruta                            | Descripcion                             |
|--------|---------------------------------|-----------------------------------------|
| GET    | `/api/kpis`                     | KPIs resumen (tramo critico, estado, etc.) |
| GET    | `/api/trafico/anual`            | Trafico total por año (2021-2025)       |
| GET    | `/api/trafico/mensual?anio=N`   | Flujo mensual por tramo y año           |
| GET    | `/api/trafico/heatmap`          | Mapa de calor top 10 tramos × años     |
| GET    | `/api/accidentes/por_dia`       | Accidentes y tasa mortalidad por dia    |
| GET    | `/api/accidentes/iluminacion`   | Accidentes por condicion de iluminacion |
| GET    | `/api/accidentes/riesgo_estados`| Indice de riesgo por estado             |
| GET    | `/api/modelo/datos`             | Datos del modelo ML (CM, reporte, etc.) |
| GET    | `/api/alertas?nivel=ALTA`       | Tabla de alertas por tramo (filtrable)  |
| POST   | `/api/modelo/predecir`          | Prediccion de nivel de alerta           |

### Ejemplo de prediccion

```bash
curl -X POST http://localhost:8001/api/modelo/predecir \
  -H "Content-Type: application/json" \
  -d '{
    "anio": 2025,
    "mes": 6,
    "autos": 250000,
    "camiones_2_ejes": 20000,
    "camiones_5_ejes": 30000,
    "camiones_6_ejes": 10000,
    "total": 350000
  }'
```

---

## Modelo ML — Arbol de Decision

| Parametro           | Valor             |
|---------------------|-------------------|
| Tipo                | DecisionTreeClassifier |
| Max depth           | 4                 |
| Min samples leaf    | 20                |
| Features            | anio, mes, autos, camiones_2_ejes, camiones_5_ejes, camiones_6_ejes, total |
| Clases              | ALTA, MEDIA, BAJA |
| Umbral ALTA         | >= percentil 75   |
| Umbral MEDIA        | >= percentil 50   |
| Umbral BAJA         | < percentil 50    |

---

## Dependencias principales

### Backend (`backend/requirements.txt`)
```
fastapi
uvicorn
motor
scikit-learn
pandas
numpy
python-dotenv
```

### Frontend (`frontend/package.json`)
```json
{
  "recharts": "^2.x",
  "@mui/icons-material": "^5.x",
  "@mui/material": "^5.x",
  "axios": "^1.x"
}
```

---

## Datos utilizados

| Archivo CSV                                    | Descripcion                              | Filas aprox. |
|------------------------------------------------|------------------------------------------|--------------|
| `04_Tránsito_acumulado_año_en_curso_062025.csv`| Tránsito diario por tramo CAPUFE 2021-25 | 2,872        |
| `Aforo_CAPUFE_FNI_2023_092025.csv`             | Aforo mensual por tipo de vehiculo       | 1,221        |
| `sct_70_accidentes_dia.csv`                    | Accidentes por estado y dia SCT          | 64           |

---

## Paleta de colores

| Color     | Uso                        | Hex      |
|-----------|----------------------------|----------|
| Violeta   | Color principal            | `#6B21A8` |
| Morado    | Hover / acento             | `#9333EA` |
| Naranja   | Años recientes / CTA       | `#E67E22` |
| Rojo      | Alerta ALTA                | `#C0392B` |
| Azul      | Alerta BAJA                | `#2980B9` |

---

## Equipo

- **Equipo 2 — Consultrix**
- Analisis: CAPUFE / SCT Mexico (2021–2025)
- Herramientas: Python, scikit-learn, FastAPI, React, Recharts, Material-UI
