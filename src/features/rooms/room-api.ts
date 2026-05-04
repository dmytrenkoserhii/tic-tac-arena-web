import { supabase } from '../../lib/supabase'

export type Room = {
  code: string
  guest_id: string | null
  host_id: string
  id: string
  status: 'waiting' | 'ready' | 'closed'
}

type CreateRoomInput = {
  hostId: string
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

function generateRoomCode() {
  const values = crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH))

  return Array.from(values, (value) => {
    return ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]
  }).join('')
}
