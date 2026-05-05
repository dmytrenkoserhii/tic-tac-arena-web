import { Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core'

import type { Game } from '../../types/games'
import type { Profile } from '../../types/profile'
import type { Room } from '../../types/rooms'
import classes from '../../App.module.css'

type GameBoardPreviewProps = {
  game: Game | null
  isLoading: boolean
  onStartGame: () => void
  profile: Profile | null
  room: Room
}

const CELLS = Array.from({ length: 9 }, (_, index) => index)

export function GameBoardPreview({
  game,
  isLoading,
  onStartGame,
  profile,
  room,
}: GameBoardPreviewProps) {
  if (room.status !== 'ready') {
    return null
  }

  const isHost = profile?.id === room.host_id

  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="md">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Game board
        </Text>
        <SimpleGrid className={classes.boardGrid} cols={3} spacing="xs">
          {CELLS.map((cell) => (
            <button className={classes.boardCell} key={cell} type="button">
              {game ? '' : '-'}
            </button>
          ))}
        </SimpleGrid>
        {game ? (
          <Text className={classes.statusValue}>
            Game started. X moves first.
          </Text>
        ) : (
          <Stack gap="sm" align="flex-start">
            <Text className={classes.statusValue}>
              {profile && isHost
                ? 'Start the first game when both players are ready.'
                : 'Waiting for the host to start the game.'}
            </Text>
            {profile && isHost ? (
              <Button loading={isLoading} onClick={onStartGame}>
                Start game
              </Button>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
