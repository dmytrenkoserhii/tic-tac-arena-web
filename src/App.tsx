import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import {
  createGame,
  createMove,
  getActiveGame,
  getGame,
  getMoves,
} from './features/games/game-api'
import { useGameRealtime } from './features/games/use-game-realtime'
import { useMovesRealtime } from './features/games/use-moves-realtime'
import {
  createRoom,
  joinRoom,
  normalizeRoomCode,
} from './features/rooms/room-api'
import { useRoomRealtime } from './features/rooms/use-room-realtime'
import { SignInScreen } from './components/auth'
import { StatusShell } from './components/layout'
import { LobbyScreen } from './components/rooms'
import type { Game, Move } from './types/games'
import type { Room } from './types/rooms'

function App() {
  const { isLoading, profile, profileError, user } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false)
  const [isGameActionLoading, setIsGameActionLoading] = useState(false)
  const [moves, setMoves] = useState<Move[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [roomError, setRoomError] = useState<string | null>(null)
  const [isRoomActionLoading, setIsRoomActionLoading] = useState(false)
  const clipboard = useClipboard({ timeout: 1600 })

  const inviteLink = activeRoom
    ? `${window.location.origin}?room=${activeRoom.code}`
    : null

  useRoomRealtime({
    onRoomChange: setActiveRoom,
    room: activeRoom,
  })

  useGameRealtime({
    onGameChange: handleGameChange,
    room: activeRoom,
  })

  useMovesRealtime({
    game: activeGame,
    onMoveCreate: handleMoveCreate,
  })

  async function handleGoogleSignIn() {
    setAuthError(null)
    setIsAuthActionLoading(true)

    const { error } = await signInWithGoogle()

    if (error) {
      setAuthError(error.message)
      setIsAuthActionLoading(false)
    }
  }

  async function handleSignOut() {
    setAuthError(null)
    setIsAuthActionLoading(true)

    const { error } = await signOut()

    if (error) {
      setAuthError(error.message)
    }

    setIsAuthActionLoading(false)
  }

  async function handleCreateRoom() {
    if (!profile) {
      setRoomError('Profile is not ready yet. Refresh the page and try again.')
      return
    }

    setRoomError(null)
    setIsRoomActionLoading(true)

    const { data, error } = await createRoom({ hostId: profile.id })

    if (error) {
      setRoomError(error.message)
    } else {
      setActiveRoom(data)
    }

    setIsRoomActionLoading(false)
  }

  async function handleJoinRoom() {
    if (!profile) {
      setRoomError('Profile is not ready yet. Refresh the page and try again.')
      return
    }

    const normalizedCode = normalizeRoomCode(joinCode)

    if (normalizedCode.length !== 6) {
      setRoomError('Enter a 6-character room code.')
      return
    }

    setRoomError(null)
    setIsRoomActionLoading(true)

    const { data, error } = await joinRoom({
      code: normalizedCode,
      guestId: profile.id,
    })

    if (error) {
      setRoomError(error.message)
    } else {
      setActiveRoom(data)
      setJoinCode('')
      await handleHydrateGame(data)
    }

    setIsRoomActionLoading(false)
  }

  function handleLeaveLocalRoom() {
    setActiveRoom(null)
    setActiveGame(null)
    setMoves([])
    setRoomError(null)
  }

  function handleGameChange(game: Game) {
    setActiveGame((currentGame) => {
      if (currentGame?.id !== game.id) {
        setMoves([])
      }

      return game
    })
  }

  async function handleStartGame() {
    if (!activeRoom) {
      return
    }

    setRoomError(null)
    setIsGameActionLoading(true)

    const { data, error } = await createGame({ room: activeRoom })

    if (error) {
      setRoomError(error.message)
    } else {
      setActiveGame(data)
      setMoves([])
    }

    setIsGameActionLoading(false)
  }

  async function handleHydrateGame(room: Room) {
    if (room.status !== 'ready') {
      setActiveGame(null)
      return
    }

    const { data, error } = await getActiveGame(room.id)

    if (error) {
      setRoomError(error.message)
    } else {
      setActiveGame(data)
      if (data) {
        await handleHydrateMoves(data.id)
      } else {
        setMoves([])
      }
    }
  }

  async function handleHydrateMoves(gameId: string) {
    const { data, error } = await getMoves(gameId)

    if (error) {
      setRoomError(error.message)
    } else {
      setMoves(data ?? [])
    }
  }

  function handleMoveCreate(move: Move) {
    setMoves((currentMoves) => {
      if (currentMoves.some((currentMove) => currentMove.id === move.id)) {
        return currentMoves
      }

      return [...currentMoves, move].sort(
        (firstMove, secondMove) => firstMove.move_number - secondMove.move_number,
      )
    })
  }

  async function handleCreateMove(cellIndex: number) {
    if (!activeGame || !profile) {
      return
    }

    setRoomError(null)

    const { data, error } = await createMove({
      cellIndex,
      gameId: activeGame.id,
    })

    if (error) {
      setRoomError(error.message)
    } else {
      handleMoveCreate(data)
      await handleHydrateCurrentGame(activeGame.id)
    }
  }

  async function handleHydrateCurrentGame(gameId: string) {
    const { data, error } = await getGame(gameId)

    if (error) {
      setRoomError(error.message)
    } else {
      handleGameChange(data)
    }
  }

  if (isLoading) {
    return (
      <StatusShell
        eyebrow="Tic Tac Arena"
        lead="The app is checking whether a Supabase session already exists in this browser."
        title="Loading session"
      />
    )
  }

  if (!user) {
    return (
      <SignInScreen
        authError={authError}
        isAuthActionLoading={isAuthActionLoading}
        onGoogleSignIn={handleGoogleSignIn}
      />
    )
  }

  return (
    <LobbyScreen
      activeRoom={activeRoom}
      authError={authError}
      clipboard={clipboard}
      game={activeGame}
      inviteLink={inviteLink}
      isAuthActionLoading={isAuthActionLoading}
      isGameActionLoading={isGameActionLoading}
      isRoomActionLoading={isRoomActionLoading}
      joinCode={joinCode}
      moves={moves}
      onBackToLobby={handleLeaveLocalRoom}
      onCellClick={handleCreateMove}
      onCreateRoom={handleCreateRoom}
      onJoinCodeChange={(value) => setJoinCode(normalizeRoomCode(value))}
      onJoinRoom={handleJoinRoom}
      onSignOut={handleSignOut}
      onStartGame={handleStartGame}
      profile={profile}
      profileError={profileError}
      roomError={roomError}
      userEmail={user.email ?? null}
    />
  )
}

export default App
