import { useCallback, useEffect, useState } from 'react';
import { useIndividualId } from './session-seam';
import { useResilience } from './resilience-seam';
import { emit } from './event-seam';
import {
  loadClusterDots,
  seedTalkThread,
} from './map-runtime';
import { CLUSTERS, type MindblockDot, type NeuralCluster } from './map-model';

export interface MapConstellationState {
  clusterDots: Map<string, MindblockDot[]>;
  loaded: boolean;
}

export interface MapConstellationActions {
  seedTalkExploration: (cluster: NeuralCluster, integration?: number) => Promise<boolean>;
}

function emptyClusterDots() {
  return new Map<string, MindblockDot[]>(CLUSTERS.map((cluster) => [cluster.id, []]));
}

export function useMapConstellation(): [MapConstellationState, MapConstellationActions] {
  const individualId = useIndividualId();
  const { setRuntimeAvailable } = useResilience();
  const [clusterDots, setClusterDots] = useState<Map<string, MindblockDot[]>>(emptyClusterDots);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadClusterDots(individualId)
      .then(({ data, error }) => {
        if (cancelled) return;

        setClusterDots(data);
        setLoaded(true);
        setRuntimeAvailable('map', !error);

        if (error) {
          console.warn('[map-runtime] constellation hydrate partially failed:', error);
        }
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[map-runtime] constellation hydrate failed:', error);
        setClusterDots(emptyClusterDots());
        setLoaded(true);
        setRuntimeAvailable('map', false);
      });

    return () => {
      cancelled = true;
    };
  }, [individualId, setRuntimeAvailable]);

  const seedTalkExploration = useCallback(async (cluster: NeuralCluster, integration = 0) => {
    const { data, error } = await seedTalkThread({
      individualId,
      nodeId: cluster.id,
      schema: cluster.name,
      label: cluster.name,
      integration,
    });

    if (error || !data?.stored) {
      console.warn('[map-runtime] talk seed failed:', error);
      emit('signal', 'map_topic_seed_failed', { clusterId: cluster.id, error }, { userId: individualId, surfaceId: 'map' });
      setRuntimeAvailable('map', false);
      return false;
    }

    emit('signal', 'map_topic_seeded', { clusterId: cluster.id, schema: cluster.name }, { userId: individualId, surfaceId: 'map' });
    setRuntimeAvailable('map', true);
    return true;
  }, [individualId, setRuntimeAvailable]);

  return [
    {
      clusterDots,
      loaded,
    },
    {
      seedTalkExploration,
    },
  ];
}
