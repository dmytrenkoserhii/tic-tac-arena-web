import { supabase } from '../../lib/supabase'
import type { Game } from '../../types/games'
import type { Room } from '../../types/rooms'

type CreateGameInput = {
  room: Room
}

export async function getActiveGame(roomId: string) {
  return supabase
    .from('games')
    .select('id, room_id, x_player_id, o_player_id, status, winner_id')
    .eq('room_id', roomId)
    .eq('status', 'in_progress')
    .maybeSingle<Game>()
}

export async function createGame({ room }: CreateGameInput) {
  if (!room.guest_id) {
    return {
      data: null,
      error: new Error('The second player must join before starting a game.'),
    }
  }

  const activeGame = await getActiveGame(room.id)

  if (activeGame.error) {
    return { data: null, error: activeGame.error }
  }

  if (activeGame.data) {
    return { data: activeGame.data, error: null }
  }

  return supabase
    .from('games')
    .insert({
      o_player_id: room.guest_id,
      room_id: room.id,
      x_player_id: room.host_id,
    })
    .select('id, room_id, x_player_id, o_player_id, status, winner_id')
    .single<Game>()
}
