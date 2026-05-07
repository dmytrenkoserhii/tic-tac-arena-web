import {
  Alert,
  Badge,
  Button,
  Code,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { StatusShell } from '../layout';
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
  const codeClipboard = useClipboard({ timeout: 1600 });
  const linkClipboard = useClipboard({ timeout: 1600 });
  const isHost = profile?.id === room.host_id;
  const canStartGame = isHost && room.status === 'ready';
  const guestLabel = room.guest_id ? 'Guest connected' : 'Waiting for guest';

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
      <Stack className={classes.roomStage} gap="lg">
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

        <Paper
          className={classes.roomStageHero}
          p={{ base: 'md', sm: 'xl' }}
          radius="lg"
        >
          <Stack gap="lg">
            <Stack gap="xs" align="center">
              <Text className={classes.statusLabel} size="xs" tt="uppercase">
                Invite code
              </Text>
              <Code className={classes.stageRoomCode}>{room.code}</Code>
              {inviteLink ? (
                <Text className={classes.stageInviteLink}>{inviteLink}</Text>
              ) : null}
            </Stack>

            <Group className={classes.roomActions} justify="center">
              <Button
                className={classes.responsiveAction}
                onClick={() => codeClipboard.copy(room.code)}
                variant="light"
              >
                {codeClipboard.copied ? 'Code copied' : 'Copy code'}
              </Button>
              {inviteLink ? (
                <Button
                  className={classes.responsiveAction}
                  onClick={() => linkClipboard.copy(inviteLink)}
                  variant="subtle"
                >
                  {linkClipboard.copied ? 'Link copied' : 'Copy link'}
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <PlayerSlot
            isYou={isHost}
            label="Host"
            mark="X"
            state="Ready"
            tone="cyan"
          />
          <PlayerSlot
            isYou={!isHost}
            label="Guest"
            mark="O"
            state={guestLabel}
            tone={room.guest_id ? 'yellow' : 'gray'}
          />
        </SimpleGrid>

        <MatchStatusPanel room={room} />

        <Paper className={classes.launchPanel} p="md" radius="lg">
          <Stack gap="md" align="center">
            <Text className={classes.turnSignal}>
              {canStartGame
                ? 'The arena is armed. Launch the round when you are ready.'
                : isHost
                  ? 'Waiting for a guest before the arena can open.'
                  : 'Waiting for the host to launch the round.'}
            </Text>
            <Group className={classes.roomActions} justify="center">
              {canStartGame ? (
                <Button
                  className={classes.primaryAction}
                  loading={isGameActionLoading}
                  onClick={onStartGame}
                >
                  Start game
                </Button>
              ) : null}
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
        </Paper>
      </Stack>
    </StatusShell>
  );
}

type PlayerSlotProps = {
  isYou: boolean;
  label: string;
  mark: 'O' | 'X';
  state: string;
  tone: 'cyan' | 'gray' | 'yellow';
};

function PlayerSlot({ isYou, label, mark, state, tone }: PlayerSlotProps) {
  return (
    <Paper className={classes.playerSlot} data-tone={tone} p="md" radius="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text className={classes.statusLabel} size="xs" tt="uppercase">
            {label}
          </Text>
          <Text className={classes.playerMark}>{mark}</Text>
        </Stack>
        <Stack gap={6} align="flex-end">
          {isYou ? <Badge variant="light">You</Badge> : null}
          <Text className={classes.statusValue}>{state}</Text>
        </Stack>
      </Group>
    </Paper>
  );
}
