import { Paper, Stack, Text } from '@mantine/core'

import type { Room } from '../../types/rooms'
import classes from '../../App.module.css'

type MatchStatusPanelProps = {
  room: Room
}

export function MatchStatusPanel({ room }: MatchStatusPanelProps) {
  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="sm">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Match status
        </Text>
        <Text className={classes.statusValue}>
          {room.status === 'ready'
            ? 'Both players are in. The game board is the next step.'
            : 'Waiting for player two to join.'}
        </Text>
      </Stack>
    </Paper>
  )
}
