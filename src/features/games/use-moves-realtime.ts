import { useEffect, useEffectEvent } from 'react'

import { supabase } from '../../lib/supabase'
import type { Game, Move } from '../../types/games'

type UseMovesRealtimeInput = {
  game: Game | null
  onMoveCreate: (move: Move) => void
}

export function useMovesRealtime({
  game,
  onMoveCreate,
}: UseMovesRealtimeInput) {
  const handleMoveCreate = useEffectEvent(onMoveCreate)

  useEffect(() => {
    if (!game) {
      return
    }

    const channel = supabase
      .channel(`game:${game.id}:moves`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          filter: `game_id=eq.${game.id}`,
          schema: 'public',
          table: 'moves',
        },
        (payload) => {
          handleMoveCreate(payload.new as Move)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [game])
}
