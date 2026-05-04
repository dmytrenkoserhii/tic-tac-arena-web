import { supabase } from '../../lib/supabase'
import type { Room } from '../../types/rooms'

type CreateRoomInput = {
  hostId: string
}

type JoinRoomInput = {
  code: string
  guestId: string
}

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ROOM_CODE_LENGTH = 6
const MAX_CREATE_ATTEMPTS = 5

export async function createRoom({ hostId }: CreateRoomInput) {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code: generateRoomCode(),
        host_id: hostId,
      })
      .select('id, code, host_id, guest_id, status')
      .single<Room>()

    if (!error) {
      return { data, error: null }
    }

    lastError = error

    if (error.code !== '23505') {
      break
    }
  }

  return { data: null, error: lastError }
}

export async function joinRoom({ code, guestId }: JoinRoomInput) {
  return supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      status: 'ready',
    })
    .eq('code', normalizeRoomCode(code))
    .eq('status', 'waiting')
    .is('guest_id', null)
    .select('id, code, host_id, guest_id, status')
    .single<Room>()
}

export function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase()
}

function generateRoomCode() {
  const values = crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH))

  return Array.from(values, (value) => {
    return ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]
  }).join('')
}
