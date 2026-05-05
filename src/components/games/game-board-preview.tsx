import { Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core'

import type { Game, Move } from '../../types/games'
import type { Profile } from '../../types/profile'
import type { Room } from '../../types/rooms'
import { getGameViewState } from '../../features/games/game-state'
import classes from '../../App.module.css'

type GameBoardPreviewProps = {
  game: Game | null
  isLoading: boolean
  moves: Move[]
  onCellClick: (cellIndex: number) => void
  onStartGame: () => void
  profile: Profile | null
  room: Room
}

const CELLS = Array.from({ length: 9 }, (_, index) => index)

export function GameBoardPreview({
  game,
  isLoading,
  moves,
  onCellClick,
  onStartGame,
  profile,
  room,
}: GameBoardPreviewProps) {
  if (room.status !== 'ready') {
    return null
  }

  const isHost = profile?.id === room.host_id
  const { board, isGameFinished, isPlayerTurn, statusMessage } =
    getGameViewState({
      game,
      moves,
      profileId: profile?.id ?? null,
    })

  return (
    <Paper className={classes.roomCard} p="md" radius="md">
      <Stack gap="md">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Game board
        </Text>
        <SimpleGrid className={classes.boardGrid} cols={3} spacing="xs">
          {CELLS.map((cell) => (
            <button
              className={classes.boardCell}
              disabled={!game || isGameFinished || board.has(cell) || !isPlayerTurn}
              key={cell}
              onClick={() => onCellClick(cell)}
              type="button"
            >
              {board.get(cell)?.toUpperCase() ?? ''}
            </button>
          ))}
        </SimpleGrid>
        {game ? (
          <Stack gap="sm" align="flex-start">
            <Text className={classes.statusValue}>{statusMessage}</Text>
            {isGameFinished && profile && isHost ? (
              <Button loading={isLoading} onClick={onStartGame}>
                Start next game
              </Button>
            ) : null}
          </Stack>
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
