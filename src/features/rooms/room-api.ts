import { supabase } from '../../lib/supabase';
import { apiRequest } from '../../lib/api-client';
import type { Room } from '../../types/rooms';

type CreateRoomInput = {
  hostId: string;
};

type JoinRoomInput = {
  code: string;
  guestId: string;
};

type GetRoomByCodeInput = {
  code: string;
};

type LeaveRoomInput = {
  roomId: string;
};

export async function createRoom({ hostId }: CreateRoomInput) {
  void hostId;

  return apiRequest<Room>('/rooms', {
    method: 'POST',
  });
}

export async function joinRoom({ code, guestId }: JoinRoomInput) {
  void guestId;

  return apiRequest<Room>('/rooms/join', {
    body: JSON.stringify({ code: normalizeRoomCode(code) }),
    method: 'POST',
  });
}

export async function getRoomByCode({ code }: GetRoomByCodeInput) {
  return supabase
    .from('rooms')
    .select('id, code, host_id, guest_id, status')
    .eq('code', normalizeRoomCode(code))
    .maybeSingle<Room>();
}

export async function leaveRoom({ roomId }: LeaveRoomInput) {
  return apiRequest<Room>(`/rooms/${roomId}/leave`, {
    method: 'POST',
  });
}

export function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}
