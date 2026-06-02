# PRD — Sistema de Alertas Viales (CAPUFE Dashboard)

**Proyecto**: Dashboard de análisis de datos viales  
**Equipo**: Equipo 2 — Consultrix  
**Fecha inicio**: 2026-05-31  
**Última actualización**: 2026-05-31

---

## Problema

Visualizar en frontend el análisis de datos de tráfico y accidentes en autopistas CAPUFE de México (2021–2025), incluyendo un modelo de Machine Learning (Decision Tree) para clasificar niveles de alerta.

---

## Arquitectura

```
Frontend (React 18, Atomic Design) 
  ← axios → 
Backend (FastAPI, puerto 8001) 
  ← pandas/scikit-learn → 
Data (CSV → dashboard_data.json + ML model en RAM) 
  + 
MongoDB (motor async, disponible para futuras funciones)
```

---

## Requerimientos principales

- React con estructura Atomic Design estricta
- Iconos Material-UI (sin emojis)
- Paleta: morado/violeta (#6B21A8) principal + naranja (#E67E22) secundario
- Pestañas separadas con modales al expandir gráficas
- Formulario interactivo para predicción ML
- Colores de alerta: ALTA=#C0392B, MEDIA=#E67E22, BAJA=#2980B9
- README completo con pasos para correr local

---

## Implementado (2026-05-31)

### Backend
- [x] `server.py` — FastAPI con 10 endpoints bajo `/api`
- [x] Carga de CSVs y pre-procesamiento al arrancar (`data/dashboard_data.json`)
- [x] Entrenamiento del DecisionTreeClassifier al arrancar
- [x] Endpoint POST `/api/modelo/predecir` — predicción en tiempo real
- [x] Filtros por nivel en `/api/alertas`

### Frontend
- [x] **Atoms**: AlertBadge, Typography (H1/H2/H3/Body/Label), Button, Spinner
- [x] **Molecules**: KpiCard (con hover animations), ChartCard (con expand button), FormField + Input + Select
- [x] **Organisms**: Header (morado), Sidebar (con nav activo), Modal (con backdrop blur)
- [x] **Templates**: DashboardLayout
- [x] **Pages**:
  - OverviewPage: 5 KPI cards, mini bar chart, mini pie chart, top 5 estados
  - TraficoPage: gráfica anual, flujo mensual (selector 2023/2024), heatmap
  - AccidentesPage: accidentes por día (composed chart), iluminación, índice riesgo por estado
  - ModeloPage: accuracy banner, importancia features, matriz confusión, reporte clasificación, formulario predictor
  - AlertasPage: cards ALTA/MEDIA/BAJA, score chart, tabla con filtros/búsqueda/modales
- [x] Todos los ChartCards con botón expand → modal ampliado
- [x] data-testid en todos los elementos interactivos
- [x] Google Fonts: Manrope + IBM Plex Sans

### Datos
- [x] 3 CSVs procesados: transito (2872 filas), aforo (1221 filas), accidentes (64 filas)
- [x] `data/dashboard_data.json` con: kpis, trafico_anual, flujo_mensual, heatmap, accidentes_por_dia, iluminacion, riesgo_estados, ml_data, alertas

---

## Tests

- Backend: 100% (14/14 endpoints)
- Frontend: 95% (todas las funcionalidades core)
- Issue menor: chart de iluminación en resumen (cosmético, no bloquea)

---

## Backlog P1

- [ ] Persistencia de predicciones en MongoDB (historial)
- [ ] Exportar tabla de alertas a CSV/PDF
- [ ] Filtro por periodo de tiempo en gráficas de tráfico
- [x] Mapa geográfico de estados con color por nivel de riesgo ✓ (2026-06-01)

## Backlog P2

- [ ] Autenticación (login/roles: admin, analista)
- [ ] Notificaciones por email cuando alerta cambia a ALTA
- [ ] Carga de nuevos CSVs desde la UI
- [ ] Comparativa entre años en misma gráfica

---

## Comandos para correr local

Ver `/app/README.md` para instrucciones completas.
