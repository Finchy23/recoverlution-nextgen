/**
 * useLinkInfrastructure — LINK shell runtime seam
 *
 * Owns LINK runtime state and side effects:
 * - therapist connection hydration
 * - emergency contact hydration
 * - wearable connection hydration and polling
 * - export building
 * - infrastructure mutations
 *
 * LinkSurface stays focused on glass, typography, and interaction flow.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIndividualId } from './session-seam';
import { useResilience } from './resilience-seam';
import { emit } from './event-seam';
import {
  buildExportPayload,
  downloadExport,
  inviteTherapist as inviteTherapistRequest,
  loadSnapshot,
  pushPlotCoordinates,
  revokeTherapist as revokeTherapistRequest,
  saveEmergencyContact as saveEmergencyContactRequest,
  setWearableConnection,
  wearableSimulation,
  type LinkEmergencyContact,
  type LinkTherapistConnection,
  type LinkWearableSimulation,
} from './link-runtime';
import { signal } from '../design-system/surface-tokens';

export interface LinkInfrastructureState {
  therapistConn: LinkTherapistConnection | null;
  emergencyContact: LinkEmergencyContact | null;
  wearableStatus: Record<string, boolean>;
  wearableSim: LinkWearableSimulation | null;
  hydrated: boolean;
}

export interface LinkInfrastructureActions {
  exportConstellation: () => Promise<boolean>;
  inviteTherapist: (therapistEmail: string, therapistName?: string | null) => Promise<boolean>;
  revokeTherapist: () => Promise<boolean>;
  saveEmergencyContact: (name: string, phone: string, relationship?: string | null) => Promise<boolean>;
  toggleWearableConnection: (deviceType: string, deviceName: string) => Promise<boolean>;
}

export function useLinkInfrastructure(): [LinkInfrastructureState, LinkInfrastructureActions] {
  const individualId = useIndividualId();
  const { setRuntimeAvailable } = useResilience();
  const [therapistConn, setTherapistConn] = useState<LinkTherapistConnection | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<LinkEmergencyContact | null>(null);
  const [wearableStatus, setWearableStatus] = useState<Record<string, boolean>>({});
  const [wearableSim, setWearableSim] = useState<LinkWearableSimulation | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncWearableSimulation = useCallback(async () => {
    const { data, error } = await wearableSimulation(individualId);
    if (error || !data?.connected || !data.simulation) {
      if (error) {
        console.warn('[link-runtime] wearable simulation failed:', error);
        setRuntimeAvailable('link', false);
      }
      return false;
    }

    setRuntimeAvailable('link', true);
    setWearableSim(data.simulation);

    await pushPlotCoordinates({
      individualId,
      coordinates: data.simulation.coordinates.map((coordinate) => ({
        ...coordinate,
        label: coordinate.id.toUpperCase(),
        whisper: '',
        color:
          coordinate.id === 'clarity'
            ? signal.clarity
            : coordinate.id === 'energy'
              ? signal.energy
              : signal.anchor,
      })),
    });

    return true;
  }, [individualId, setRuntimeAvailable]);

  useEffect(() => {
    let cancelled = false;

    loadSnapshot(individualId).then(({ data, error }) => {
      if (cancelled) return;

      setRuntimeAvailable('link', !error);
      setTherapistConn(data.therapistConnection);
      setEmergencyContact(data.emergencyContact);
      setWearableStatus(data.wearableStatus);
      setHydrated(true);
    }).catch((error) => {
      if (cancelled) return;
      console.warn('[link-runtime] snapshot hydrate failed:', error);
      setRuntimeAvailable('link', false);
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [individualId, setRuntimeAvailable]);

  useEffect(() => {
    const hasConnectedWearables = Object.values(wearableStatus).some(Boolean);

    if (hasConnectedWearables && !simTimerRef.current) {
      void syncWearableSimulation();
      simTimerRef.current = setInterval(() => {
        void syncWearableSimulation();
      }, 30000);
    }

    if (!hasConnectedWearables && simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
      setWearableSim(null);
    }

    return () => {
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
      }
    };
  }, [syncWearableSimulation, wearableStatus]);

  const exportConstellation = useCallback(async () => {
    const { data, error } = await buildExportPayload(individualId);
    if (error) {
      console.warn('[link-runtime] export build failed:', error);
      emit('navigate', 'link_export_failed', { error }, { userId: individualId, surfaceId: 'link' });
      setRuntimeAvailable('link', false);
      return false;
    }

    downloadExport(data);
    emit('navigate', 'link_exported', { sections: ['plot', 'constellation', 'infrastructure'] }, { userId: individualId, surfaceId: 'link' });
    setRuntimeAvailable('link', true);
    return true;
  }, [individualId, setRuntimeAvailable]);

  const inviteTherapist = useCallback(async (therapistEmail: string, therapistName?: string | null) => {
    const { data, error } = await inviteTherapistRequest({
      individualId,
      therapistEmail,
      therapistName,
    });

    if (error || !data?.code) {
      console.warn('[link-runtime] therapist invite failed:', error);
      emit('navigate', 'link_therapist_invite_failed', { error }, { userId: individualId, surfaceId: 'link' });
      setRuntimeAvailable('link', false);
      return false;
    }

    setTherapistConn({
      inviteCode: data.code,
      therapistEmail,
      therapistName: therapistName ?? null,
      status: 'pending',
    });
    setRuntimeAvailable('link', true);
    emit('navigate', 'link_therapist_invited', { therapistEmail }, { userId: individualId, surfaceId: 'link' });
    return true;
  }, [individualId, setRuntimeAvailable]);

  const revokeTherapist = useCallback(async () => {
    const { error } = await revokeTherapistRequest(individualId);
    if (error) {
      console.warn('[link-runtime] therapist revoke failed:', error);
      emit('navigate', 'link_therapist_revoke_failed', { error }, { userId: individualId, surfaceId: 'link' });
      setRuntimeAvailable('link', false);
      return false;
    }

    setTherapistConn(null);
    setRuntimeAvailable('link', true);
    emit('navigate', 'link_therapist_revoked', {}, { userId: individualId, surfaceId: 'link' });
    return true;
  }, [individualId, setRuntimeAvailable]);

  const saveEmergencyContact = useCallback(async (name: string, phone: string, relationship?: string | null) => {
    const { error } = await saveEmergencyContactRequest({
      individualId,
      name,
      phone,
      relationship,
    });

    if (error) {
      console.warn('[link-runtime] emergency contact save failed:', error);
      emit('navigate', 'link_emergency_save_failed', { error }, { userId: individualId, surfaceId: 'link' });
      setRuntimeAvailable('link', false);
      return false;
    }

    setEmergencyContact({ name, phone, relationship: relationship ?? null });
    setRuntimeAvailable('link', true);
    emit('navigate', 'link_emergency_saved', { relationship: relationship ?? null }, { userId: individualId, surfaceId: 'link' });
    return true;
  }, [individualId, setRuntimeAvailable]);

  const toggleWearableConnection = useCallback(async (deviceType: string, deviceName: string) => {
    const currentlyConnected = !!wearableStatus[deviceType];
    const connected = !currentlyConnected;

    const { error } = await setWearableConnection({
      individualId,
      deviceType,
      deviceName,
      connected,
    });

    if (error) {
      console.warn('[link-runtime] wearable toggle failed:', error);
      emit('navigate', 'link_wearable_toggle_failed', { deviceType, error }, { userId: individualId, surfaceId: 'link' });
      setRuntimeAvailable('link', false);
      return false;
    }

    setWearableStatus((current) => ({
      ...current,
      [deviceType]: connected,
    }));
    setRuntimeAvailable('link', true);
    emit('navigate', 'link_wearable_toggled', { deviceType, connected }, { userId: individualId, surfaceId: 'link' });

    if (connected) {
      void syncWearableSimulation();
    }

    if (!connected) {
      const otherConnected = Object.entries(wearableStatus).some(([key, value]) => key !== deviceType && value);
      if (!otherConnected) {
        setWearableSim(null);
      }
    }

    return true;
  }, [individualId, setRuntimeAvailable, syncWearableSimulation, wearableStatus]);

  return [
    {
      therapistConn,
      emergencyContact,
      wearableStatus,
      wearableSim,
      hydrated,
    },
    {
      exportConstellation,
      inviteTherapist,
      revokeTherapist,
      saveEmergencyContact,
      toggleWearableConnection,
    },
  ];
}
