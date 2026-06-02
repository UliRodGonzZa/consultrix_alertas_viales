"""
generate_dashboard_data.py
Pipeline completo del notebook — regenera data/dashboard_data.json.
Se ejecuta al arrancar el backend via startup().
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.tree import DecisionTreeClassifier

ROOT    = Path(__file__).parent.parent
DATA    = ROOT / "data"
OUT     = DATA / "dashboard_data.json"

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def _normalizar(texto: str) -> str:
    tabla = str.maketrans("ÁÉÍÓÚÜÑ", "AEIOUUN")
    return texto.upper().translate(tabla)


def _build_riesgo_map(df_accid: pd.DataFrame):
    dias  = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]
    luces = ["luz_dia","luz_crepusculo","luz_noche","luz_alumbrado_publico"]

    df_tot  = df_accid[df_accid["accidentes"] == "accidentes"].copy()
    df_mort = df_accid[df_accid["accidentes"] == "accidentes mortales"].copy()
    df_tot  = df_tot.rename(columns={c: "tot_"  + c for c in dias + luces})
    df_mort = df_mort.rename(columns={c: "mort_" + c for c in dias + luces})

    dr = df_tot.merge(
        df_mort[["entidad_federativa"] + ["mort_" + c for c in dias + luces]],
        on="entidad_federativa", how="left"
    ).drop(columns=["accidentes"], errors="ignore")

    ta = dr[["tot_"  + d for d in dias]].sum(axis=1)
    tm = dr[["mort_" + d for d in dias]].sum(axis=1)
    dr["tasa_mortalidad"] = (tm / ta.replace(0, np.nan) * 100).fillna(0)
    dr["riesgo_nocturno"] = (dr["tot_luz_noche"] / ta.replace(0, np.nan) * 100).fillna(0)

    scaler = MinMaxScaler(feature_range=(0, 100))
    comp   = dr[["tasa_mortalidad", "riesgo_nocturno"]].fillna(0) * np.array([0.6, 0.4])
    dr["indice_riesgo"] = scaler.fit_transform(
        comp.sum(axis=1).values.reshape(-1, 1)
    ).round(1)

    return dict(zip(dr["entidad_federativa"], dr["indice_riesgo"])), float(dr["indice_riesgo"].median())


# ─────────────────────────────────────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────────────────────────────────────
def run():
    transito_path = DATA / "transito.csv"
    aforo_path    = DATA / "aforo.csv"
    accid_path    = DATA / "accidentes.csv"

    if not all(p.exists() for p in [transito_path, accid_path]):
        print("[generate] Missing CSV files — aborting", file=sys.stderr)
        return

    # ── 1. Load & clean transito ───────────────────────────────────────────
    df = pd.read_csv(transito_path, encoding="utf-8", on_bad_lines="skip")
    df["fecha"]  = pd.to_datetime(df["fecha"], errors="coerce")
    df["tramo"]  = df["tramo"].str.strip().str.upper()
    df["anio"]   = df["anio"].astype(int)

    cols_v = [c for c in df.columns
              if c not in ("anio","mes","fecha","tramo","total") and "unnamed" not in c.lower()]
    df[cols_v] = df[cols_v].fillna(0)
    df = df.dropna(subset=["total"])

    # ── 2. Feature engineering ─────────────────────────────────────────────
    df["mes"]        = df["fecha"].dt.month
    df["trimestre"]  = df["fecha"].dt.quarter
    cols_cam         = [c for c in df.columns if "camiones" in c]
    df["pct_camiones"] = (
        df[cols_cam].sum(axis=1) / df["total"].replace(0, np.nan) * 100
    ).fillna(0).round(2)

    # ── 3. Binary target per-tramo p75 ────────────────────────────────────
    p75_tramo = df.groupby("tramo")["total"].transform(lambda x: x.quantile(0.75))
    df["demanda_alta"] = (df["total"] >= p75_tramo).astype(int)

    # ── 4. Train model ─────────────────────────────────────────────────────
    features = ["anio", "mes", "trimestre", "autos", "pct_camiones"]
    X = df[features].fillna(0)
    y = df["demanda_alta"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    clf = DecisionTreeClassifier(max_depth=5, random_state=42, class_weight="balanced")
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    # ML metrics
    acc  = round(float((y_pred == y_test).mean()) * 100, 1)
    cm   = confusion_matrix(y_test, y_pred, labels=[0, 1])
    cr   = classification_report(
        y_test, y_pred,
        labels=[0, 1],
        target_names=["demanda_baja", "demanda_alta"],
        output_dict=True
    )

    feat_imp = [
        {"feature": f, "importance": round(float(i) * 100, 2)}
        for f, i in zip(features, clf.feature_importances_)
    ]
    feat_imp.sort(key=lambda x: x["importance"], reverse=True)

    ml_data = {
        "accuracy": acc,
        "feature_importances": feat_imp,
        "confusion_matrix": {
            "labels": ["demanda_baja", "demanda_alta"],
            "matrix": cm.tolist(),
        },
        "classification_report": {
            k: v for k, v in cr.items()
            if k != "accuracy" and isinstance(v, dict)
        },
        "thresholds": {
            "description": "Alerta compuesta = 0.5×prob_demanda×100 + 0.5×riesgo_estatal",
            "alta":  "score >= 66",
            "media": "score 33-65",
            "baja":  "score < 33",
        },
    }

    # ── 5. Riesgo estatal ──────────────────────────────────────────────────
    df_accid = pd.read_csv(accid_path, encoding="utf-8", on_bad_lines="skip")
    riesgo_map, riesgo_medio = _build_riesgo_map(df_accid)

    palabras_cl = {estado: _normalizar(estado)[:5] for estado in riesgo_map}

    def buscar_estado(tramo):
        t = _normalizar(tramo).replace(" ", "")
        for estado, clave in palabras_cl.items():
            if clave in t:
                return estado
        return None

    df["estado_match"]   = df["tramo"].apply(buscar_estado)
    df["riesgo_estatal"] = df["estado_match"].map(riesgo_map).fillna(riesgo_medio)

    # ── 6. Alerta compuesta ────────────────────────────────────────────────
    df["prob_demanda"]     = clf.predict_proba(df[features])[:, 1]
    df["alerta_compuesta"] = (
        0.5 * df["prob_demanda"] * 100 + 0.5 * df["riesgo_estatal"]
    ).round(1)
    df["nivel_alerta"] = pd.cut(
        df["alerta_compuesta"],
        bins=[0, 33, 66, 100],
        labels=["BAJA", "MEDIA", "ALTA"],
        include_lowest=True,
    )

    # ── 7. Reporte por tramo año 2024 ──────────────────────────────────────
    resultado = (
        df[df["anio"] == 2024]
        .groupby("tramo")
        .agg(
            vehiculos_promedio=("total", "mean"),
            alerta_score=("alerta_compuesta", "mean"),
            nivel=(
                "nivel_alerta",
                lambda x: x.dropna().mode().iloc[0] if not x.dropna().empty else "BAJA",
            ),
            total_sum=("total", "sum"),
            meses=("mes", "nunique"),
        )
        .round(1)
        .sort_values("alerta_score", ascending=False)
        .reset_index()
    )

    alertas = []
    for _, r in resultado.head(20).iterrows():
        alertas.append({
            "tramo":          str(r["tramo"]),
            "total_millones": round(float(r["total_sum"]) / 1e6, 2),
            "media_mensual":  round(float(r["vehiculos_promedio"]), 0),
            "alerta":         str(r["nivel"]),
            "score":          round(float(r["alerta_score"]), 1),
        })

    # ── 8. Keep existing static sections ──────────────────────────────────
    existing = {}
    if OUT.exists():
        with open(OUT, "r", encoding="utf-8") as f:
            existing = json.load(f)

    # Build riesgo_estados from df_accid (same as before)
    dias_list  = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"]
    luces_list = ["luz_dia","luz_crepusculo","luz_noche","luz_alumbrado_publico"]

    df_tot_s  = df_accid[df_accid["accidentes"] == "accidentes"].copy()
    df_mort_s = df_accid[df_accid["accidentes"] == "accidentes mortales"].copy()
    df_tot_s  = df_tot_s.rename(columns={c: "tot_"  + c for c in dias_list + luces_list})
    df_mort_s = df_mort_s.rename(columns={c: "mort_" + c for c in dias_list + luces_list})

    dr = df_tot_s.merge(
        df_mort_s[["entidad_federativa"] + ["mort_" + c for c in dias_list + luces_list]],
        on="entidad_federativa", how="left"
    ).drop(columns=["accidentes"], errors="ignore")

    ta = dr[["tot_"  + d for d in dias_list]].sum(axis=1)
    tm = dr[["mort_" + d for d in dias_list]].sum(axis=1)
    dr["total_accidentes"] = ta
    dr["total_mortales"]   = tm
    dr["tasa_mortalidad"]  = (tm / ta.replace(0, np.nan) * 100).round(2).fillna(0)
    dr["riesgo_nocturno"]  = (dr["tot_luz_noche"] / ta.replace(0, np.nan) * 100).round(2).fillna(0)

    scaler2 = MinMaxScaler(feature_range=(0, 100))
    comp2   = dr[["tasa_mortalidad", "riesgo_nocturno"]].fillna(0) * np.array([0.6, 0.4])
    dr["indice_riesgo"] = scaler2.fit_transform(
        comp2.sum(axis=1).values.reshape(-1, 1)
    ).round(1)

    dr = dr.sort_values("indice_riesgo", ascending=False)
    riesgo_estados = []
    for _, r in dr.iterrows():
        nivel = "ALTA" if r["indice_riesgo"] >= 70 else ("MEDIA" if r["indice_riesgo"] >= 35 else "BAJA")
        riesgo_estados.append({
            "estado": r["entidad_federativa"],
            "total_accidentes": int(r["total_accidentes"]),
            "total_mortales":   int(r["total_mortales"]),
            "tasa_mortalidad":  float(r["tasa_mortalidad"]),
            "riesgo_nocturno":  float(r["riesgo_nocturno"]),
            "indice_riesgo":    float(r["indice_riesgo"]),
            "nivel":            nivel,
        })

    # ── 9. KPIs ───────────────────────────────────────────────────────────
    top_tramo   = alertas[0] if alertas else {}
    top_estado  = riesgo_estados[0] if riesgo_estados else {}

    dias_obj    = existing.get("accidentes_por_dia", [])
    dia_top     = max(dias_obj, key=lambda x: x.get("tasa_mortalidad", 0)) if dias_obj else {}
    total_acc_n = sum(r["total_accidentes"] for r in riesgo_estados)
    total_m_n   = sum(r["total_mortales"]   for r in riesgo_estados)
    pct_noche   = round(
        sum(
            df_tot_s["tot_luz_noche"].sum()
            for _ in [1]   # single iteration trick for inline computation
        ) / max(ta.sum(), 1) * 100, 1
    )
    # simple recalc
    pct_noche = round(float(df_tot_s["tot_luz_noche"].sum()) / max(float(ta.sum()), 1) * 100, 1)

    kpis = {
        "tramo_critico":   top_tramo.get("tramo", "N/A"),
        "tramo_score":     top_tramo.get("score", 0.0),
        "estado_peligroso": top_estado.get("estado", "N/A"),
        "estado_indice":   top_estado.get("indice_riesgo", 0.0),
        "dia_peligroso":   dia_top.get("dia", "N/A"),
        "dia_tasa":        dia_top.get("tasa_mortalidad", 0.0),
        "pct_nocturnos":   pct_noche,
        "total_accidentes": total_acc_n,
        "total_mortales":   total_m_n,
        "anio_datos":       2024,
    }

    # ── 10. Static sections (keep existing or recompute) ──────────────────
    trafico_anual  = existing.get("trafico_anual",  [])
    flujo_mensual  = existing.get("flujo_mensual",  [])
    heatmap        = existing.get("heatmap",        [])
    accidentes_dia = existing.get("accidentes_por_dia", [])
    iluminacion    = existing.get("iluminacion",    [])

    # ── 11. Save ───────────────────────────────────────────────────────────
    out = {
        "kpis":               kpis,
        "trafico_anual":      trafico_anual,
        "flujo_mensual":      flujo_mensual,
        "heatmap":            heatmap,
        "accidentes_por_dia": accidentes_dia,
        "iluminacion":        iluminacion,
        "riesgo_estados":     riesgo_estados,
        "ml_data":            ml_data,
        "alertas":            alertas,
    }

    DATA.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(
        f"[generate] Done — accuracy={acc}% | tramos={len(alertas)} | "
        f"top={top_tramo.get('tramo')} score={top_tramo.get('score')}"
    )


if __name__ == "__main__":
    run()
