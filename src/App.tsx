import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import {
  createRoom,
  joinRoom,
  normalizeRoomCode,
} from './features/rooms/room-api'
import { useRoomRealtime } from './features/rooms/use-room-realtime'
import { SignInScreen } from './components/auth'
import { StatusShell } from './components/layout'
import { LobbyScreen } from './components/rooms'
import type { Room } from './types/rooms'

function App() {
  const { isLoading, profile, profileError, user } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false)
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
    }

    setIsRoomActionLoading(false)
  }

  function handleLeaveLocalRoom() {
    setActiveRoom(null)
    setRoomError(null)
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
      inviteLink={inviteLink}
      isAuthActionLoading={isAuthActionLoading}
      isRoomActionLoading={isRoomActionLoading}
      joinCode={joinCode}
      onBackToLobby={handleLeaveLocalRoom}
      onCreateRoom={handleCreateRoom}
      onJoinCodeChange={(value) => setJoinCode(normalizeRoomCode(value))}
      onJoinRoom={handleJoinRoom}
      onSignOut={handleSignOut}
      profile={profile}
      profileError={profileError}
      roomError={roomError}
      userEmail={user.email ?? null}
    />
  )
}

export default App
