import { Alert, Button, Stack } from '@mantine/core';

import { StatusShell } from '../layout';
import { ActiveRoomPanel } from './active-room-panel';
import { MatchStatusPanel } from './match-status-panel';
import type { Profile } from '../../types/profile';
import type { Room } from '../../types/rooms';
import classes from '../../App.module.css';

type RoomScreenProps = {
  inviteLink: string | null;
  isGameActionLoading: boolean;
  isLeaveRoomLoading: boolean;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  profile: Profile | null;
  room: Room;
  roomError: string | null;
  roomNotice: string | null;
};

export function RoomScreen({
  inviteLink,
  isGameActionLoading,
  isLeaveRoomLoading,
  onLeaveRoom,
  onStartGame,
  profile,
  room,
  roomError,
  roomNotice,
}: RoomScreenProps) {
  const isHost = profile?.id === room.host_id;
  const canStartGame = isHost && room.status === 'ready';

  return (
    <StatusShell
      eyebrow="Private room"
      lead={
        room.status === 'ready'
          ? 'Both players are here. The host can launch the next round.'
          : 'Share the code or invite link with your opponent.'
      }
      title={`Room ${room.code}`}
    >
      <Stack gap="lg">
        {roomError ? (
          <Alert color="red" radius="md" title="Room needs attention">
            {roomError}
          </Alert>
        ) : null}

        {roomNotice ? (
          <Alert color="blue" radius="md" title="Room updated">
            {roomNotice}
          </Alert>
        ) : null}

        <ActiveRoomPanel
          inviteLink={inviteLink}
          isLeaving={isLeaveRoomLoading}
          onBackToLobby={onLeaveRoom}
          profile={profile}
          room={room}
        />
        <MatchStatusPanel room={room} />

        {canStartGame ? (
          <Button
            className={classes.primaryAction}
            loading={isGameActionLoading}
            onClick={onStartGame}
          >
            Start game
          </Button>
        ) : null}
      </Stack>
    </StatusShell>
  );
}
