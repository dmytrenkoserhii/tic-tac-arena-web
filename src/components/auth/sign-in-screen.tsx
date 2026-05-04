import { Alert, Button, Stack } from '@mantine/core'

import { StatusShell } from '../layout'
import classes from '../../App.module.css'

type SignInScreenProps = {
  authError: string | null
  isAuthActionLoading: boolean
  onGoogleSignIn: () => void
}

export function SignInScreen({
  authError,
  isAuthActionLoading,
  onGoogleSignIn,
}: SignInScreenProps) {
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
          onClick={onGoogleSignIn}
          size="lg"
        >
          Continue with Google
        </Button>
      </Stack>
    </StatusShell>
  )
}
