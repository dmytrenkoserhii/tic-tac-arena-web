import { describe, expect, it } from 'vitest'

import { getMatchStatusMessage, getRoomStatusLabel } from './room-state'
import type { Room } from '../../types/rooms'

const room: Room = {
  code: 'ABC123',
  guest_id: null,
  host_id: 'host-id',
  id: 'room-id',
  status: 'waiting',
}

describe('room-state', () => {
  it('maps room statuses to user-facing labels', () => {
    expect(getRoomStatusLabel('waiting')).toBe('Waiting for player')
    expect(getRoomStatusLabel('ready')).toBe('Ready to play')
    expect(getRoomStatusLabel('closed')).toBe('Closed')
  })

  it('explains waiting room state with a useful next action', () => {
    expect(getMatchStatusMessage(room)).toBe(
      'Waiting for player two to join. Share the code or invite link.',
    )
  })

  it('explains ready room state without exposing internal status names', () => {
    expect(getMatchStatusMessage({ ...room, status: 'ready' })).toBe(
      'Both players are in. You can play, restart rounds, or leave the room.',
    )
  })
})
