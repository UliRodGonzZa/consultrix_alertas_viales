// Organisms — MexicoMapChart
// Geographic map of Mexico states colored by alert level
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import AlertBadge from '../atoms/AlertBadge';

const GEO_URL = '/mexico-states.geojson';

// Normalize GeoJSON state names → match our risk dataset names
const GEO_TO_RISK = {
  'Distrito Federal':               'Ciudad De Mexico',
  'Coahuila de Zaragoza':           'Coahuila',
  'México':                         'Estado Mexico',
  'Michoacán de Ocampo':            'Michoacan',
  'Nuevo León':                     'Nuevo Leon',
  'Querétaro':                      'Queretaro',
  'San Luis Potosí':                'San Luis Potosi',
  'Veracruz de Ignacio de la Llave':'Veracruz',
  'Yucatán':                        'Yucatan',
};

const ALERT_FILL   = { ALTA: '#C0392B', MEDIA: '#E67E22', BAJA: '#2980B9' };
const ALERT_HOVER  = { ALTA: '#922B21', MEDIA: '#BA6A1B', BAJA: '#1A5276' };
const LEGEND = [
  { nivel: 'ALTA',  label: 'Alto riesgo',    fill: '#C0392B' },
  { nivel: 'MEDIA', label: 'Riesgo medio',   fill: '#E67E22' },
  { nivel: 'BAJA',  label: 'Bajo riesgo',    fill: '#2980B9' },
  { nivel: null,    label: 'Sin datos',       fill: '#D1D5DB' },
];

export default function MexicoMapChart({ estados = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Build lookup: normalizedName → estado record
  const riskByName = {};
  estados.forEach(e => { riskByName[e.estado.toLowerCase()] = e; });

  const getEstado = (geoName) => {
    const mapped = GEO_TO_RISK[geoName] || geoName;
    return riskByName[mapped.toLowerCase()] || null;
  };

  const getFill = (geoName) => {
    const e = getEstado(geoName);
    return e ? ALERT_FILL[e.nivel] : '#D1D5DB';
  };

  const getHover = (geoName) => {
    const e = getEstado(geoName);
    return e ? ALERT_HOVER[e.nivel] : '#9CA3AF';
  };

  return (
    <div
      data-testid="mexico-map"
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: '+', action: () => setZoom(z => Math.min(z + 0.5, 6)) },
          { label: '−', action: () => setZoom(z => Math.max(z - 0.5, 1)) },
        ].map(({ label, action }) => (
          <button
            key={label}
            data-testid={`map-zoom-${label === '+' ? 'in' : 'out'}`}
            onClick={action}
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
              background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16,
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3E8FF'; e.currentTarget.style.color = '#6B21A8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#374151'; }}
          >{label}</button>
        ))}
        {zoom > 1 && (
          <button
            data-testid="map-zoom-reset"
            onClick={() => setZoom(1)}
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid #E5E7EB',
              background: '#fff', cursor: 'pointer', fontSize: 9, fontWeight: 700,
              color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >↺</button>
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 10,
        background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px',
        border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
          Nivel de riesgo
        </span>
        {LEGEND.map(({ nivel, label, fill }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: fill, flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, color: '#374151' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-102, 24], scale: 1200 }}
        style={{ width: '100%', height: 420 }}
      >
        <ZoomableGroup zoom={zoom} center={[-102, 24]}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.state_name;
                const estado = getEstado(geoName);
                const fill = getFill(geoName);
                const hover = getHover(geoName);

                return (
                  <Geography
                    data-testid={`map-state-${geoName}`}
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setTooltip({ geoName, estado })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill,
                        stroke: '#fff',
                        strokeWidth: 0.7,
                        outline: 'none',
                        transition: 'fill 0.15s ease',
                      },
                      hover: {
                        fill: hover,
                        stroke: '#fff',
                        strokeWidth: 1,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: hover,
                        stroke: '#fff',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          data-testid="map-tooltip"
          style={{
            position: 'absolute',
            left: Math.min(mousePos.x + 14, 500),
            top: mousePos.y - 10,
            background: '#1F2937',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            pointerEvents: 'none',
            zIndex: 20,
            minWidth: 180,
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            animation: 'fadeIn 0.1s ease',
          }}
        >
          <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 5 }}>
            {tooltip.geoName}
          </div>
          {tooltip.estado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12 }}>
              <AlertBadge nivel={tooltip.estado.nivel} size="sm" />
              <span style={{ color: '#D1D5DB', marginTop: 3 }}>Índice de riesgo: <strong style={{ color: '#fff' }}>{tooltip.estado.indice_riesgo}/100</strong></span>
              <span style={{ color: '#D1D5DB' }}>Accidentes: <strong style={{ color: '#fff' }}>{tooltip.estado.total_accidentes?.toLocaleString()}</strong></span>
              <span style={{ color: '#D1D5DB' }}>Mortales: <strong style={{ color: '#fff' }}>{tooltip.estado.total_mortales?.toLocaleString()}</strong></span>
              <span style={{ color: '#D1D5DB' }}>Tasa mort.: <strong style={{ color: '#fff' }}>{tooltip.estado.tasa_mortalidad}%</strong></span>
            </div>
          ) : (
            <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 12, color: '#9CA3AF' }}>Sin datos disponibles</div>
          )}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}
