/**
 * LINK SURFACE — The Infrastructure
 *
 * Your own source code.
 * Not "Settings". Not "Profile". Not a form.
 *
 * The control centre handles complex real-world logistics
 * (wearables, therapist portals, SOS safety nets) with
 * pristine, minimalist elegance.
 *
 * It feels like a secure, symbiotic bridge —
 * reading your own configuration file.
 *
 * Death of the Box: No cards. No bordered sections.
 * Each infrastructure node is a line of luminous text
 * emerging from the dark glass, with its connection
 * status shown through subtle color and glow.
 *
 * Architecture:
 *   BODY  — Wearable connections (Apple Watch, Oura, Whoop)
 *   MIND  — Therapist portal (invite, share, session sync)
 *   SAFE  — SOS safety net (emergency contacts, crisis routing)
 *   CODE  — Source config (account, data, export)
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { hapticSeal } from './haptics';
import { useResilience } from '../runtime/resilience-seam';
import { useLinkInfrastructure } from '../runtime/useLinkInfrastructure';
import { useSurfaceAtmosphereSeam } from '../runtime/surface-atmosphere-seam';
import {
  buildSurfaceAtmosphereDeckVariants,
  resolveSurfaceAtmosphereState,
  resolveSurfaceAtmosphereSurfaceKeyFromModeId,
} from '../runtime/surface-atmosphere';
import { ResilienceWhisper } from './ResilienceWhisper';

import { room, font, layout, tracking, typeSize, leading, weight, opacity, timing, glow, void_, layer, signal } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

// ─── Infrastructure Domains ───

interface InfraNode {
  id: string;
  domain: string;
  label: string;
  status: 'connected' | 'available' | 'inactive';
  detail: string;
  color: string;
  /** If true, this node has an interactive sub-flow */
  hasFlow?: boolean;
}

// ─── Domain metadata ───

const DOMAINS: Record<string, { whisper: string; color: string }> = {
  BODY: { whisper: 'The biometric bridge', color: signal.clarity },
  MIND: { whisper: 'The therapeutic connection', color: signal.mind },
  SAFE: { whisper: 'The safety architecture', color: signal.safe },
  CODE: { whisper: 'Your source configuration', color: room.fg },
};

interface LinkSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function LinkSurface({ mode, breath }: LinkSurfaceProps) {
  const resilience = useResilience();
  const { settings, updateSettings } = useSurfaceAtmosphereSeam();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [flowPhase, setFlowPhase] = useState<'idle' | 'therapist-invite' | 'emergency-edit' | 'invite-sent' | 'saving'>('idle');
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputRelationship, setInputRelationship] = useState('');
  const [
    { therapistConn, emergencyContact, wearableStatus, wearableSim },
    {
      exportConstellation,
      inviteTherapist,
      revokeTherapist,
      saveEmergencyContact,
      toggleWearableConnection,
    },
  ] = useLinkInfrastructure();

  const containerRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const { arrived, delay } = useSurfaceArrival(mode);

  const breathPhase = Math.sin(breath * Math.PI * 2);
  const linkAtmosphere = useMemo(() => {
    const surfaceKey = resolveSurfaceAtmosphereSurfaceKeyFromModeId(mode.id) ?? 'link';
    return resolveSurfaceAtmosphereState(surfaceKey, settings);
  }, [mode.id, settings]);
  const linkDeck = useMemo(
    () => buildSurfaceAtmosphereDeckVariants(linkAtmosphere, settings)[0] ?? null,
    [linkAtmosphere, settings],
  );

  // Build node list dynamically based on connection state
  const infraNodes: InfraNode[] = [
    // BODY
    { id: 'apple-watch', domain: 'BODY', label: 'Apple Watch', status: wearableStatus['apple-watch'] ? 'connected' : 'available', detail: 'Heart rate · HRV · Movement', color: signal.clarity },
    { id: 'oura', domain: 'BODY', label: 'Oura Ring', status: wearableStatus.oura ? 'connected' : 'available', detail: 'Sleep · Recovery · Readiness', color: signal.clarity },
    { id: 'whoop', domain: 'BODY', label: 'Whoop', status: wearableStatus.whoop ? 'connected' : 'inactive', detail: 'Strain · Recovery · Sleep', color: signal.clarity },
    // MIND
    {
      id: 'therapist',
      domain: 'MIND',
      label: 'Therapist Portal',
      status: therapistConn ? 'connected' : 'available',
      detail: therapistConn
        ? `${therapistConn.therapistEmail} · ${therapistConn.status}`
        : 'Invite your therapist to see your constellation',
      color: signal.mind,
      hasFlow: true,
    },
    { id: 'session-sync', domain: 'MIND', label: 'Session Sync', status: therapistConn?.status === 'accepted' ? 'connected' : 'inactive', detail: 'Share TALK entries with your therapist', color: signal.mind },
    // SAFE
    {
      id: 'emergency-contact',
      domain: 'SAFE',
      label: 'Emergency Contact',
      status: emergencyContact ? 'connected' : 'available',
      detail: emergencyContact
        ? `${emergencyContact.name}${emergencyContact.relationship ? ' · ' + emergencyContact.relationship : ''}`
        : 'Set your anchor person',
      color: signal.safe,
      hasFlow: true,
    },
    { id: 'crisis-line', domain: 'SAFE', label: 'Crisis Line', status: 'connected', detail: 'Always available · 988 Lifeline', color: signal.safe },
    // CODE
    {
      id: 'atmosphere',
      domain: 'CODE',
      label: 'Atmospheric Music',
      status: settings.enabled && settings.intensity !== 'off' ? 'connected' : 'available',
      detail: `${linkAtmosphere.label} · ${settings.enabled ? settings.intensity : 'off'} · ${settings.adaptToSurface ? 'adaptive' : 'fixed'}`,
      color: mode.color,
      hasFlow: true,
    },
    { id: 'export', domain: 'CODE', label: 'Export Data', status: 'available', detail: 'Download your constellation as JSON', color: room.fg },
    { id: 'account', domain: 'CODE', label: 'Account', status: 'connected', detail: 'Anonymous session · No account required', color: room.fg },
  ];

  // Group by domain
  const domainOrder = ['BODY', 'MIND', 'SAFE', 'CODE'];
  const groupedNodes = domainOrder.map(domain => ({
    domain,
    ...DOMAINS[domain],
    nodes: infraNodes.filter(n => n.domain === domain),
  }));

  // ── Handlers ──

  // ── Export handler — downloads full constellation as JSON ──
  const handleExport = useCallback(async () => {
    setFlowPhase('saving');
    setSelectedNode('export');

    try {
      const exported = await exportConstellation();
      if (!exported) {
        setFlowPhase('idle');
        return;
      }
      hapticSeal();
      setFlowPhase('idle');
      setTimeout(() => setSelectedNode(null), 1500);
    } catch (err) {
      console.error('[LINK export]', err);
      setFlowPhase('idle');
    }
  }, [exportConstellation]);

  const handleNodeTap = useCallback((node: InfraNode) => {
    if (node.id === 'therapist' && node.hasFlow) {
      if (therapistConn) {
        setSelectedNode(prev => prev === node.id ? null : node.id);
      } else {
        setFlowPhase('therapist-invite');
        setSelectedNode('therapist');
        setTimeout(() => emailRef.current?.focus(), 300);
      }
    } else if (node.id === 'emergency-contact' && node.hasFlow) {
      if (emergencyContact) {
        setSelectedNode(prev => prev === node.id ? null : node.id);
      } else {
        setFlowPhase('emergency-edit');
        setSelectedNode('emergency-contact');
      }
    } else if (node.id === 'export') {
      // Export flow — download full constellation as JSON
      handleExport();
    } else {
      setSelectedNode(prev => prev === node.id ? null : node.id);
    }
  }, [emergencyContact, handleExport, therapistConn]);

  const sendInvite = useCallback(async () => {
    if (!inputEmail.trim()) return;
    setFlowPhase('saving');

    try {
      const invited = await inviteTherapist(inputEmail.trim(), inputName.trim() || null);
      if (invited) {
        hapticSeal();
        setFlowPhase('invite-sent');
        setTimeout(() => setFlowPhase('idle'), 3000);
      } else {
        setFlowPhase('idle');
      }
    } catch (err) {
      console.error('[LINK invite]', err);
      setFlowPhase('idle');
    }
  }, [inputEmail, inputName, inviteTherapist]);

  const revokeInvite = useCallback(async () => {
    setFlowPhase('saving');
    try {
      const revoked = await revokeTherapist();
      if (revoked) {
        hapticSeal();
        setFlowPhase('idle');
        setSelectedNode(null);
      } else {
        setFlowPhase('idle');
      }
    } catch (err) {
      console.error('[LINK revoke]', err);
      setFlowPhase('idle');
    }
  }, [revokeTherapist]);

  const saveEmergency = useCallback(async () => {
    if (!inputName.trim() || !inputPhone.trim()) return;
    setFlowPhase('saving');

    try {
      const saved = await saveEmergencyContact(
        inputName.trim(),
        inputPhone.trim(),
        inputRelationship.trim() || null,
      );
      if (saved) {
        hapticSeal();
        setFlowPhase('idle');
        setSelectedNode(null);
      } else {
        setFlowPhase('idle');
      }
    } catch (err) {
      console.error('[LINK emergency]', err);
      setFlowPhase('idle');
    }
  }, [inputName, inputPhone, inputRelationship, saveEmergencyContact]);

  // ── Wearable connect/disconnect handler ──
  const toggleWearable = useCallback(async (deviceType: string, deviceName: string) => {
    try {
      const toggled = await toggleWearableConnection(deviceType, deviceName);
      if (toggled) {
        hapticSeal();
      }
    } catch (err) {
      console.error('[LINK wearable toggle]', err);
    }
  }, [toggleWearableConnection]);

  // ── Glass input style ──
  const glassInputStyle = (color: string): React.CSSProperties => ({
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${color}12`,
    outline: 'none',
    fontFamily: SANS,
    fontSize: typeSize.note,
    fontWeight: weight.regular,
    color: room.fg,
    opacity: opacity.spoken,
    width: '100%',
    padding: '6px 0',
    letterSpacing: tracking.body,
    caretColor: color,
  });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'pan-y', cursor: 'default' }}
    >
      {/* Dark glass */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* Subtle atmospheric gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 35% at 50% 30%, ${mode.color}02 0%, transparent 70%)`,
        }}
      />

      {/* Eyebrow */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ top: '6%', left: 0, right: 0, textAlign: 'center', zIndex: layer.raised }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('eyebrow'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.quiet,
            }}>
              LINK
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infrastructure list */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute overflow-y-auto"
            style={{
              top: '12%',
              left: 0,
              right: 0,
              bottom: ORB_CLEARANCE,
              zIndex: layer.content,
              paddingLeft: '8%',
              paddingRight: '8%',
              paddingBottom: 20,
              scrollbarWidth: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('content'), ease: SURFACE_EASE as any }}
          >
            {groupedNodes.map((group, gi) => (
              <div key={group.domain} style={{ marginBottom: gi < groupedNodes.length - 1 ? 28 : 0 }}>
                {/* Domain header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="rounded-full"
                    style={{
                      width: 3 + breathPhase * 0.3,
                      height: 3 + breathPhase * 0.3,
                      background: group.color,
                      opacity: opacity.ambient,
                      boxShadow: glow.dot(group.color, '10'),
                    }}
                  />
                  <span style={{
                    fontFamily: SANS,
                    fontSize: typeSize.whisper,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.wide,
                    color: group.color,
                    opacity: opacity.quiet,
                  }}>
                    {group.domain}
                  </span>
                  <span style={{
                    fontFamily: SERIF,
                    fontSize: typeSize.detail,
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: room.fg,
                    opacity: opacity.quiet,
                    marginLeft: 4,
                  }}>
                    {group.whisper}
                  </span>
                </div>

                {/* Nodes */}
                {group.nodes.map((node) => {
                  const isSelected = selectedNode === node.id;
                  const statusColor = node.status === 'connected' ? signal.anchor
                    : node.status === 'available' ? node.color
                    : room.fg;
                  const statusOpacity = node.status === 'connected' ? opacity.voice
                    : node.status === 'available' ? opacity.ambient
                    : opacity.ghost;

                  return (
                    <motion.div
                      key={node.id}
                      className="cursor-pointer"
                      style={{
                        paddingTop: 10,
                        paddingBottom: 10,
                        paddingLeft: 12,
                        borderLeft: `1px solid ${statusColor}${Math.round(statusOpacity * 0.3 * 255).toString(16).padStart(2, '0')}`,
                        marginBottom: 2,
                        transition: timing.t.borderModerate,
                      }}
                      onClick={() => handleNodeTap(node)}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-full"
                            style={{
                              width: 4,
                              height: 4,
                              background: statusColor,
                              opacity: statusOpacity,
                              boxShadow: node.status === 'connected'
                                ? glow.dot(statusColor, '20')
                                : 'none',
                            }}
                          />
                          <span style={{
                            fontFamily: SANS,
                            fontSize: typeSize.note,
                            fontWeight: weight.regular,
                            color: room.fg,
                            opacity: node.status === 'inactive' ? opacity.trace : opacity.present,
                            letterSpacing: tracking.body,
                          }}>
                            {node.label}
                          </span>
                        </div>

                        <span style={{
                          fontFamily: SANS,
                          fontSize: typeSize.whisper,
                          fontWeight: weight.medium,
                          letterSpacing: tracking.snug,
                          textTransform: 'uppercase',
                          color: statusColor,
                          opacity: statusOpacity * 0.6,
                        }}>
                          {node.status === 'connected' ? 'ACTIVE'
                            : node.status === 'available' ? 'CONNECT'
                            : 'COMING'}
                        </span>
                      </div>

                      {/* Detail / Flow expansion */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p style={{
                              fontFamily: SERIF,
                              fontSize: typeSize.caption,
                              fontWeight: weight.light,
                              fontStyle: 'italic',
                              color: room.fg,
                              opacity: opacity.quiet,
                              marginTop: 6,
                              marginBottom: 0,
                              lineHeight: leading.body,
                              paddingLeft: 6,
                            }}>
                              {node.detail}
                            </p>

                            {/* ── Therapist invite flow ── */}
                            {node.id === 'therapist' && flowPhase === 'therapist-invite' && (
                              <div className="mt-3" style={{ paddingLeft: 6 }}>
                                <input
                                  ref={emailRef}
                                  type="email"
                                  placeholder="therapist@email.com"
                                  value={inputEmail}
                                  onChange={e => setInputEmail(e.target.value)}
                                  style={glassInputStyle(node.color)}
                                  onKeyDown={e => e.key === 'Enter' && sendInvite()}
                                />
                                <input
                                  type="text"
                                  placeholder="Name (optional)"
                                  value={inputName}
                                  onChange={e => setInputName(e.target.value)}
                                  style={{ ...glassInputStyle(node.color), marginTop: 4 }}
                                />
                                <motion.button
                                  className="mt-3 cursor-pointer bg-transparent border-none outline-none block"
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: typeSize.micro,
                                    fontWeight: weight.medium,
                                    letterSpacing: tracking.label,
                                    textTransform: 'uppercase',
                                    color: node.color,
                                    opacity: inputEmail.trim() ? opacity.gentle : opacity.ghost,
                                    padding: '4px 0',
                                    transition: timing.t.fadeBrisk,
                                  }}
                                  onClick={(e) => { e.stopPropagation(); sendInvite(); }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  SEND INVITATION
                                </motion.button>
                              </div>
                            )}

                            {/* Invite sent confirmation */}
                            {node.id === 'therapist' && flowPhase === 'invite-sent' && therapistConn && (
                              <div className="mt-3" style={{ paddingLeft: 6 }}>
                                <p style={{
                                  fontFamily: SANS,
                                  fontSize: typeSize.detail,
                                  fontWeight: weight.regular,
                                  color: signal.anchor,
                                  opacity: opacity.gentle,
                                  margin: 0,
                                }}>
                                  Invitation sent. Code: {therapistConn.inviteCode}
                                </p>
                              </div>
                            )}

                            {/* Connected therapist — show revoke */}
                            {node.id === 'therapist' && therapistConn && flowPhase === 'idle' && (
                              <div className="mt-2" style={{ paddingLeft: 6, display: 'flex', gap: 12 }}>
                                <span style={{
                                  fontFamily: SANS,
                                  fontSize: typeSize.micro,
                                  fontWeight: weight.regular,
                                  letterSpacing: tracking.label,
                                  color: node.color,
                                  opacity: opacity.ambient,
                                }}>
                                  CODE: {therapistConn.inviteCode}
                                </span>
                                <motion.button
                                  className="cursor-pointer bg-transparent border-none outline-none"
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: typeSize.whisper,
                                    fontWeight: weight.medium,
                                    letterSpacing: tracking.normal,
                                    textTransform: 'uppercase',
                                    color: signal.friction,
                                    opacity: opacity.ambient,
                                    padding: 0,
                                  }}
                                  onClick={(e) => { e.stopPropagation(); revokeInvite(); }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  REVOKE
                                </motion.button>
                              </div>
                            )}

                            {/* ── Emergency contact flow ── */}
                            {node.id === 'emergency-contact' && flowPhase === 'emergency-edit' && (
                              <div className="mt-3" style={{ paddingLeft: 6 }}>
                                <input
                                  type="text"
                                  placeholder="Name"
                                  value={inputName}
                                  onChange={e => setInputName(e.target.value)}
                                  style={glassInputStyle(node.color)}
                                />
                                <input
                                  type="tel"
                                  placeholder="Phone"
                                  value={inputPhone}
                                  onChange={e => setInputPhone(e.target.value)}
                                  style={{ ...glassInputStyle(node.color), marginTop: 4 }}
                                />
                                <input
                                  type="text"
                                  placeholder="Relationship (optional)"
                                  value={inputRelationship}
                                  onChange={e => setInputRelationship(e.target.value)}
                                  style={{ ...glassInputStyle(node.color), marginTop: 4 }}
                                />
                                <motion.button
                                  className="mt-3 cursor-pointer bg-transparent border-none outline-none block"
                                  style={{
                                    fontFamily: SANS,
                                    fontSize: typeSize.micro,
                                    fontWeight: weight.medium,
                                    letterSpacing: tracking.label,
                                    textTransform: 'uppercase',
                                    color: node.color,
                                    opacity: inputName.trim() && inputPhone.trim() ? opacity.gentle : opacity.ghost,
                                    padding: '4px 0',
                                    transition: timing.t.fadeBrisk,
                                  }}
                                  onClick={(e) => { e.stopPropagation(); saveEmergency(); }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  SAVE ANCHOR PERSON
                                </motion.button>
                              </div>
                            )}

                            {node.id === 'atmosphere' && (
                              <div className="mt-3" style={{ paddingLeft: 6 }}>
                                <p
                                  style={{
                                    fontFamily: SERIF,
                                    fontSize: typeSize.caption,
                                    fontWeight: weight.light,
                                    fontStyle: 'italic',
                                    color: room.fg,
                                    opacity: opacity.quiet,
                                    marginTop: 0,
                                    marginBottom: 8,
                                    lineHeight: leading.body,
                                  }}
                                >
                                  {linkAtmosphere.description}
                                  {linkDeck ? ` Currently ${linkDeck.delivery}.` : ''}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {[
                                    {
                                      label: 'Off',
                                      active: !settings.enabled || settings.intensity === 'off',
                                      onClick: () =>
                                        updateSettings({
                                          enabled: false,
                                          intensity: 'off',
                                        }),
                                    },
                                    {
                                      label: 'Subtle',
                                      active: settings.enabled && settings.intensity === 'subtle',
                                      onClick: () =>
                                        updateSettings({
                                          enabled: true,
                                          intensity: 'subtle',
                                        }),
                                    },
                                    {
                                      label: 'Immersive',
                                      active: settings.enabled && settings.intensity === 'immersive',
                                      onClick: () =>
                                        updateSettings({
                                          enabled: true,
                                          intensity: 'immersive',
                                        }),
                                    },
                                  ].map((option) => (
                                    <motion.button
                                      key={option.label}
                                      className="cursor-pointer bg-transparent outline-none"
                                      style={{
                                        fontFamily: SANS,
                                        fontSize: typeSize.whisper,
                                        fontWeight: weight.medium,
                                        letterSpacing: tracking.normal,
                                        textTransform: 'uppercase',
                                        color: option.active ? mode.color : room.fg,
                                        opacity: option.active ? opacity.voice : opacity.quiet,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 999,
                                        padding: '7px 10px',
                                        background: option.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                      }}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        option.onClick();
                                      }}
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      {option.label}
                                    </motion.button>
                                  ))}

                                  <motion.button
                                    className="cursor-pointer bg-transparent outline-none"
                                    style={{
                                      fontFamily: SANS,
                                      fontSize: typeSize.whisper,
                                      fontWeight: weight.medium,
                                      letterSpacing: tracking.normal,
                                      textTransform: 'uppercase',
                                      color: settings.adaptToSurface ? mode.color : room.fg,
                                      opacity: settings.adaptToSurface ? opacity.voice : opacity.quiet,
                                      border: '1px solid rgba(255,255,255,0.08)',
                                      borderRadius: 999,
                                      padding: '7px 10px',
                                      background: settings.adaptToSurface ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      updateSettings({
                                        adaptToSurface: !settings.adaptToSurface,
                                        enabled: settings.enabled || settings.intensity !== 'off',
                                      });
                                    }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    Adapt {settings.adaptToSurface ? 'On' : 'Off'}
                                  </motion.button>
                                </div>
                              </div>
                            )}

                            {/* Generic action for non-flow nodes */}
                            {!node.hasFlow && node.status !== 'inactive' && (
                              <>
                                {/* BODY domain — wearable connect/disconnect with live data */}
                                {node.domain === 'BODY' ? (
                                  <div className="mt-2" style={{ paddingLeft: 6 }}>
                                    <motion.button
                                      className="cursor-pointer bg-transparent border-none outline-none block"
                                      style={{
                                        fontFamily: SANS,
                                        fontSize: typeSize.whisper,
                                        fontWeight: weight.medium,
                                        letterSpacing: tracking.normal,
                                        textTransform: 'uppercase',
                                        color: node.status === 'connected' ? signal.friction : signal.anchor,
                                        opacity: opacity.present,
                                        padding: '4px 0',
                                      }}
                                      onClick={(e) => { e.stopPropagation(); toggleWearable(node.id, node.label); }}
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      {node.status === 'connected' ? 'DISCONNECT DEVICE' : 'SIMULATE CONNECTION'}
                                    </motion.button>

                                    {/* Live biometric readout — only when connected and sim data exists */}
                                    {node.status === 'connected' && wearableSim && (
                                      <div className="mt-2 flex gap-4">
                                        {[
                                          { label: 'HR', value: `${wearableSim.heartRate}`, unit: 'BPM' },
                                          { label: 'HRV', value: `${wearableSim.hrv}`, unit: 'MS' },
                                          { label: 'MOV', value: `${wearableSim.movement}`, unit: 'CAL' },
                                        ].map(metric => (
                                          <div key={metric.label} className="flex flex-col items-center">
                                            <span style={{
                                              fontFamily: SANS,
                                              fontSize: typeSize.detail,
                                              fontWeight: weight.regular,
                                              color: signal.clarity,
                                              opacity: opacity.present,
                                            }}>
                                              {metric.value}
                                            </span>
                                            <span style={{
                                              fontFamily: SANS,
                                              fontSize: typeSize.sub,
                                              fontWeight: weight.medium,
                                              letterSpacing: tracking.snug,
                                              color: room.fg,
                                              opacity: opacity.ghost,
                                            }}>
                                              {metric.label}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <motion.button
                                    className="mt-2 cursor-pointer bg-transparent border-none outline-none"
                                    style={{
                                      fontFamily: SANS,
                                      fontSize: typeSize.whisper,
                                      fontWeight: weight.medium,
                                      letterSpacing: tracking.normal,
                                      textTransform: 'uppercase',
                                      color: statusColor,
                                      opacity: opacity.present,
                                      paddingLeft: 6,
                                      padding: '4px 6px',
                                    }}
                                    whileHover={{ opacity: opacity.voice }}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    {node.status === 'connected' ? 'DISCONNECT' : 'ENABLE'}
                                  </motion.button>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {/* Source code footer */}
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <div
                className="mx-auto rounded-full"
                style={{
                  width: 2,
                  height: 2,
                  background: mode.color,
                  opacity: opacity.ghost,
                  marginBottom: 8,
                }}
              />
              <p style={{
                fontFamily: SERIF,
                fontSize: typeSize.detail,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                opacity: opacity.flicker,
                lineHeight: leading.relaxed,
              }}>
                Your own source code.
                <br />
                Every connection is a bridge, not a leash.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving indicator */}
      <AnimatePresence>
        {flowPhase === 'saving' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ bottom: ORB_CLEARANCE + 20, left: 0, right: 0, textAlign: 'center', zIndex: layer.scrim }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            exit={{ opacity: 0 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              color: mode.color,
            }}>
              SAVING...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="link" />

      {/* Orb clearance */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.overlay,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
