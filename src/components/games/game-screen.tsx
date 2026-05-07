import {
  Alert,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';

import { StatusShell } from '../layout';
import { StatusItem } from '../ui';
import { GameBoardPreview } from './game-board-preview';
import { getGameViewState } from '../../features/games/game-state';
import type { Game, Move } from '../../types/games';
import type { Profile } from '../../types/profile';
import type { Room } from '../../types/rooms';
import classes from './games.module.css';

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
  const isHost = profile?.id === room.host_id;
  const playerRole = isHost ? 'Host' : 'Guest';
  const playerMark = game
    ? getGameViewState({
        game,
        moves,
        profileId: profile?.id ?? null,
      }).playerMark.toUpperCase()
    : isHost
      ? 'X'
      : 'O';

  return (
    <StatusShell
      eyebrow={`Room ${room.code}`}
      lead="The match has moved into the arena. Watch the turn signal, claim the grid, and keep the room controls close."
      title="Arena"
    >
      <Stack className={classes.gameArena} gap="lg">
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

        <div className={classes.arenaTopBar}>
          <Stack gap={4}>
            <Text className={classes.statusLabel} size="xs" tt="uppercase">
              Live match
            </Text>
            <Group gap="xs">
              <Badge variant="light">Room {room.code}</Badge>
              <Badge
                color={playerMark === 'X' ? 'cyan' : 'yellow'}
                variant="light"
              >
                You are {playerMark}
              </Badge>
            </Group>
          </Stack>
          <SimpleGrid className={classes.arenaStats} cols={{ base: 1, sm: 2 }}>
            <StatusItem label="Your role" value={playerRole} />
            <StatusItem
              label="Round"
              value={game ? game.status.replaceAll('_', ' ') : 'Waiting'}
            />
          </SimpleGrid>
        </div>

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

        <Group className={classes.arenaActions}>
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
