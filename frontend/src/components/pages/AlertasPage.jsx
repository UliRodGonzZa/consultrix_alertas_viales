// Pages — AlertasPage
import React, { useEffect, useState } from 'react';
import Spinner from '../atoms/Spinner';
import AlertBadge from '../atoms/AlertBadge';
import Modal from '../organisms/Modal';
import { fetchAlertas } from '../../api/client';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ALERT_COLORS = { ALTA: '#C0392B', MEDIA: '#E67E22', BAJA: '#2980B9' };
const ALERT_BG    = { ALTA: '#FEF2F2', MEDIA: '#FFF7ED', BAJA: '#EFF6FF' };
const ALERT_ICONS = { ALTA: WarningIcon, MEDIA: NotificationsActiveIcon, BAJA: CheckCircleIcon };

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlertas().then(setAlertas).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const counts = alertas.reduce((acc, a) => { acc[a.alerta] = (acc[a.alerta]||0)+1; return acc; }, {});
  const filtered = alertas.filter(a =>
    (filter === 'ALL' || a.alerta === filter) &&
    (search === '' || a.tramo.toLowerCase().includes(search.toLowerCase()))
  );

  const chartData = alertas.slice(0, 12).map(a => ({ name: a.tramo.length > 20 ? a.tramo.substring(0,20)+'…' : a.tramo, score: a.score, alerta: a.alerta }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 520 }}>
        {['ALTA','MEDIA','BAJA'].map(n => {
          const Icon = ALERT_ICONS[n];
          return (
            <div key={n} style={{ background: ALERT_BG[n], borderRadius: 10, padding: '14px 18px', border: `1px solid ${ALERT_COLORS[n]}30`, cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => setFilter(filter === n ? 'ALL' : n)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon style={{ fontSize: 18, color: ALERT_COLORS[n] }} />
                <AlertBadge nivel={n} />
              </div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 26, color: ALERT_COLORS[n] }}>{counts[n] || 0}</div>
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, color: '#6B7280' }}>tramos</div>
            </div>
          );
        })}
      </div>

      {/* Score chart */}
      <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#111827' }}>
          Score de criticidad — Top 12 tramos
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 140 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" domain={[0,130]} tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#6B7280' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', fill: '#374151' }} width={140} />
            <Tooltip formatter={v => [`${v}`, 'Score']} contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="score" radius={[0,4,4,0]}>
              {chartData.map((e, i) => <Cell key={i} fill={ALERT_COLORS[e.alerta]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {/* Table toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <FilterListIcon style={{ fontSize: 18, color: '#6B7280' }} />
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, color: '#111827' }}>Tabla de alertas por tramo</span>
          </div>
          <input
            data-testid="search-tramo"
            placeholder="Buscar tramo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: '1.5px solid #E5E7EB',
              fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#111827',
              outline: 'none', minWidth: 180,
            }}
            onFocus={e => { e.target.style.borderColor = '#6B21A8'; }}
            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
          />
          {['ALL','ALTA','MEDIA','BAJA'].map(n => (
            <button
              key={n}
              data-testid={`filter-${n.toLowerCase()}`}
              onClick={() => setFilter(n)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: filter === n ? '#6B21A8' : '#E5E7EB',
                background: filter === n ? '#F3E8FF' : '#fff',
                color: filter === n ? '#6B21A8' : '#4B5563',
                fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >{n === 'ALL' ? 'Todos' : n}</button>
          ))}
        </div>

        {/* Table content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['#','Tramo','Nivel','Total (M veh.)','Media mensual','Score'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === '#' ? 'center' : 'left', color: '#6B7280', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={i}
                  data-testid={`alerta-row-${i}`}
                  style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', transition: 'background 0.1s' }}
                  onClick={() => setSelected(a)}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#9CA3AF', fontWeight: 700 }}>{i+1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: '#111827' }}>{a.tramo}</td>
                  <td style={{ padding: '10px 14px' }}><AlertBadge nivel={a.alerta} /></td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{a.total_millones?.toFixed(2)}M</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{a.media_mensual?.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, maxWidth: 80, height: 8, background: '#F3F4F6', borderRadius: 4 }}>
                        <div style={{ width: `${Math.min(a.score / 120 * 100, 100)}%`, height: '100%', borderRadius: 4, background: ALERT_COLORS[a.alerta] }} />
                      </div>
                      <span style={{ fontWeight: 700, color: ALERT_COLORS[a.alerta] }}>{a.score?.toFixed(0)}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>
                  <InfoIcon style={{ fontSize: 28, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                  No se encontraron tramos con esos criterios
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.tramo}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <AlertBadge nivel={selected.alerta} size="lg" />
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 14, color: '#4B5563', display: 'flex', alignItems: 'center' }}>
                Score de criticidad: <strong style={{ marginLeft: 6, color: ALERT_COLORS[selected.alerta] }}>{selected.score?.toFixed(1)}</strong>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total de vehículos', value: `${selected.total_millones?.toFixed(2)}M` },
                { label: 'Media mensual', value: selected.media_mensual?.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#111827' }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: ALERT_BG[selected.alerta], borderRadius: 8, padding: '14px 16px', border: `1px solid ${ALERT_COLORS[selected.alerta]}30` }}>
              <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                {selected.alerta === 'ALTA' && 'Este tramo requiere atención inmediata. Se recomienda reforzar patrullaje y señalización.'}
                {selected.alerta === 'MEDIA' && 'Tramo bajo monitoreo. Considerar acciones preventivas durante periodos de alto tráfico.'}
                {selected.alerta === 'BAJA' && 'Tramo con flujo vehicular dentro de parámetros normales. Monitoreo de rutina recomendado.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
