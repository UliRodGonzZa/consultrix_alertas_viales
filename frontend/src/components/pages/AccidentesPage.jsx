// Pages — AccidentesPage
import React, { useEffect, useState } from 'react';
import Spinner from '../atoms/Spinner';
import ChartCard from '../molecules/ChartCard';
import Modal from '../organisms/Modal';
import AlertBadge from '../atoms/AlertBadge';
import MexicoMapChart from '../organisms/MexicoMapChart';
import { fetchAccidentesDia, fetchIluminacion, fetchRiesgoEstados } from '../../api/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, Legend,
} from 'recharts';

const ALERT_COLORS = { ALTA: '#C0392B', MEDIA: '#E67E22', BAJA: '#2980B9' };

export default function AccidentesPage() {
  const [dias, setDias] = useState([]);
  const [ilum, setIlum] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    Promise.all([fetchAccidentesDia(), fetchIluminacion(), fetchRiesgoEstados()])
      .then(([d, i, e]) => { setDias(d); setIlum(i); setEstados(e); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Geographic Map */}
      <ChartCard
        testId="chart-mapa-riesgo"
        title="Mapa de riesgo por estado"
        subtitle="Nivel de alerta basado en tasa de mortalidad y accidentes nocturnos — haz clic en un estado para ver detalles"
        onExpand={() => setModal('mapa')}
        minH={420}
      >
        <MexicoMapChart estados={estados} />
      </ChartCard>

      {/* Accidentes por día */}
      <ChartCard
        testId="chart-accidentes-dia"
        title="Accidentes por día de la semana"
        subtitle="Total de accidentes y tasa de mortalidad (%) — nivel nacional"
        onExpand={() => setModal('dias')}
      >
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dias} margin={{ top: 4, right: 32, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#C0392B' }} />
            <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, borderRadius: 8 }} />
            <Legend formatter={v => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>{v}</span>} />
            <Bar yAxisId="left" dataKey="total" name="Total accidentes" radius={[4,4,0,0]}>
              {dias.map((e, i) => <Cell key={i} fill={['sabado','domingo'].includes(e.dia?.toLowerCase()) ? '#E67E22' : '#9333EA'} />)}
            </Bar>
            <Bar yAxisId="left" dataKey="mortales" name="Mortales" fill="#C0392B" radius={[4,4,0,0]} opacity={0.85} />
            <Line yAxisId="right" type="monotone" dataKey="tasa_mortalidad" name="Tasa mortalidad %" stroke="#C0392B" strokeWidth={2.5} dot={{ r: 5, fill: '#C0392B' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Condiciones de iluminación */}
      <ChartCard
        testId="chart-iluminacion"
        title="Accidentes por condición de iluminación"
        subtitle="Total vs. mortales — impacto de la visibilidad"
        onExpand={() => setModal('ilum')}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ilum} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis type="category" dataKey="condicion" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#374151' }} width={80} />
            <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, borderRadius: 8 }} />
            <Legend formatter={v => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="total" name="Total accidentes" fill="#6B21A8" radius={[0,4,4,0]} />
            <Bar dataKey="mortales" name="Accidentes mortales" fill="#C0392B" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Risk index by state */}
      <ChartCard
        testId="chart-riesgo-estados"
        title="Índice de riesgo por estado"
        subtitle="Compuesto: 60% tasa de mortalidad + 40% riesgo nocturno — escala 0-100"
        onExpand={() => setModal('estados')}
        minH={380}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={estados.slice(0,16)}
            layout="vertical"
            margin={{ top: 4, right: 50, bottom: 4, left: 110 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" domain={[0,100]} tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis type="category" dataKey="estado" tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#374151' }} width={110} />
            <Tooltip
              contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, borderRadius: 8 }}
              formatter={(v, n, props) => [`${v} / 100`, 'Índice de riesgo']}
            />
            <Bar dataKey="indice_riesgo" name="Índice de riesgo" radius={[0,4,4,0]}>
              {estados.slice(0,16).map((e,i) => <Cell key={i} fill={ALERT_COLORS[e.nivel]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Modals */}
      <Modal open={modal === 'dias'} onClose={() => setModal(null)} title="Accidentes por día — Vista ampliada" wide>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={dias} margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="dia" tick={{ fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#C0392B' }} />
            <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
            <Legend formatter={v => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }}>{v}</span>} />
            <Bar yAxisId="left" dataKey="total" name="Total accidentes" fill="#9333EA" radius={[4,4,0,0]} />
            <Bar yAxisId="left" dataKey="mortales" name="Mortales" fill="#C0392B" radius={[4,4,0,0]} />
            <Line yAxisId="right" dataKey="tasa_mortalidad" name="Tasa mort. %" stroke="#C0392B" strokeWidth={2.5} dot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Modal>

      <Modal open={modal === 'ilum'} onClose={() => setModal(null)} title="Accidentes por iluminación — Vista ampliada" wide>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={ilum} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <YAxis type="category" dataKey="condicion" tick={{ fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif' }} width={100} />
            <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
            <Legend formatter={v => <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }}>{v}</span>} />
            <Bar dataKey="total" name="Total" fill="#6B21A8" radius={[0,4,4,0]} />
            <Bar dataKey="mortales" name="Mortales" fill="#C0392B" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Modal>

      <Modal open={modal === 'estados'} onClose={() => setModal(null)} title="Índice de riesgo — Todos los estados" wide>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
          {estados.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', borderBottom: '1px solid #F3F4F6' }}>
              <span style={{ width: 24, textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#9CA3AF', fontFamily: 'IBM Plex Sans, sans-serif' }}>{i+1}</span>
              <span style={{ width: 160, fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif', color: '#111827', fontWeight: 500 }}>{e.estado}</span>
              <AlertBadge nivel={e.nivel} />
              <div style={{ flex: 1, height: 10, background: '#F3F4F6', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${e.indice_riesgo}%`, height: '100%', borderRadius: 5, background: ALERT_COLORS[e.nivel] }} />
              </div>
              <span style={{ width: 38, textAlign: 'right', fontSize: 13, fontWeight: 700, fontFamily: 'IBM Plex Sans, sans-serif' }}>{e.indice_riesgo}</span>
              <span style={{ width: 80, textAlign: 'right', fontSize: 12, color: '#6B7280', fontFamily: 'IBM Plex Sans, sans-serif' }}>Acc: {e.total_accidentes}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Map modal — full width */}
      <Modal open={modal === 'mapa'} onClose={() => setModal(null)} title="Mapa de riesgo por estado — Vista ampliada" wide>
        <MexicoMapChart estados={estados} />
        <div style={{ marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#4B5563' }}>
          <span>Total estados: <strong>{estados.length}</strong></span>
          <span>Alertas ALTA: <strong style={{ color: '#C0392B' }}>{estados.filter(e => e.nivel === 'ALTA').length}</strong></span>
          <span>Alertas MEDIA: <strong style={{ color: '#E67E22' }}>{estados.filter(e => e.nivel === 'MEDIA').length}</strong></span>
          <span>Alertas BAJA: <strong style={{ color: '#2980B9' }}>{estados.filter(e => e.nivel === 'BAJA').length}</strong></span>
        </div>
      </Modal>
    </div>
  );
}
