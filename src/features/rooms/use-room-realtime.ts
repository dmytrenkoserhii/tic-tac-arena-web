import { useEffect } from 'react'

import { supabase } from '../../lib/supabase'
import type { Room } from '../../types/rooms'

type UseRoomRealtimeInput = {
  onRoomChange: (room: Room) => void
  room: Room | null
}

export function useRoomRealtime({ onRoomChange, room }: UseRoomRealtimeInput) {
  useEffect(() => {
    if (!room) {
      return
    }

    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `id=eq.${room.id}`,
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          onRoomChange(payload.new as Room)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onRoomChange, room])
}
