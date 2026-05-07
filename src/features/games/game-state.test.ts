import { describe, expect, it } from 'vitest';

import { getBoard, getGameViewState, getNextMark } from './game-state';
import type { Game, Move } from '../../types/games';

const X_PLAYER_ID = 'x-player';
const O_PLAYER_ID = 'o-player';

const activeGame: Game = {
  id: 'game-id',
  o_player_id: O_PLAYER_ID,
  room_id: 'room-id',
  status: 'in_progress',
  winner_id: null,
  x_player_id: X_PLAYER_ID,
};

function createMove(overrides: Partial<Move>): Move {
  return {
    cell_index: 0,
    game_id: activeGame.id,
    id: crypto.randomUUID(),
    mark: 'x',
    move_number: 1,
    player_id: X_PLAYER_ID,
    ...overrides,
  };
}

describe('game-state', () => {
  it('derives board cells from persisted moves', () => {
    const board = getBoard([
      createMove({ cell_index: 0, mark: 'x' }),
      createMove({
        cell_index: 4,
        mark: 'o',
        move_number: 2,
        player_id: O_PLAYER_ID,
      }),
    ]);

    expect(board.get(0)).toBe('x');
    expect(board.get(4)).toBe('o');
    expect(board.has(8)).toBe(false);
  });

  it('alternates the next mark from move count', () => {
    expect(getNextMark([])).toBe('x');
    expect(getNextMark([createMove({})])).toBe('o');
  });

  it('marks the current player turn while the game is active', () => {
    const viewState = getGameViewState({
      game: activeGame,
      moves: [],
      profileId: X_PLAYER_ID,
    });

    expect(viewState.isGameFinished).toBe(false);
    expect(viewState.isPlayerTurn).toBe(true);
    expect(viewState.result).toBeNull();
    expect(viewState.statusMessage).toBe('Your turn. Place X.');
  });

  it('shows winner feedback for the winning player', () => {
    const viewState = getGameViewState({
      game: {
        ...activeGame,
        status: 'x_won',
        winner_id: X_PLAYER_ID,
      },
      moves: [],
      profileId: X_PLAYER_ID,
    });

    expect(viewState.isGameFinished).toBe(true);
    expect(viewState.isPlayerTurn).toBe(false);
    expect(viewState.result).toBe('win');
    expect(viewState.statusMessage).toBe(
      'Round complete. X won. You won this round.',
    );
  });

  it('shows loss feedback for the losing player', () => {
    const viewState = getGameViewState({
      game: {
        ...activeGame,
        status: 'x_won',
        winner_id: X_PLAYER_ID,
      },
      moves: [],
      profileId: O_PLAYER_ID,
    });

    expect(viewState.result).toBe('loss');
    expect(viewState.statusMessage).toBe(
      'Round complete. X won. Your opponent won this round.',
    );
  });

  it('shows draw feedback when no player won', () => {
    const viewState = getGameViewState({
      game: {
        ...activeGame,
        status: 'draw',
      },
      moves: [],
      profileId: X_PLAYER_ID,
    });

    expect(viewState.isGameFinished).toBe(true);
    expect(viewState.result).toBe('draw');
    expect(viewState.statusMessage).toBe('Round complete. It is a draw.');
  });
});
