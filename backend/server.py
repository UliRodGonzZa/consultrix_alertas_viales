from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import MinMaxScaler

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Sistema de Alertas Viales API")
api_router = APIRouter(prefix="/api")

# ─── Load pre-processed dashboard data ────────────────────────────────────
DATA_PATH = ROOT_DIR.parent / "data" / "dashboard_data.json"
dashboard_data = {}
if DATA_PATH.exists():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        dashboard_data = json.load(f)

# ─── Pydantic models ───────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    anio: int
    mes: int
    autos: float
    camiones_2_ejes: float
    camiones_5_ejes: float
    camiones_6_ejes: float
    total: float

class PredictResponse(BaseModel):
    alerta: str
    probabilidades: dict

# ─── Train model at startup ────────────────────────────────────────────────
_clf = None
_p75 = None
_p50 = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def _train_model():
    global _clf, _p75, _p50
    try:
        transito_path = ROOT_DIR.parent / "data" / "transito.csv"
        if not transito_path.exists():
            return
        df = pd.read_csv(transito_path, encoding='utf-8', on_bad_lines='skip')
        columnas_v = ['autos','motos','autobus_2_ejes','autobus_3_ejes','autobus_4_ejes',
            'camiones_2_ejes','camiones_3_ejes','camiones_4_ejes','camiones_5_ejes',
            'camiones_6_ejes','camiones_7_ejes','camiones_8_ejes','camiones_9_ejes',
            'triciclos','eje_extra_autobus','eje_extra_camion','peatones']
        df[columnas_v] = df[columnas_v].fillna(0)
        df = df.dropna(subset=['total'])
        _p75 = df['total'].quantile(0.75)
        _p50 = df['total'].quantile(0.50)
        def alerta(v):
            if v >= _p75: return "ALTA"
            elif v >= _p50: return "MEDIA"
            return "BAJA"
        df['alerta'] = df['total'].apply(alerta)
        features = ['anio','mes','autos','camiones_2_ejes','camiones_5_ejes','camiones_6_ejes','total']
        X = df[features].fillna(0)
        y = df['alerta']
        _clf = DecisionTreeClassifier(max_depth=4, min_samples_leaf=20, random_state=42)
        _clf.fit(X, y)
        logger.info("ML model trained successfully")
    except Exception as e:
        logger.error(f"Model training failed: {e}")

# ─── Routes ────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"message": "Sistema de Alertas Viales API v1.0"}

@api_router.get("/kpis")
async def get_kpis():
    return dashboard_data.get("kpis", {})

@api_router.get("/trafico/anual")
async def get_trafico_anual():
    return dashboard_data.get("trafico_anual", [])

@api_router.get("/trafico/mensual")
async def get_trafico_mensual(anio: Optional[int] = None):
    data = dashboard_data.get("flujo_mensual", [])
    if anio:
        data = [d for d in data if d["anio"] == anio]
    return data

@api_router.get("/trafico/heatmap")
async def get_heatmap():
    return dashboard_data.get("heatmap", [])

@api_router.get("/accidentes/por_dia")
async def get_accidentes_dia():
    return dashboard_data.get("accidentes_por_dia", [])

@api_router.get("/accidentes/iluminacion")
async def get_iluminacion():
    return dashboard_data.get("iluminacion", [])

@api_router.get("/accidentes/riesgo_estados")
async def get_riesgo_estados():
    return dashboard_data.get("riesgo_estados", [])

@api_router.get("/modelo/datos")
async def get_modelo_datos():
    return dashboard_data.get("ml_data", {})

@api_router.get("/alertas")
async def get_alertas(nivel: Optional[str] = None):
    data = dashboard_data.get("alertas", [])
    if nivel and nivel.upper() in ["ALTA","MEDIA","BAJA"]:
        data = [d for d in data if d["alerta"] == nivel.upper()]
    return data

@api_router.post("/modelo/predecir", response_model=PredictResponse)
async def predecir_alerta(req: PredictRequest):
    if _clf is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")
    features = [[req.anio, req.mes, req.autos, req.camiones_2_ejes,
                 req.camiones_5_ejes, req.camiones_6_ejes, req.total]]
    pred = _clf.predict(features)[0]
    proba = _clf.predict_proba(features)[0]
    classes = _clf.classes_.tolist()
    return PredictResponse(
        alerta=pred,
        probabilidades={c: round(float(p)*100,1) for c,p in zip(classes, proba)}
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    _train_model()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
