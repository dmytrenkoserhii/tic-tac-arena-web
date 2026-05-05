import type { Room } from '../../types/rooms'

export function getRoomStatusLabel(status: Room['status']) {
  if (status === 'waiting') {
    return 'Waiting for player'
  }

  if (status === 'ready') {
    return 'Ready to play'
  }

  return 'Closed'
}

export function getMatchStatusMessage(room: Room) {
  if (room.status === 'ready') {
    return 'Both players are in. You can play, restart rounds, or leave the room.'
  }

  if (room.status === 'closed') {
    return 'This room is closed. Create a new room to keep playing.'
  }

  return 'Waiting for player two to join. Share the code or invite link.'
}
