import { useEffect, useEffectEvent } from 'react';

import { supabase } from '../../lib/supabase';
import type { Game } from '../../types/games';
import type { Room } from '../../types/rooms';

type UseGameRealtimeInput = {
  onGameChange: (game: Game) => void;
  room: Room | null;
};

export function useGameRealtime({ onGameChange, room }: UseGameRealtimeInput) {
  const handleGameChange = useEffectEvent(onGameChange);

  useEffect(() => {
    if (!room) {
      return;
    }

    const channel = supabase
      .channel(`room:${room.id}:games`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `room_id=eq.${room.id}`,
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          handleGameChange(payload.new as Game);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `room_id=eq.${room.id}`,
          schema: 'public',
          table: 'games',
        },
        (payload) => {
          handleGameChange(payload.new as Game);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [room]);
}
