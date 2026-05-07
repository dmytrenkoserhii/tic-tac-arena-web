import type { Game, Move } from '../../types/games';

export type GameMark = 'x' | 'o';
export type RoundResult = 'draw' | 'loss' | 'win';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

type GetGameStatusMessageInput = {
  game: Game | null;
  isPlayerTurn: boolean;
  nextMark: GameMark;
  playerMark: GameMark;
  profileId: string | null;
};

type GetGameViewStateInput = {
  game: Game | null;
  moves: Move[];
  profileId: string | null;
};

export function getBoard(moves: Move[]) {
  return new Map(moves.map((move) => [move.cell_index, move.mark]));
}

export function getNextMark(moves: Move[]): GameMark {
  return moves.length % 2 === 0 ? 'x' : 'o';
}

export function getPlayerMark({
  game,
  profileId,
}: Pick<GetGameViewStateInput, 'game' | 'profileId'>): GameMark {
  return profileId === game?.x_player_id ? 'x' : 'o';
}

export function getGameViewState({
  game,
  moves,
  profileId,
}: GetGameViewStateInput) {
  const board = getBoard(moves);
  const isGameFinished = Boolean(game && game.status !== 'in_progress');
  const nextMark = getNextMark(moves);
  const playerMark = getPlayerMark({ game, profileId });
  const isPlayerTurn = Boolean(
    game && profileId && !isGameFinished && playerMark === nextMark,
  );
  const statusMessage = getGameStatusMessage({
    game,
    isPlayerTurn,
    nextMark,
    playerMark,
    profileId,
  });

  return {
    board,
    isGameFinished,
    isPlayerTurn,
    nextMark,
    playerMark,
    result: getRoundResult({ game, profileId }),
    statusMessage,
    winningCells: getWinningCells(board),
  };
}

export function getRoundResult({
  game,
  profileId,
}: Pick<GetGameViewStateInput, 'game' | 'profileId'>): RoundResult | null {
  if (!game || game.status === 'in_progress') {
    return null;
  }

  if (game.status === 'draw') {
    return 'draw';
  }

  return game.winner_id === profileId ? 'win' : 'loss';
}

export function getWinningCells(board: Map<number, GameMark>) {
  const winningLine = WINNING_LINES.find(
    ([firstCell, secondCell, thirdCell]) => {
      const firstMark = board.get(firstCell);

      return (
        firstMark &&
        firstMark === board.get(secondCell) &&
        firstMark === board.get(thirdCell)
      );
    },
  );

  return winningLine ? new Set<number>(winningLine) : new Set<number>();
}

export function getGameStatusMessage({
  game,
  isPlayerTurn,
  nextMark,
  playerMark,
  profileId,
}: GetGameStatusMessageInput) {
  if (!game) {
    return '';
  }

  if (game.status === 'draw') {
    return 'Round complete. It is a draw.';
  }

  if (game.status === 'x_won' || game.status === 'o_won') {
    const winningMark = game.status === 'x_won' ? 'X' : 'O';
    const result =
      game.winner_id === profileId
        ? 'You won this round.'
        : 'Your opponent won this round.';

    return `Round complete. ${winningMark} won. ${result}`;
  }

  return isPlayerTurn
    ? `Your turn. Place ${playerMark.toUpperCase()}.`
    : `Waiting for ${nextMark.toUpperCase()} to move.`;
}
