// Pages — ModeloPage
import React, { useEffect, useState } from 'react';
import Spinner from '../atoms/Spinner';
import ChartCard from '../molecules/ChartCard';
import Modal from '../organisms/Modal';
import AlertBadge from '../atoms/AlertBadge';
import Button from '../atoms/Button';
import FormField, { Input, Select } from '../molecules/FormField';
import { fetchModeloDatos, predecirAlerta } from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ALERT_COLORS = { ALTA: '#C0392B', MEDIA: '#E67E22', BAJA: '#2980B9' };

function ConfusionMatrix({ data }) {
  if (!data) return null;
  const { labels, matrix } = data;
  const max = Math.max(...matrix.flat());

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ marginBottom: 8, fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', color: '#6B7280' }}>
        Filas = Valor real · Columnas = Predicción
      </div>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px 14px', color: '#9CA3AF', fontSize: 12 }}>Real \ Pred.</th>
            {labels.map(l => <th key={l} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
              <AlertBadge nivel={l} /></th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, ri) => (
            <tr key={ri}>
              <td style={{ padding: '8px 14px', fontWeight: 700 }}><AlertBadge nivel={labels[ri]} /></td>
              {row.map((val, ci) => {
                const pct = max > 0 ? val / max : 0;
                const isCorrect = ri === ci;
                return (
                  <td key={ci} style={{ padding: '8px 16px', textAlign: 'center' }}>
                    <div style={{
                      background: isCorrect ? `rgba(107,33,168,${0.1 + pct*0.7})` : `rgba(192,57,43,${pct*0.4})`,
                      color: pct > 0.6 && isCorrect ? '#fff' : '#111827',
                      padding: '10px 16px', borderRadius: 8, fontWeight: 700, fontSize: 16,
                      minWidth: 50, border: isCorrect ? '2px solid #6B21A8' : '2px solid transparent',
                    }}>{val}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClassificationReport({ report }) {
  if (!report) return null;
  const keys = Object.keys(report).filter(k => !k.includes('avg') && !k.includes('accuracy'));
  const avgKeys = Object.keys(report).filter(k => k.includes('avg'));

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {['Clase','Precisión','Recall','F1-Score','Soporte'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Clase' ? 'left' : 'center', color: '#6B7280', fontWeight: 700, borderBottom: '2px solid #E5E7EB', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((k, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
              <td style={{ padding: '9px 14px' }}><AlertBadge nivel={k} /></td>
              <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600 }}>{(report[k].precision*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center' }}>{(report[k].recall*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center' }}>{(report[k]['f1-score']*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center', color: '#6B7280' }}>{report[k].support}</td>
            </tr>
          ))}
          {avgKeys.map((k, i) => (
            <tr key={`avg-${i}`} style={{ background: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
              <td style={{ padding: '9px 14px', fontWeight: 700, color: '#374151', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</td>
              <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600 }}>{(report[k].precision*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center' }}>{(report[k].recall*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center' }}>{(report[k]['f1-score']*100).toFixed(1)}%</td>
              <td style={{ padding: '9px 14px', textAlign: 'center', color: '#6B7280' }}>{report[k].support}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ModeloPage() {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ anio: 2025, mes: 1, autos: 150000, camiones_2_ejes: 15000, camiones_5_ejes: 20000, camiones_6_ejes: 8000, total: 250000 });
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState(null);

  useEffect(() => {
    fetchModeloDatos().then(setMlData).finally(() => setLoading(false));
  }, []);

  const handlePredict = async () => {
    setPredLoading(true); setPrediction(null); setPredError(null);
    try {
      const res = await predecirAlerta(form);
      setPrediction(res);
    } catch (e) {
      setPredError('Error al predecir. Verifica que el backend esté activo.');
    } finally {
      setPredLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!mlData) return <div style={{ padding: 24, fontFamily: 'IBM Plex Sans, sans-serif', color: '#6B7280' }}>No se pudieron cargar los datos del modelo.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Accuracy banner */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: '#F3E8FF', borderRadius: 10, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #DDD6FE' }}>
          <PsychologyIcon style={{ fontSize: 32, color: '#6B21A8' }} />
          <div>
            <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Modelo</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#6B21A8' }}>Árbol de Decisión</div>
          </div>
        </div>
        <div style={{ background: '#ECFDF5', borderRadius: 10, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #BBF7D0' }}>
          <CheckCircleIcon style={{ fontSize: 32, color: '#059669' }} />
          <div>
            <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Precisión (Accuracy)</div>
            <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 22, color: '#059669' }}>{mlData.accuracy}%</div>
          </div>
        </div>
        <div style={{ background: '#FFF7ED', borderRadius: 10, padding: '16px 24px', border: '1px solid #FED7AA' }}>
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#E67E22', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Umbrales de alerta</div>
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#374151' }}>
            <span style={{ fontWeight: 700, color: '#C0392B' }}>ALTA</span> &ge; {mlData.thresholds?.p75?.toLocaleString()} veh.<br/>
            <span style={{ fontWeight: 700, color: '#E67E22' }}>MEDIA</span> &ge; {mlData.thresholds?.p50?.toLocaleString()} veh.<br/>
            <span style={{ fontWeight: 700, color: '#2980B9' }}>BAJA</span> &lt; {mlData.thresholds?.p50?.toLocaleString()} veh.
          </div>
        </div>
      </div>

      {/* Feature importances */}
      <ChartCard testId="chart-feat-imp" title="Importancia de variables" subtitle="Contribución de cada feature al modelo" onExpand={() => setModal('feat')}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={mlData.feature_importances} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 110 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" unit="%" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#374151' }} width={110} />
            <Tooltip formatter={v => [`${v}%`, 'Importancia']} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="importance" radius={[0,4,4,0]}>
              {mlData.feature_importances?.map((e, i) => <Cell key={i} fill={i === 0 ? '#6B21A8' : i === 1 ? '#9333EA' : '#C084FC'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Confusion matrix */}
      <ChartCard testId="chart-confusion" title="Matriz de confusión" subtitle="Predicciones del modelo vs. valores reales en el conjunto de prueba" onExpand={() => setModal('cm')} minH={180}>
        <ConfusionMatrix data={mlData.confusion_matrix} />
      </ChartCard>

      {/* Classification report */}
      <ChartCard testId="chart-report" title="Reporte de clasificación" subtitle="Precisión, recall y F1 por clase" minH={160}>
        <ClassificationReport report={mlData.classification_report} />
      </ChartCard>

      {/* Prediction form */}
      <div data-testid="prediction-form" style={{ background: '#fff', borderRadius: 10, padding: '24px', border: '1px solid #E5E7EB' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4 }}>
          Prediccion de nivel de alerta
        </div>
        <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
          Ingresa los valores de trafico de un tramo para predecir su nivel de alerta
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
          <FormField label="Año" testId="field-anio">
            <Select testId="input-anio" value={form.anio} onChange={e => setForm(f => ({...f, anio: +e.target.value}))} options={[2023,2024,2025].map(a => ({value:a,label:String(a)}))} />
          </FormField>
          <FormField label="Mes (1-12)" testId="field-mes">
            <Input testId="input-mes" type="number" value={form.mes} min={1} max={12} onChange={e => setForm(f => ({...f, mes: +e.target.value}))} />
          </FormField>
          <FormField label="Autos" testId="field-autos">
            <Input testId="input-autos" value={form.autos} min={0} onChange={e => setForm(f => ({...f, autos: +e.target.value}))} />
          </FormField>
          <FormField label="Camiones 2 ejes" testId="field-cam2">
            <Input testId="input-camiones2" value={form.camiones_2_ejes} min={0} onChange={e => setForm(f => ({...f, camiones_2_ejes: +e.target.value}))} />
          </FormField>
          <FormField label="Camiones 5 ejes" testId="field-cam5">
            <Input testId="input-camiones5" value={form.camiones_5_ejes} min={0} onChange={e => setForm(f => ({...f, camiones_5_ejes: +e.target.value}))} />
          </FormField>
          <FormField label="Camiones 6 ejes" testId="field-cam6">
            <Input testId="input-camiones6" value={form.camiones_6_ejes} min={0} onChange={e => setForm(f => ({...f, camiones_6_ejes: +e.target.value}))} />
          </FormField>
          <FormField label="Total vehículos" testId="field-total">
            <Input testId="input-total" value={form.total} min={0} onChange={e => setForm(f => ({...f, total: +e.target.value}))} />
          </FormField>
        </div>
        <Button testId="btn-predecir" onClick={handlePredict} disabled={predLoading}>
          {predLoading ? 'Calculando...' : 'Predecir nivel de alerta'}
        </Button>
        {predError && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, color: '#C0392B', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }}>{predError}</div>}
        {prediction && (
          <div data-testid="prediction-result" style={{ marginTop: 16, padding: '16px 20px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Nivel predicho</div>
              <AlertBadge nivel={prediction.alerta} size="lg" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Probabilidades</div>
              {Object.entries(prediction.probabilidades).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <AlertBadge nivel={k} />
                  <div style={{ flex: 1, height: 8, background: '#E5E7EB', borderRadius: 4 }}>
                    <div style={{ width: `${v}%`, height: '100%', borderRadius: 4, background: ALERT_COLORS[k], transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, fontWeight: 700, width: 42, textAlign: 'right' }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={modal === 'feat'} onClose={() => setModal(null)} title="Importancia de variables — Vista ampliada" wide>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mlData.feature_importances} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" unit="%" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis type="category" dataKey="feature" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} width={120} />
            <Tooltip formatter={v => [`${v}%`]} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
            <Bar dataKey="importance" radius={[0,4,4,0]}>
              {mlData.feature_importances?.map((e, i) => <Cell key={i} fill={i === 0 ? '#6B21A8' : '#9333EA'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Modal>
      <Modal open={modal === 'cm'} onClose={() => setModal(null)} title="Matriz de confusión — Vista ampliada" wide>
        <ConfusionMatrix data={mlData.confusion_matrix} />
        <div style={{ marginTop: 16, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#6B7280' }}>
          La diagonal principal representa predicciones correctas. Fuera de la diagonal son errores de clasificación.
        </div>
      </Modal>
    </div>
  );
}
