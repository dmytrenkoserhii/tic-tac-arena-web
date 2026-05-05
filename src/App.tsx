import { useClipboard } from '@mantine/hooks'
import { useEffect, useState } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import {
  createGame,
  createMove,
  getCurrentRoomGame,
  getGame,
  getMoves,
} from './features/games/game-api'
import { useGameRealtime } from './features/games/use-game-realtime'
import { useMovesRealtime } from './features/games/use-moves-realtime'
import {
  createRoom,
  getRoomByCode,
  joinRoom,
  leaveRoom,
  normalizeRoomCode,
} from './features/rooms/room-api'
import { useRoomRealtime } from './features/rooms/use-room-realtime'
import { SignInScreen } from './components/auth'
import { StatusShell } from './components/layout'
import { LobbyScreen } from './components/rooms'
import type { Game, Move } from './types/games'
import type { Room } from './types/rooms'

const ACTIVE_ROOM_CODE_STORAGE_KEY = 'tic-tac-arena:active-room-code'

type InitialRoomCode = {
  code: string
  source: 'storage' | 'url'
}

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
  const [roomNotice, setRoomNotice] = useState<string | null>(null)
  const [isRoomActionLoading, setIsRoomActionLoading] = useState(false)
  const clipboard = useClipboard({ timeout: 1600 })

  const inviteLink = activeRoom
    ? `${window.location.origin}?room=${activeRoom.code}`
    : null

  useRoomRealtime({
    onRoomChange: handleRoomChange,
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
    setRoomNotice(null)
    setIsRoomActionLoading(true)

    const { data, error } = await createRoom({ hostId: profile.id })

    if (error) {
      setRoomError(error.message)
    } else if (!data) {
      setRoomError('Room was not created. Try again.')
    } else {
      setActiveRoom(data)
      persistActiveRoomCode(data.code)
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
    setRoomNotice(null)
    setIsRoomActionLoading(true)

    const { data, error } = await joinRoom({
      code: normalizedCode,
      guestId: profile.id,
    })

    if (error) {
      setRoomError(error.message)
    } else {
      setActiveRoom(data)
      persistActiveRoomCode(data.code)
      setJoinCode('')
      await handleHydrateGame(data)
    }

    setIsRoomActionLoading(false)
  }

  async function handleLeaveRoom() {
    if (!activeRoom) {
      return
    }

    setRoomError(null)
    setRoomNotice(null)
    setIsRoomActionLoading(true)

    const { error } = await leaveRoom({ roomId: activeRoom.id })

    if (error) {
      setRoomError(error.message)
    } else {
      clearActiveRoomState()
    }

    setIsRoomActionLoading(false)
  }

  function clearActiveRoomState() {
    setActiveRoom(null)
    setActiveGame(null)
    setMoves([])
    persistActiveRoomCode(null)
    removeRoomCodeFromUrl()
  }

  function handleRoomChange(room: Room) {
    if (room.status === 'closed') {
      clearActiveRoomState()
      setRoomNotice('The room was closed because a player left the match.')
      return
    }

    setActiveRoom(room)

    if (room.status !== 'ready') {
      setActiveGame(null)
      setMoves([])
    }
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
    setRoomNotice(null)
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

    const { data, error } = await getCurrentRoomGame(room.id)

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

  useEffect(() => {
    if (!profile || activeRoom) {
      return
    }

    const initialRoomCode = getInitialRoomCode()

    if (!initialRoomCode) {
      return
    }

    let isActive = true

    void getRoomByCode({ code: initialRoomCode.code }).then(async ({ data, error }) => {
      if (!isActive) {
        return
      }

      if (error) {
        setRoomError(error.message)
      } else if (data) {
        const isRoomPlayer =
          profile.id === data.host_id || profile.id === data.guest_id

        if (isRoomPlayer) {
          setActiveRoom(data)
          persistActiveRoomCode(data.code)
          await handleHydrateGame(data)
        } else if (
          initialRoomCode.source === 'url' &&
          data.status === 'waiting'
        ) {
          const joinResult = await joinRoom({
            code: data.code,
            guestId: profile.id,
          })

          if (joinResult.error) {
            setRoomError(joinResult.error.message)
          } else {
            setActiveRoom(joinResult.data)
            persistActiveRoomCode(joinResult.data.code)
            await handleHydrateGame(joinResult.data)
          }
        } else {
          setRoomError('This room is not available for your account.')
          persistActiveRoomCode(null)
        }
      } else {
        persistActiveRoomCode(null)
      }
    })

    return () => {
      isActive = false
    }
  }, [activeRoom, profile])

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
    setRoomNotice(null)

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
      onBackToLobby={handleLeaveRoom}
      onCellClick={handleCreateMove}
      onCreateRoom={handleCreateRoom}
      onJoinCodeChange={(value) => setJoinCode(normalizeRoomCode(value))}
      onJoinRoom={handleJoinRoom}
      onSignOut={handleSignOut}
      onStartGame={handleStartGame}
      profile={profile}
      profileError={profileError}
      roomError={roomError}
      roomNotice={roomNotice}
      userEmail={user.email ?? null}
    />
  )
}

function getInitialRoomCode(): InitialRoomCode | null {
  const urlRoomCode = new URLSearchParams(window.location.search).get('room')

  if (urlRoomCode) {
    return {
      code: normalizeRoomCode(urlRoomCode),
      source: 'url',
    }
  }

  const storedRoomCode = localStorage.getItem(ACTIVE_ROOM_CODE_STORAGE_KEY)

  if (!storedRoomCode) {
    return null
  }

  return {
    code: storedRoomCode,
    source: 'storage',
  }
}

function persistActiveRoomCode(code: string | null) {
  if (code) {
    localStorage.setItem(ACTIVE_ROOM_CODE_STORAGE_KEY, code)
  } else {
    localStorage.removeItem(ACTIVE_ROOM_CODE_STORAGE_KEY)
  }
}

function removeRoomCodeFromUrl() {
  const url = new URL(window.location.href)

  if (!url.searchParams.has('room')) {
    return
  }

  url.searchParams.delete('room')
  window.history.replaceState({}, '', url)
}

export default App
