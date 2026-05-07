import { Alert, Button, Group, Stack } from '@mantine/core';

import { StatusShell } from '../layout';
import { GameBoardPreview } from './game-board-preview';
import type { Game, Move } from '../../types/games';
import type { Profile } from '../../types/profile';
import type { Room } from '../../types/rooms';
import classes from '../../App.module.css';

type GameScreenProps = {
  game: Game | null;
  isGameActionLoading: boolean;
  isLeaveRoomLoading: boolean;
  isMoveActionLoading: boolean;
  moves: Move[];
  onCellClick: (cellIndex: number) => void;
  onLeaveRoom: () => void;
  onRoomDetails: () => void;
  onStartGame: () => void;
  profile: Profile | null;
  room: Room;
  roomError: string | null;
  roomNotice: string | null;
};

export function GameScreen({
  game,
  isGameActionLoading,
  isLeaveRoomLoading,
  isMoveActionLoading,
  moves,
  onCellClick,
  onLeaveRoom,
  onRoomDetails,
  onStartGame,
  profile,
  room,
  roomError,
  roomNotice,
}: GameScreenProps) {
  return (
    <StatusShell
      eyebrow={`Room ${room.code}`}
      lead="The board is live. Keep your eyes on the grid and wait for the arena signal."
      title="Arena"
    >
      <Stack gap="lg">
        {roomError ? (
          <Alert color="red" radius="md" title="Move needs attention">
            {roomError}
          </Alert>
        ) : null}

        {roomNotice ? (
          <Alert color="blue" radius="md" title="Room updated">
            {roomNotice}
          </Alert>
        ) : null}

        <GameBoardPreview
          game={game}
          isLoading={isGameActionLoading}
          isMoveLoading={isMoveActionLoading}
          moves={moves}
          onCellClick={onCellClick}
          onStartGame={onStartGame}
          profile={profile}
          room={room}
        />

        <Group className={classes.roomActions}>
          <Button
            className={classes.responsiveAction}
            onClick={onRoomDetails}
            variant="light"
          >
            Room details
          </Button>
          <Button
            className={classes.responsiveAction}
            loading={isLeaveRoomLoading}
            onClick={onLeaveRoom}
            variant="subtle"
          >
            Leave room
          </Button>
        </Group>
      </Stack>
    </StatusShell>
  );
}
