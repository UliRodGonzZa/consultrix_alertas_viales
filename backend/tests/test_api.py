"""Backend API tests for Sistema de Alertas Viales"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestKPIs:
    def test_kpis_returns_200(self):
        r = requests.get(f"{BASE_URL}/api/kpis")
        assert r.status_code == 200

    def test_kpis_has_expected_keys(self):
        r = requests.get(f"{BASE_URL}/api/kpis")
        data = r.json()
        assert isinstance(data, dict)
        # Should have some keys
        assert len(data) > 0

class TestTrafico:
    def test_trafico_anual_200(self):
        r = requests.get(f"{BASE_URL}/api/trafico/anual")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_trafico_mensual_200(self):
        r = requests.get(f"{BASE_URL}/api/trafico/mensual")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_trafico_mensual_filter(self):
        r = requests.get(f"{BASE_URL}/api/trafico/mensual?anio=2023")
        assert r.status_code == 200

    def test_heatmap_200(self):
        r = requests.get(f"{BASE_URL}/api/trafico/heatmap")
        assert r.status_code == 200

class TestAccidentes:
    def test_por_dia_200(self):
        r = requests.get(f"{BASE_URL}/api/accidentes/por_dia")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_iluminacion_200(self):
        r = requests.get(f"{BASE_URL}/api/accidentes/iluminacion")
        assert r.status_code == 200

    def test_riesgo_estados_200(self):
        r = requests.get(f"{BASE_URL}/api/accidentes/riesgo_estados")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

class TestModelo:
    def test_modelo_datos_200(self):
        r = requests.get(f"{BASE_URL}/api/modelo/datos")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_predecir_200(self):
        payload = {
            "anio": 2023, "mes": 6, "autos": 5000.0,
            "camiones_2_ejes": 200.0, "camiones_5_ejes": 50.0,
            "camiones_6_ejes": 30.0, "total": 5500.0
        }
        r = requests.post(f"{BASE_URL}/api/modelo/predecir", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert "alerta" in data
        assert data["alerta"] in ["ALTA", "MEDIA", "BAJA"]
        assert "probabilidades" in data

    def test_predecir_invalid_body(self):
        r = requests.post(f"{BASE_URL}/api/modelo/predecir", json={})
        assert r.status_code == 422

class TestAlertas:
    def test_alertas_200(self):
        r = requests.get(f"{BASE_URL}/api/alertas")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_alertas_filter_alta(self):
        r = requests.get(f"{BASE_URL}/api/alertas?nivel=ALTA")
        assert r.status_code == 200
        data = r.json()
        for item in data:
            assert item["alerta"] == "ALTA"
