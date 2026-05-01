import {
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useState, type ReactNode } from 'react'

import { signInWithGoogle, signOut } from './features/auth/auth-actions'
import { useAuth } from './features/auth/use-auth'
import './App.css'

type StatusItemProps = {
  label: string
  value: string
}

function StatusItem({ label, value }: StatusItemProps) {
  return (
    <Paper className="status-item" p="md" radius="md">
      <Text className="status-label" size="xs" tt="uppercase">
        {label}
      </Text>
      <Text className="status-value">{value}</Text>
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
    <Box component="main" className="app-shell">
      <Container size="md">
        <Paper className="status-card" p="xl" radius="lg">
          <Stack gap="lg">
            <Stack gap="md">
              <Badge className="eyebrow" variant="light" size="lg">
                {eyebrow}
              </Badge>
              <Title className="status-title" order={1}>
                {title}
              </Title>
              <Text className="lead" size="lg">
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
  const { isLoading, user } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false)

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
            className="primary-action"
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
      lead="Your session is active. The lobby is the next stop."
      title="Welcome back"
    >
      <Stack gap="lg">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <StatusItem
            label="Signed in as"
            value={user.email ?? 'Authenticated player'}
          />
          <StatusItem label="Player id" value={user.id} />
        </SimpleGrid>

        {authError ? (
          <Alert color="red" radius="md" title="Sign-out failed">
            {authError}
          </Alert>
        ) : null}

        <Group>
          <Button
            className="primary-action"
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
