import React, { useState, useEffect } from 'react';
import type { NaviCueDefinition, AestheticLayers } from '../../types/navicue-engine';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, radius } from '@/design-tokens';

interface NaviCueRendererProps {
  naviCue: NaviCueDefinition;
  aesthetic: AestheticLayers;
  onResponse: (response: { type: string; data: any }) => void;
}

/**
 * NAVICUE RENDERER
 * 
 * Apple-grade elegance:
 * - No borders, no backgrounds
 * - Full width/height usage
 * - Graceful CTAs
 * - Light/white text on dark navy
 * - Proper font sizes
 */

export function NaviCueRenderer({ naviCue, aesthetic, onResponse }: NaviCueRendererProps) {
  const [textValue, setTextValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [timerComplete, setTimerComplete] = useState(false);
  
  const handleSubmit = () => {
    if (naviCue.response.type === 'text') {
      onResponse({
        type: 'text',
        data: { textContent: textValue },
      });
    } else if (naviCue.response.type === 'select') {
      onResponse({
        type: 'select',
        data: { selectedOptions },
      });
    } else if (naviCue.response.type === 'multiselect') {
      onResponse({
        type: 'multiselect',
        data: { selectedOptions },
      });
    } else if (naviCue.response.type === 'timer') {
      onResponse({
        type: 'timer',
        data: { completed: timerComplete },
      });
    } else if (naviCue.response.type === 'sit_with_it') {
      // Auto-advance after brief display
      setTimeout(() => {
        onResponse({
          type: 'sit_with_it',
          data: {},
        });
      }, 4000);
    }
  };
  
  const handleContinueLater = () => {
    onResponse({
      type: 'continue_later',
      data: {},
    });
  };
  
  const toggleOption = (value: string) => {
    if (naviCue.response.type === 'select') {
      setSelectedOptions([value]);
      // Auto-submit for single select after brief delay
      setTimeout(() => {
        onResponse({
          type: 'select',
          data: { selectedOptions: [value] },
        });
      }, 600);
    } else if (naviCue.response.type === 'multiselect') {
      setSelectedOptions(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
  };
  
  // Render based on format + container
  const renderContent = () => {
    switch (`${naviCue.format}_${naviCue.container}`) {
      case 'MOMENT_CARD':
        return <MomentCardLayout naviCue={naviCue} aesthetic={aesthetic} />;
      case 'MICRO_TOAST':
        return <MicroToastLayout naviCue={naviCue} aesthetic={aesthetic} />;
      case 'MICRO_TIMER':
        return <MicroTimerLayout naviCue={naviCue} aesthetic={aesthetic} onComplete={() => setTimerComplete(true)} />;
      case 'MODAL_FULLSCREEN':
        return <ModalFullscreenLayout naviCue={naviCue} aesthetic={aesthetic} />;
      case 'MINI_CARD':
        return <MiniCardLayout naviCue={naviCue} aesthetic={aesthetic} />;
      default:
        return <MomentCardLayout naviCue={naviCue} aesthetic={aesthetic} />;
    }
  };
  
  // Render response mechanism
  const renderResponse = () => {
    switch (naviCue.response.type) {
      case 'text':
        return (
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={naviCue.response.placeholder}
              rows={4}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: radius.md,
                color: colors.neutral.white,
                fontFamily: fonts.primary,
                fontSize: '16px',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = aesthetic.color.primary + '40';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <GracefulButton
                onClick={handleSubmit}
                disabled={!textValue.trim()}
                primary
                color={aesthetic.color.primary}
              >
                Continue
              </GracefulButton>
              <GracefulButton
                onClick={handleContinueLater}
                secondary
              >
                I'll come back to this
              </GracefulButton>
            </div>
          </div>
        );
      
      case 'select':
      case 'multiselect':
        return (
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {naviCue.response.options?.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    textAlign: 'left',
                    borderRadius: radius.md,
                    backgroundColor: selectedOptions.includes(option.value)
                      ? aesthetic.color.primary + '15'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      selectedOptions.includes(option.value)
                        ? aesthetic.color.primary + '40'
                        : 'rgba(255, 255, 255, 0.08)'
                    }`,
                    color: colors.neutral.white,
                    fontFamily: fonts.primary,
                    fontSize: '16px',
                    fontWeight: '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {option.display}
                </motion.button>
              ))}
            </div>
            {naviCue.response.type === 'multiselect' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <GracefulButton
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0}
                  primary
                  color={aesthetic.color.primary}
                >
                  Continue
                </GracefulButton>
                <GracefulButton
                  onClick={handleContinueLater}
                  secondary
                >
                  I'll come back to this
                </GracefulButton>
              </div>
            )}
          </div>
        );
      
      case 'timer':
        return timerComplete ? (
          <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
            <GracefulButton
              onClick={handleSubmit}
              primary
              color={aesthetic.color.primary}
            >
              Continue
            </GracefulButton>
          </div>
        ) : null;
      
      case 'sit_with_it':
        return (
          <div style={{ 
            marginTop: '48px', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '120px',
          }}>
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${aesthetic.color.primary}`,
              }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '700px', width: '100%' }}>
        {renderContent()}
        {renderResponse()}
      </div>
    </motion.div>
  );
}

// ===== LAYOUT COMPONENTS =====

function MomentCardLayout({ naviCue, aesthetic }: { naviCue: NaviCueDefinition; aesthetic: AestheticLayers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: aesthetic.color.primary,
          fontFamily: fonts.primary,
        }}
      >
        {naviCue.kbe === 'K' ? 'Knowing' : naviCue.kbe === 'B' ? 'Believing' : 'Embodying'}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontFamily: fonts.secondary,
          fontSize: '36px',
          fontWeight: '400',
          lineHeight: '1.3',
          color: colors.neutral.white,
        }}
      >
        {naviCue.content.primary}
      </motion.h2>
      {naviCue.content.secondary && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontFamily: fonts.primary,
            fontSize: '18px',
            lineHeight: '1.6',
            color: colors.neutral.gray[400],
          }}
        >
          {naviCue.content.secondary}
        </motion.p>
      )}
    </div>
  );
}

function MicroToastLayout({ naviCue, aesthetic }: { naviCue: NaviCueDefinition; aesthetic: AestheticLayers }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '3px',
          height: '60px',
          borderRadius: '2px',
          backgroundColor: aesthetic.color.primary,
          flexShrink: 0,
        }}
      />
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontFamily: fonts.primary,
          fontSize: '20px',
          fontWeight: '500',
          lineHeight: '1.5',
          color: colors.neutral.white,
        }}
      >
        {naviCue.content.primary}
      </motion.p>
    </div>
  );
}

function MicroTimerLayout({ naviCue, aesthetic, onComplete }: { naviCue: NaviCueDefinition; aesthetic: AestheticLayers; onComplete: () => void }) {
  const [count, setCount] = useState(3);
  
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 20000); // 20 seconds per breath
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);
  
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: fonts.secondary,
          fontSize: '32px',
          fontWeight: '400',
          color: colors.neutral.white,
        }}
      >
        {naviCue.content.primary}
      </motion.h2>
      {naviCue.content.secondary && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: fonts.primary,
            fontSize: '18px',
            lineHeight: '1.6',
            color: colors.neutral.gray[400],
          }}
        >
          {naviCue.content.secondary}
        </motion.p>
      )}
      <div style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: aesthetic.color.primary + '10',
            border: `2px solid ${aesthetic.color.primary}30`,
          }}
        >
          <span 
            style={{ 
              fontSize: '72px', 
              fontWeight: '300', 
              color: aesthetic.color.primary,
              fontFamily: fonts.primary,
            }}
          >
            {count}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function ModalFullscreenLayout({ naviCue, aesthetic }: { naviCue: NaviCueDefinition; aesthetic: AestheticLayers }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px', paddingBottom: '40px' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      >
        <h2 
          style={{
            fontFamily: fonts.secondary,
            fontSize: '42px',
            fontWeight: '400',
            lineHeight: '1.3',
            color: colors.neutral.white,
          }}
        >
          {naviCue.content.primary}
        </h2>
        {naviCue.content.secondary && (
          <p 
            style={{
              fontFamily: fonts.primary,
              fontSize: '20px',
              lineHeight: '1.6',
              color: colors.neutral.gray[400],
            }}
          >
            {naviCue.content.secondary}
          </p>
        )}
      </motion.div>
    </div>
  );
}

function MiniCardLayout({ naviCue, aesthetic }: { naviCue: NaviCueDefinition; aesthetic: AestheticLayers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: fonts.primary,
          fontSize: '24px',
          fontWeight: '500',
          lineHeight: '1.4',
          color: colors.neutral.white,
        }}
      >
        {naviCue.content.primary}
      </motion.h3>
      {naviCue.content.secondary && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: fonts.primary,
            fontSize: '16px',
            lineHeight: '1.6',
            color: colors.neutral.gray[400],
          }}
        >
          {naviCue.content.secondary}
        </motion.p>
      )}
    </div>
  );
}

// Graceful Button Component
interface GracefulButtonProps {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  secondary?: boolean;
  color?: string;
  children: React.ReactNode;
}

function GracefulButton({ onClick, disabled, primary, secondary, color, children }: GracefulButtonProps) {
  const buttonColor = color || colors.accent.cyan.primary;
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      style={{
        padding: primary ? '14px 28px' : '14px 20px',
        borderRadius: '10px',
        backgroundColor: primary 
          ? buttonColor + '20'
          : 'rgba(255, 255, 255, 0.05)',
        border: primary
          ? `1px solid ${buttonColor}40`
          : '1px solid rgba(255, 255, 255, 0.1)',
        color: primary ? buttonColor : colors.neutral.gray[400],
        fontFamily: fonts.primary,
        fontSize: '15px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {children}
    </motion.button>
  );
}