import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';

import { StatusShell } from '../layout';
import { StatusItem } from '../ui';
import { JoinRoomForm } from './join-room-form';
import type { Profile } from '../../types/profile';
import classes from '../../App.module.css';

type HomeScreenProps = {
  authError: string | null;
  isAuthActionLoading: boolean;
  isCreateRoomLoading: boolean;
  isJoinRoomLoading: boolean;
  joinCode: string;
  onCreateRoom: () => void;
  onJoinCodeChange: (value: string) => void;
  onJoinRoom: () => void;
  onSignOut: () => void;
  profile: Profile | null;
  profileError: string | null;
  roomError: string | null;
  roomNotice: string | null;
  userEmail: string | null;
};

export function HomeScreen({
  authError,
  isAuthActionLoading,
  isCreateRoomLoading,
  isJoinRoomLoading,
  joinCode,
  onCreateRoom,
  onJoinCodeChange,
  onJoinRoom,
  onSignOut,
  profile,
  profileError,
  roomError,
  roomNotice,
  userEmail,
}: HomeScreenProps) {
  return (
    <StatusShell
      eyebrow="Tic Tac Arena"
      lead="Create a private room or join one with an invite code."
      title={`Welcome back${profile?.display_name ? `, ${profile.display_name}` : ''}`}
    >
      <Stack gap="lg">
        {profileError ? (
          <Alert
            color="yellow"
            radius="md"
            title="Profile setup needs attention"
          >
            {profileError}
          </Alert>
        ) : null}

        {authError ? (
          <Alert color="red" radius="md" title="Sign-out failed">
            {authError}
          </Alert>
        ) : null}

        {roomError ? (
          <Alert color="red" radius="md" title="Room needs attention">
            {roomError}
          </Alert>
        ) : null}

        {roomNotice ? (
          <Alert color="blue" radius="md" title="Room updated">
            {roomNotice}
          </Alert>
        ) : null}

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Paper className={classes.homeProfileCard} p="lg" radius="lg">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text
                    className={classes.statusLabel}
                    size="xs"
                    tt="uppercase"
                  >
                    Player profile
                  </Text>
                  <Text className={classes.homePlayerName}>
                    {profile?.display_name ?? 'Arena player'}
                  </Text>
                </Stack>
                <Badge color={profile ? 'cyan' : 'yellow'} variant="light">
                  {profile ? 'Online' : 'Syncing'}
                </Badge>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <StatusItem
                  label="Signed in as"
                  value={profile?.email ?? userEmail ?? 'Authenticated player'}
                />
                <StatusItem
                  label="Profile"
                  value={
                    profile ? 'Ready to play' : 'Setting up player profile'
                  }
                />
              </SimpleGrid>

              <Button
                className={classes.responsiveAction}
                loading={isAuthActionLoading}
                onClick={onSignOut}
                variant="subtle"
              >
                Sign out
              </Button>
            </Stack>
          </Paper>

          <Stack gap="lg">
            <Paper className={classes.createRoomCard} p="lg" radius="lg">
              <Stack gap="md">
                <Text className={classes.statusLabel} size="xs" tt="uppercase">
                  Host a match
                </Text>
                <Text className={classes.homeActionTitle}>
                  Open a private arena
                </Text>
                <Text className={classes.lead}>
                  Create a room, copy the invite code, and wait for your
                  opponent to connect.
                </Text>
                <Button
                  className={classes.primaryAction}
                  disabled={!profile}
                  loading={isCreateRoomLoading}
                  onClick={onCreateRoom}
                >
                  Create room
                </Button>
              </Stack>
            </Paper>

            <JoinRoomForm
              isDisabled={!profile}
              isLoading={isJoinRoomLoading}
              joinCode={joinCode}
              onJoin={onJoinRoom}
              onJoinCodeChange={onJoinCodeChange}
            />
          </Stack>
        </SimpleGrid>
      </Stack>
    </StatusShell>
  );
}
