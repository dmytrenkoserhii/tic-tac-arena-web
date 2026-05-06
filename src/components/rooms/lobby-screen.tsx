import { Alert, Button, Group, SimpleGrid, Stack } from '@mantine/core'

import { StatusShell } from '../layout'
import { StatusItem } from '../ui'
import { ActiveRoomPanel } from './active-room-panel'
import { JoinRoomForm } from './join-room-form'
import { MatchStatusPanel } from './match-status-panel'
import { GameBoardPreview } from '../games'
import type { Game, Move } from '../../types/games'
import type { Profile } from '../../types/profile'
import type { Room } from '../../types/rooms'
import classes from '../../App.module.css'

type LobbyScreenProps = {
  activeRoom: Room | null
  authError: string | null
  game: Game | null
  inviteLink: string | null
  isAuthActionLoading: boolean
  isCreateRoomLoading: boolean
  isGameActionLoading: boolean
  isJoinRoomLoading: boolean
  isLeaveRoomLoading: boolean
  isMoveActionLoading: boolean
  joinCode: string
  moves: Move[]
  onBackToLobby: () => void
  onCellClick: (cellIndex: number) => void
  onCreateRoom: () => void
  onStartGame: () => void
  onJoinCodeChange: (value: string) => void
  onJoinRoom: () => void
  onSignOut: () => void
  profile: Profile | null
  profileError: string | null
  roomError: string | null
  roomNotice: string | null
  userEmail: string | null
}

export function LobbyScreen({
  activeRoom,
  authError,
  game,
  inviteLink,
  isAuthActionLoading,
  isCreateRoomLoading,
  isGameActionLoading,
  isJoinRoomLoading,
  isLeaveRoomLoading,
  isMoveActionLoading,
  joinCode,
  moves,
  onBackToLobby,
  onCellClick,
  onCreateRoom,
  onJoinCodeChange,
  onJoinRoom,
  onSignOut,
  onStartGame,
  profile,
  profileError,
  roomError,
  roomNotice,
  userEmail,
}: LobbyScreenProps) {
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
            value={profile?.email ?? userEmail ?? 'Authenticated player'}
          />
          <StatusItem
            label="Profile"
            value={profile ? 'Ready to play' : 'Setting up player profile'}
          />
        </SimpleGrid>

        {profileError ? (
          <Alert color="yellow" radius="md" title="Profile setup needs attention">
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

        {activeRoom ? (
          <>
            <ActiveRoomPanel
              inviteLink={inviteLink}
              isLeaving={isLeaveRoomLoading}
              onBackToLobby={onBackToLobby}
              profile={profile}
              room={activeRoom}
            />
            <MatchStatusPanel room={activeRoom} />
            <GameBoardPreview
              game={game}
              isLoading={isGameActionLoading}
              isMoveLoading={isMoveActionLoading}
              moves={moves}
              onCellClick={onCellClick}
              onStartGame={onStartGame}
              profile={profile}
              room={activeRoom}
            />
          </>
        ) : (
          <>
            <JoinRoomForm
              isDisabled={!profile}
              isLoading={isJoinRoomLoading}
              joinCode={joinCode}
              onJoin={onJoinRoom}
              onJoinCodeChange={onJoinCodeChange}
            />

            <Group>
              <Button
                className={classes.primaryAction}
                disabled={!profile}
                loading={isCreateRoomLoading}
                onClick={onCreateRoom}
              >
                Create room
              </Button>
              <Button
                className={classes.primaryAction}
                loading={isAuthActionLoading}
                onClick={onSignOut}
                variant="light"
              >
                Sign out
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </StatusShell>
  )
}
