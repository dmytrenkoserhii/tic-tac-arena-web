import { supabase } from '../../lib/supabase'
import { apiRequest } from '../../lib/api-client'
import type { Game, Move } from '../../types/games'
import type { Room } from '../../types/rooms'

type CreateGameInput = {
  room: Room
}

type CreateMoveInput = {
  cellIndex: number
  gameId: string
}

export async function getActiveGame(roomId: string) {
  return supabase
    .from('games')
    .select('id, room_id, x_player_id, o_player_id, status, winner_id')
    .eq('room_id', roomId)
    .eq('status', 'in_progress')
    .maybeSingle<Game>()
}

export async function getCurrentRoomGame(roomId: string) {
  return supabase
    .from('games')
    .select('id, room_id, x_player_id, o_player_id, status, winner_id')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<Game>()
}

export async function getGame(gameId: string) {
  return supabase
    .from('games')
    .select('id, room_id, x_player_id, o_player_id, status, winner_id')
    .eq('id', gameId)
    .single<Game>()
}

export async function createGame({ room }: CreateGameInput) {
  if (!room.guest_id) {
    return {
      data: null,
      error: new Error('The second player must join before starting a game.'),
    }
  }

  return apiRequest<Game>('/games', {
    body: JSON.stringify({ roomId: room.id }),
    method: 'POST',
  })
}

export async function getMoves(gameId: string) {
  return supabase
    .from('moves')
    .select('id, game_id, player_id, mark, cell_index, move_number')
    .eq('game_id', gameId)
    .order('move_number', { ascending: true })
}

export async function createMove({
  cellIndex,
  gameId,
}: CreateMoveInput) {
  return apiRequest<Move>(`/games/${gameId}/moves`, {
    body: JSON.stringify({ cellIndex }),
    method: 'POST',
  })
}
