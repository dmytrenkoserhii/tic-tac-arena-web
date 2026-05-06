import { Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core'
import type { FormEvent } from 'react'

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
  const isJoinDisabled = isDisabled || joinCode.length !== 6

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isJoinDisabled) {
      onJoin()
    }
  }

  return (
    <Paper
      className={classes.roomCard}
      component="form"
      onSubmit={handleSubmit}
      p="md"
      radius="md"
    >
      <Stack gap="md">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Join room
        </Text>
        <Group align="flex-end" className={classes.joinRoomActions}>
          <TextInput
            className={classes.roomInput}
            label="Room code"
            maxLength={6}
            onChange={(event) => onJoinCodeChange(event.currentTarget.value)}
            placeholder="ABC123"
            value={joinCode}
          />
          <Button
            className={classes.responsiveAction}
            disabled={isJoinDisabled}
            loading={isLoading}
            type="submit"
          >
            Join room
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
