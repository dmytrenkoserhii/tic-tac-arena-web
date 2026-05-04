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
  Title,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useState, type ReactNode } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import { createRoom, type Room } from './features/rooms/room-api'
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
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [isRoomActionLoading, setIsRoomActionLoading] = useState(false)
  const clipboard = useClipboard({ timeout: 1600 })

  const inviteLink = createdRoom
    ? `${window.location.origin}?room=${createdRoom.code}`
    : null

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
      setCreatedRoom(data)
    }

    setIsRoomActionLoading(false)
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
      lead="Create a private room and send the invite code to your opponent."
      title={`Welcome back${profile?.display_name ? `, ${profile.display_name}` : ''}`}
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

        {createdRoom ? (
          <Paper className={classes.roomCard} p="md" radius="md">
            <Stack gap="sm">
              <Text className={classes.statusLabel} size="xs" tt="uppercase">
                Room code
              </Text>
              <Code className={classes.roomCode}>{createdRoom.code}</Code>
              {inviteLink ? (
                <Text className={classes.statusValue}>{inviteLink}</Text>
              ) : null}
              <Group>
                <Button
                  onClick={() => clipboard.copy(createdRoom.code)}
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
              </Group>
            </Stack>
          </Paper>
        ) : null}

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
      </Stack>
    </StatusShell>
  )
}

export default App
