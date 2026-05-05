import { Button, Code, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'

import { StatusItem } from '../ui'
import type { Profile } from '../../types/profile'
import type { Room } from '../../types/rooms'
import type { Clipboard } from '../../types/shared'
import classes from '../../App.module.css'

type ActiveRoomPanelProps = {
  clipboard: Clipboard
  inviteLink: string | null
  isLeaving: boolean
  onBackToLobby: () => void
  profile: Profile | null
  room: Room
}

export function ActiveRoomPanel({
  clipboard,
  inviteLink,
  isLeaving,
  onBackToLobby,
  profile,
  room,
}: ActiveRoomPanelProps) {
  const playerRole = profile?.id === room.host_id ? 'Host' : 'Guest'

  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="sm">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Active room
        </Text>
        <Code className={classes.roomCode}>{room.code}</Code>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <StatusItem label="Your role" value={playerRole} />
          <StatusItem label="Room status" value={room.status} />
        </SimpleGrid>
        {inviteLink ? (
          <Text className={classes.statusValue}>{inviteLink}</Text>
        ) : null}
        <Group>
          <Button onClick={() => clipboard.copy(room.code)} variant="light">
            {clipboard.copied ? 'Copied' : 'Copy code'}
          </Button>
          {inviteLink ? (
            <Button onClick={() => clipboard.copy(inviteLink)} variant="subtle">
              Copy link
            </Button>
          ) : null}
          <Button loading={isLeaving} onClick={onBackToLobby} variant="subtle">
            Leave room
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
