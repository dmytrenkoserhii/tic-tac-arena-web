import {
  Badge,
  Box,
  Container,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'

import { env } from './lib/env'
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
  children?: React.ReactNode
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
        lead="Supabase is connected and the app is correctly detecting the signed out state. The next step is wiring Google sign-in."
        title="Auth foundation is ready"
      >
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <StatusItem label="Connection target" value={env.supabaseUrl} />
          <StatusItem label="Session state" value="Signed out" />
          <StatusItem
            label="Next step"
            value="Google sign-in with Supabase Auth"
          />
        </SimpleGrid>
      </StatusShell>
    )
  }

  return (
    <StatusShell
      eyebrow="Tic Tac Arena"
      lead="The app has a valid authenticated session in this browser and is ready for protected screens."
      title="Session restored"
    >
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatusItem
          label="Signed in as"
          value={user.email ?? 'Authenticated player'}
        />
        <StatusItem label="User id" value={user.id} />
        <StatusItem
          label="Next step"
          value="Google sign-in screen and protected lobby flow"
        />
      </SimpleGrid>
    </StatusShell>
  )
}

export default App
