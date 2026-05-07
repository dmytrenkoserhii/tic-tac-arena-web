import {
  Button,
  Code,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

import { StatusItem } from '../ui';
import { getRoomStatusLabel } from '../../features/rooms/room-state';
import type { Profile } from '../../types/profile';
import type { Room } from '../../types/rooms';
import classes from '../../App.module.css';

type ActiveRoomPanelProps = {
  inviteLink: string | null;
  isLeaving: boolean;
  onBackToLobby: () => void;
  profile: Profile | null;
  room: Room;
};

export function ActiveRoomPanel({
  inviteLink,
  isLeaving,
  onBackToLobby,
  profile,
  room,
}: ActiveRoomPanelProps) {
  const codeClipboard = useClipboard({ timeout: 1600 });
  const linkClipboard = useClipboard({ timeout: 1600 });
  const playerRole = profile?.id === room.host_id ? 'Host' : 'Guest';

  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="sm">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Active room
        </Text>
        <Code className={classes.roomCode}>{room.code}</Code>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <StatusItem label="Your role" value={playerRole} />
          <StatusItem
            label="Room status"
            value={getRoomStatusLabel(room.status)}
          />
        </SimpleGrid>
        {inviteLink ? (
          <Text className={classes.statusValue}>{inviteLink}</Text>
        ) : null}
        <Group className={classes.roomActions}>
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
          <Button
            className={classes.responsiveAction}
            loading={isLeaving}
            onClick={onBackToLobby}
            variant="subtle"
          >
            Leave room
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
