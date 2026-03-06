import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, spacing } from '@/design-tokens';
import { clinicalLayers, clinicalVertebrae } from '@/content-tokens';

export function ClinicalSpine({ mounted }: { mounted: boolean }) {
  const [activeVertebra, setActiveVertebra] = useState(0);
  const vertebra = clinicalVertebrae[activeVertebra];
  const layers = clinicalLayers.filter(l => vertebra.layerIds.includes(l.id));

  return (
    <section style={{ backgroundColor: surfaces.solid.base, padding: '80px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Vertebrae selector */}
        <div className="flex justify-center gap-4 mb-16">
          {clinicalVertebrae.map((v, i) => (
            <button key={v.id} onClick={() => setActiveVertebra(i)} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: activeVertebra === i ? `${v.color}20` : 'rgba(0,0,0,0)', border: `1px solid ${activeVertebra === i ? v.color : colors.neutral.gray[800]}`, cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.15em', color: activeVertebra === i ? v.color : colors.neutral.gray[600], fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginTop: '4px' }}>{v.description}</div>
            </button>
          ))}
        </div>

        {/* Layers */}
        <AnimatePresence mode="wait">
          <motion.div key={activeVertebra} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ display: 'grid', gap: '12px' }}>
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.id} style={{ padding: '20px 24px', backgroundColor: surfaces.glass.subtle, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${layer.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Icon size={18} style={{ color: layer.color }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: colors.neutral.white }}>Layer {layer.id}: {layer.name}</div>
                    <div style={{ fontSize: '11px', color: colors.neutral.gray[500], marginLeft: 'auto' }}>{layer.tag}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: colors.neutral.gray[400], marginBottom: '8px', fontStyle: 'italic' }}>{layer.tagline}</div>
                  <div style={{ fontSize: '12px', color: colors.neutral.gray[500] }}>{layer.question}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {layer.contents.map((c, i) => (
                      <span key={i} style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: `${layer.color}10`, borderRadius: '4px', color: colors.neutral.gray[300] }}>{c}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}