import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useState, type ReactNode } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import {
  createRoom,
  joinRoom,
  normalizeRoomCode,
  type Room,
} from './features/rooms/room-api'
import classes from './App.module.css'

type StatusItemProps = {
  label: string
  value: string
}

function StatusItem({ label, value }: StatusItemProps) {
  return (
    <Paper className={classes.statusItem} p="md" radius="md">
      <Text className={classes.statusLabel} size="xs" tt="uppercase">
        {label}
      </Text>
      <Text className={classes.statusValue}>{value}</Text>
    </Paper>
  )
}

function StatusShell({
  children,
  eyebrow,
  lead,
  title,
}: {
  children?: ReactNode
  eyebrow: string
  lead: string
  title: string
}) {
  return (
    <Box component="main" className={classes.appShell}>
      <Container size="md">
        <Paper className={classes.statusCard} p="xl" radius="lg">
          <Stack gap="lg">
            <Stack gap="md">
              <Badge className={classes.eyebrow} variant="light" size="lg">
                {eyebrow}
              </Badge>
              <Title className={classes.statusTitle} order={1}>
                {title}
              </Title>
              <Text className={classes.lead} size="lg">
                {lead}
              </Text>
            </Stack>
            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

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
  const playerRole =
    activeRoom && profile?.id === activeRoom.host_id ? 'Host' : 'Guest'

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
      <StatusShell
        eyebrow="Tic Tac Arena"
        lead="Sign in to create a room, invite a friend, and play the first match."
        title="Enter the arena"
      >
        <Stack gap="md" align="flex-start">
          {authError ? (
            <Alert color="red" radius="md" title="Sign-in failed">
              {authError}
            </Alert>
          ) : null}

          <Button
            className={classes.primaryAction}
            loading={isAuthActionLoading}
            onClick={handleGoogleSignIn}
            size="lg"
          >
            Continue with Google
          </Button>
        </Stack>
      </StatusShell>
    )
  }

  return (
    <StatusShell
      eyebrow="Tic Tac Arena"
      lead={
        activeRoom
          ? 'You are in a private room. The board comes next.'
          : 'Create a private room or join one with an invite code.'
      }
      title={
        activeRoom
          ? `Room ${activeRoom.code}`
          : `Welcome back${profile?.display_name ? `, ${profile.display_name}` : ''}`
      }
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <StatusItem
            label="Signed in as"
            value={profile?.email ?? user.email ?? 'Authenticated player'}
          />
          <StatusItem
            label="Profile"
            value={profile ? 'Synced from Supabase' : 'Waiting for profile row'}
          />
        </SimpleGrid>

        {profileError ? (
          <Alert color="yellow" radius="md" title="Profile not loaded yet">
            {profileError}
          </Alert>
        ) : null}

        {authError ? (
          <Alert color="red" radius="md" title="Sign-out failed">
            {authError}
          </Alert>
        ) : null}

        {roomError ? (
          <Alert color="red" radius="md" title="Room action failed">
            {roomError}
          </Alert>
        ) : null}

        {activeRoom ? (
          <Paper className={classes.roomCard} p="md" radius="md">
            <Stack gap="sm">
              <Text className={classes.statusLabel} size="xs" tt="uppercase">
                Active room
              </Text>
              <Code className={classes.roomCode}>{activeRoom.code}</Code>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <StatusItem label="Your role" value={playerRole} />
                <StatusItem label="Room status" value={activeRoom.status} />
              </SimpleGrid>
              {inviteLink ? (
                <Text className={classes.statusValue}>{inviteLink}</Text>
              ) : null}
              <Group>
                <Button
                  onClick={() => clipboard.copy(activeRoom.code)}
                  variant="light"
                >
                  {clipboard.copied ? 'Copied' : 'Copy code'}
                </Button>
                {inviteLink ? (
                  <Button
                    onClick={() => clipboard.copy(inviteLink)}
                    variant="subtle"
                  >
                    Copy link
                  </Button>
                ) : null}
                <Button onClick={handleLeaveLocalRoom} variant="subtle">
                  Back to lobby
                </Button>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper className={classes.roomCard} p="md" radius="md">
              <Stack gap="md">
                <Text className={classes.statusLabel} size="xs" tt="uppercase">
                  Join room
                </Text>
                <Group align="flex-end">
                  <TextInput
                    className={classes.roomInput}
                    label="Room code"
                    maxLength={6}
                    onChange={(event) =>
                      setJoinCode(normalizeRoomCode(event.currentTarget.value))
                    }
                    placeholder="ABC123"
                    value={joinCode}
                  />
                  <Button
                    disabled={!profile}
                    loading={isRoomActionLoading}
                    onClick={handleJoinRoom}
                  >
                    Join room
                  </Button>
                </Group>
              </Stack>
            </Paper>

            <Group>
              <Button
                className={classes.primaryAction}
                disabled={!profile}
                loading={isRoomActionLoading}
                onClick={handleCreateRoom}
              >
                Create room
              </Button>
              <Button
                className={classes.primaryAction}
                loading={isAuthActionLoading}
                onClick={handleSignOut}
                variant="light"
              >
                Sign out
              </Button>
            </Group>
          </>
        )}

        {activeRoom ? (
          <Paper className={classes.roomCard} p="md" radius="md">
            <Stack gap="sm">
              <Text className={classes.statusLabel} size="xs" tt="uppercase">
                Match status
              </Text>
              <Text className={classes.statusValue}>
                {activeRoom.status === 'ready'
                  ? 'Both players are in. The game board is the next step.'
                  : 'Waiting for player two to join.'}
              </Text>
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </StatusShell>
  )
}

export default App
