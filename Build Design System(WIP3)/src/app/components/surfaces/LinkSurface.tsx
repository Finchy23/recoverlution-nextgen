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

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { hapticSeal } from './haptics';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';

import { room, font, layout, tracking, typeSize, leading, weight, opacity, timing, glow, void_, layer, signal } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

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

// ─── Therapist connection state ───

interface TherapistConnection {
  inviteCode: string;
  therapistEmail: string;
  therapistName: string | null;
  status: 'pending' | 'accepted' | 'revoked';
}

// ─── Emergency contact state ───

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string | null;
}

interface LinkSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function LinkSurface({ mode, breath }: LinkSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [therapistConn, setTherapistConn] = useState<TherapistConnection | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);
  const [flowPhase, setFlowPhase] = useState<'idle' | 'therapist-invite' | 'emergency-edit' | 'invite-sent' | 'saving'>('idle');
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputRelationship, setInputRelationship] = useState('');
  const [wearableStatus, setWearableStatus] = useState<Map<string, boolean>>(new Map());
  const [wearableSim, setWearableSim] = useState<{
    heartRate: number; hrv: number; movement: number;
    coordinates: { id: string; value: number }[];
    source: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { arrived, delay } = useSurfaceArrival(mode);

  const breathPhase = Math.sin(breath * Math.PI * 2);

  // ── Load existing connections on mount ──
  useEffect(() => {
    // Therapist connection
    fetch(`${BASE}/link/therapist/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.connection) {
          setTherapistConn(data.connection);
        }
      })
      .catch(() => {});

    // Emergency contact
    fetch(`${BASE}/link/emergency/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.contact) {
          setEmergencyContact(data.contact);
        }
      })
      .catch(() => {});

    // Wearable connections
    fetch(`${BASE}/link/wearables/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.wearables && data.wearables.length > 0) {
          const connMap = new Map<string, boolean>();
          data.wearables.forEach((w: any) => {
            if (w.value?.deviceType) {
              connMap.set(w.value.deviceType, !!w.value.connected);
            }
          });
          setWearableStatus(connMap);
        }
      })
      .catch(() => {});
  }, []);

  // Build node list dynamically based on connection state
  const infraNodes: InfraNode[] = [
    // BODY
    { id: 'apple-watch', domain: 'BODY', label: 'Apple Watch', status: wearableStatus.get('apple-watch') ? 'connected' : 'available', detail: 'Heart rate · HRV · Movement', color: signal.clarity },
    { id: 'oura', domain: 'BODY', label: 'Oura Ring', status: wearableStatus.get('oura') ? 'connected' : 'available', detail: 'Sleep · Recovery · Readiness', color: signal.clarity },
    { id: 'whoop', domain: 'BODY', label: 'Whoop', status: wearableStatus.get('whoop') ? 'connected' : 'inactive', detail: 'Strain · Recovery · Sleep', color: signal.clarity },
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
      // Fetch all data in parallel
      const [plotRes, historyRes, kbeRes, therapistRes, emergencyRes] = await Promise.all([
        fetch(`${BASE}/plot/coordinates/${userId}`, { headers: headers() }).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/plot/history/${userId}`, { headers: headers() }).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/profile/kbe/${userId}`, { headers: headers() }).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/link/therapist/${userId}`, { headers: headers() }).then(r => r.json()).catch(() => null),
        fetch(`${BASE}/link/emergency/${userId}`, { headers: headers() }).then(r => r.json()).catch(() => null),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        platform: 'Recoverlution',
        version: '1.0.0',
        userId,
        plot: {
          current: plotRes?.found ? plotRes.coordinates : null,
          lastTimestamp: plotRes?.timestamp || null,
          history: historyRes?.readings || [],
          historyCount: historyRes?.count || 0,
        },
        constellation: {
          kbeProfiles: kbeRes?.profiles || [],
          profileCount: kbeRes?.count || 0,
        },
        infrastructure: {
          therapist: therapistRes?.found ? therapistRes.connection : null,
          emergencyContact: emergencyRes?.found ? emergencyRes.contact : null,
        },
      };

      // Create and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recoverlution-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hapticSeal();
      setFlowPhase('idle');
      setTimeout(() => setSelectedNode(null), 1500);
    } catch (err) {
      console.error('[LINK export]', err);
      setFlowPhase('idle');
    }
  }, []);

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
  }, [therapistConn, emergencyContact]);

  const sendInvite = useCallback(async () => {
    if (!inputEmail.trim()) return;
    setFlowPhase('saving');

    try {
      const res = await fetch(`${BASE}/link/invite`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          userId,
          therapistEmail: inputEmail.trim(),
          therapistName: inputName.trim() || null,
        }),
      });
      const data = await res.json();

      if (data?.code) {
        hapticSeal();
        setTherapistConn({
          inviteCode: data.code,
          therapistEmail: inputEmail.trim(),
          therapistName: inputName.trim() || null,
          status: 'pending',
        });
        setFlowPhase('invite-sent');
        setTimeout(() => setFlowPhase('idle'), 3000);
      }
    } catch (err) {
      console.error('[LINK invite]', err);
      setFlowPhase('idle');
    }
  }, [inputEmail, inputName]);

  const revokeInvite = useCallback(async () => {
    setFlowPhase('saving');
    try {
      await fetch(`${BASE}/link/revoke`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId }),
      });
      setTherapistConn(null);
      hapticSeal();
      setFlowPhase('idle');
      setSelectedNode(null);
    } catch (err) {
      console.error('[LINK revoke]', err);
      setFlowPhase('idle');
    }
  }, []);

  const saveEmergency = useCallback(async () => {
    if (!inputName.trim() || !inputPhone.trim()) return;
    setFlowPhase('saving');

    try {
      await fetch(`${BASE}/link/emergency`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          userId,
          name: inputName.trim(),
          phone: inputPhone.trim(),
          relationship: inputRelationship.trim() || null,
        }),
      });
      hapticSeal();
      setEmergencyContact({
        name: inputName.trim(),
        phone: inputPhone.trim(),
        relationship: inputRelationship.trim() || null,
      });
      setFlowPhase('idle');
      setSelectedNode(null);
    } catch (err) {
      console.error('[LINK emergency]', err);
      setFlowPhase('idle');
    }
  }, [inputName, inputPhone, inputRelationship]);

  // ── Wearable connect/disconnect handler ──
  const toggleWearable = useCallback(async (deviceType: string, deviceName: string) => {
    const currentlyConnected = wearableStatus.get(deviceType) || false;
    const newState = !currentlyConnected;

    try {
      await fetch(`${BASE}/link/wearable`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          userId,
          deviceType,
          deviceName,
          connected: newState,
        }),
      });

      hapticSeal();
      setWearableStatus(prev => {
        const next = new Map(prev);
        next.set(deviceType, newState);
        return next;
      });

      // If connecting, immediately fetch simulation data
      if (newState) {
        fetchSimulation();
      } else {
        // If disconnecting and no other wearables active, clear sim
        const others = [...wearableStatus.entries()].filter(([k, v]) => k !== deviceType && v);
        if (others.length === 0) {
          setWearableSim(null);
          if (simTimerRef.current) {
            clearInterval(simTimerRef.current);
            simTimerRef.current = null;
          }
        }
      }
    } catch (err) {
      console.error('[LINK wearable toggle]', err);
    }
  }, [wearableStatus]);

  // ── Wearable simulation polling ──
  const fetchSimulation = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/link/wearable-sim/${userId}`, { headers: headers() });
      const data = await res.json();
      if (data?.connected && data.simulation) {
        setWearableSim(data.simulation);

        // Auto-push coordinates to PLOT
        fetch(`${BASE}/plot/coordinates`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            userId,
            coordinates: data.simulation.coordinates.map((c: any) => ({
              ...c,
              label: c.id.toUpperCase(),
              whisper: '',
              color: c.id === 'clarity' ? signal.clarity : c.id === 'energy' ? signal.energy : signal.anchor,
            })),
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[LINK sim poll]', err);
    }
  }, []);

  // Start/stop simulation polling based on connected wearables
  useEffect(() => {
    const hasConnected = [...wearableStatus.values()].some(v => v);
    if (hasConnected && !simTimerRef.current) {
      fetchSimulation(); // Immediate fetch
      simTimerRef.current = setInterval(fetchSimulation, 30000); // Poll every 30s
    } else if (!hasConnected && simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [wearableStatus, fetchSimulation]);

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