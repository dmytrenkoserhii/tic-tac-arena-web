import { Badge, Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core';

import type { Game, Move } from '../../types/games';
import type { Profile } from '../../types/profile';
import type { Room } from '../../types/rooms';
import { getGameViewState } from '../../features/games/game-state';
import classes from '../../App.module.css';

type GameBoardPreviewProps = {
  game: Game | null;
  isLoading: boolean;
  isMoveLoading: boolean;
  moves: Move[];
  onCellClick: (cellIndex: number) => void;
  onStartGame: () => void;
  profile: Profile | null;
  room: Room;
};

const CELLS = Array.from({ length: 9 }, (_, index) => index);

export function GameBoardPreview({
  game,
  isLoading,
  isMoveLoading,
  moves,
  onCellClick,
  onStartGame,
  profile,
  room,
}: GameBoardPreviewProps) {
  if (room.status !== 'ready') {
    return null;
  }

  const isHost = profile?.id === room.host_id;
  const { board, isGameFinished, isPlayerTurn, result, statusMessage } =
    getGameViewState({
      game,
      moves,
      profileId: profile?.id ?? null,
    });

  return (
    <Paper
      className={classes.arenaBoardCard}
      p={{ base: 'md', sm: 'xl' }}
      radius="lg"
    >
      <Stack gap="lg">
        <Text className={classes.statusLabel} size="xs" tt="uppercase">
          Command grid
        </Text>
        {result ? <RoundResultSignal result={result} /> : null}
        <SimpleGrid className={classes.boardGrid} cols={3} spacing="xs">
          {CELLS.map((cell) => {
            const cellMark = board.get(cell);

            return (
              <button
                aria-label={getCellLabel({ cell, mark: cellMark })}
                className={classes.boardCell}
                data-mark={cellMark}
                disabled={
                  !game ||
                  isGameFinished ||
                  isMoveLoading ||
                  Boolean(cellMark) ||
                  !isPlayerTurn
                }
                key={cell}
                onClick={() => onCellClick(cell)}
                type="button"
              >
                {cellMark?.toUpperCase() ?? ''}
              </button>
            );
          })}
        </SimpleGrid>
        {game ? (
          <Stack className={classes.turnConsole} gap="sm" align="center">
            <Text className={classes.turnSignal}>{statusMessage}</Text>
            {isGameFinished && profile && isHost ? (
              <Button
                className={classes.primaryAction}
                loading={isLoading}
                onClick={onStartGame}
              >
                Start next game
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Stack className={classes.turnConsole} gap="sm" align="center">
            <Text className={classes.turnSignal}>
              {profile && isHost
                ? 'Start the first game when both players are ready.'
                : 'Waiting for the host to start the game.'}
            </Text>
            {profile && isHost ? (
              <Button
                className={classes.primaryAction}
                loading={isLoading}
                onClick={onStartGame}
              >
                Start game
              </Button>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

type RoundResultSignalProps = {
  result: 'draw' | 'loss' | 'win';
};

function RoundResultSignal({ result }: RoundResultSignalProps) {
  const resultCopy = {
    draw: {
      label: 'Draw',
      message: 'The arena is locked. Nobody owns the grid.',
    },
    loss: {
      label: 'Defeat',
      message: 'Your opponent claimed this round.',
    },
    win: {
      label: 'Victory',
      message: 'You controlled the grid.',
    },
  }[result];

  return (
    <div className={classes.resultSignal} data-result={result}>
      <Badge className={classes.resultBadge} variant="light">
        Round complete
      </Badge>
      <Text className={classes.resultTitle}>{resultCopy.label}</Text>
      <Text className={classes.resultMessage}>{resultCopy.message}</Text>
    </div>
  );
}

type GetCellLabelInput = {
  cell: number;
  mark?: string;
};

function getCellLabel({ cell, mark }: GetCellLabelInput) {
  const cellNumber = cell + 1;

  if (mark) {
    return `Cell ${cellNumber}, occupied by ${mark.toUpperCase()}`;
  }

  return `Cell ${cellNumber}, empty`;
}
