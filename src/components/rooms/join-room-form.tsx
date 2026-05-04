import { Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core'

import classes from '../../App.module.css'

type JoinRoomFormProps = {
  isDisabled: boolean
  isLoading: boolean
  joinCode: string
  onJoin: () => void
  onJoinCodeChange: (value: string) => void
}

export function JoinRoomForm({
  isDisabled,
  isLoading,
  joinCode,
  onJoin,
  onJoinCodeChange,
}: JoinRoomFormProps) {
  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="md">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Join room
        </Text>
        <Group align="flex-end">
          <TextInput
            className={classes.roomInput}
            label="Room code"
            maxLength={6}
            onChange={(event) => onJoinCodeChange(event.currentTarget.value)}
            placeholder="ABC123"
            value={joinCode}
          />
          <Button disabled={isDisabled} loading={isLoading} onClick={onJoin}>
            Join room
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
