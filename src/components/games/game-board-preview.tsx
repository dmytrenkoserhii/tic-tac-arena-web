import { Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core'

import type { Game, Move } from '../../types/games'
import type { Profile } from '../../types/profile'
import type { Room } from '../../types/rooms'
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
  const board = new Map(moves.map((move) => [move.cell_index, move.mark]))
  const nextMark = moves.length % 2 === 0 ? 'x' : 'o'
  const playerMark = profile?.id === game?.x_player_id ? 'x' : 'o'
  const isPlayerTurn = Boolean(game && profile && playerMark === nextMark)

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
              disabled={!game || board.has(cell) || !isPlayerTurn}
              key={cell}
              onClick={() => onCellClick(cell)}
              type="button"
            >
              {board.get(cell)?.toUpperCase() ?? ''}
            </button>
          ))}
        </SimpleGrid>
        {game ? (
          <Text className={classes.statusValue}>
            {isPlayerTurn
              ? `Your turn. Place ${playerMark.toUpperCase()}.`
              : `${nextMark.toUpperCase()} moves next.`}
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
