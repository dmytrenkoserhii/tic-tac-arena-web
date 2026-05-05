import { supabase } from '../../lib/supabase'
import type { Room } from '../../types/rooms'

type CreateRoomInput = {
  hostId: string
}

type JoinRoomInput = {
  code: string
  guestId: string
}

type GetRoomByCodeInput = {
  code: string
}

type LeaveRoomInput = {
  roomId: string
}

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ROOM_CODE_LENGTH = 6
const MAX_CREATE_ATTEMPTS = 5
const JOIN_ROOM_ERROR =
  'Room was not found, is already full, or you are the host.'

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
  const { data, error } = await supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      status: 'ready',
    })
    .eq('code', normalizeRoomCode(code))
    .eq('status', 'waiting')
    .is('guest_id', null)
    .select('id, code, host_id, guest_id, status')
    .maybeSingle<Room>()

  if (error) {
    return { data: null, error }
  }

  if (!data) {
    return {
      data: null,
      error: new Error(JOIN_ROOM_ERROR),
    }
  }

  return { data, error: null }
}

export async function getRoomByCode({ code }: GetRoomByCodeInput) {
  return supabase
    .from('rooms')
    .select('id, code, host_id, guest_id, status')
    .eq('code', normalizeRoomCode(code))
    .maybeSingle<Room>()
}

export async function leaveRoom({ roomId }: LeaveRoomInput) {
  return supabase
    .rpc('leave_room', {
      room_id_input: roomId,
    })
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
