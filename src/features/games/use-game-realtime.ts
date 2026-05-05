import { useEffect } from 'react'

import { supabase } from '../../lib/supabase'
import type { Game } from '../../types/games'
import type { Room } from '../../types/rooms'

type UseGameRealtimeInput = {
  onGameChange: (game: Game) => void
  room: Room | null
}

export function useGameRealtime({ onGameChange, room }: UseGameRealtimeInput) {
  useEffect(() => {
    if (!room) {
      return
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
          onGameChange(payload.new as Game)
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
          onGameChange(payload.new as Game)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onGameChange, room])
}
