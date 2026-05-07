# Tic Tac Arena Web

React + Vite frontend for the Tic Tac Arena realtime multiplayer game.

## Stack

- React 19
- Vite
- TypeScript
- Mantine UI
- CSS Modules for custom app styling
- Supabase Auth, Postgres, and Realtime

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=http://localhost:3000
```

Supabase values come from the Supabase project API settings. Use the project URL and the public anon/publishable key only. Do not put service role keys in the web app.

`VITE_API_URL` points to the local Nest API.

## Commands

Run the dev server:

```bash
pnpm dev
```

Build the app:

```bash
pnpm build
```

Run lint:

```bash
pnpm lint
```

## Supabase Requirements

Before the full app flow works, the Supabase project must have:

- Google provider enabled in Supabase Auth
- `profiles`, `rooms`, `games`, and `moves` tables
- RLS policies from the server repository migrations
- Supabase Realtime publication enabled for `rooms`, `games`, and `moves`
- `make_move` RPC function applied

Database migrations live in:

```bash
../tic-tac-arena-server/supabase/migrations
```

## Current Game Flow

- Sign in with Google.
- Sync the authenticated profile through the Nest API.
- Create a private room through the Nest API.
- Share the room code or invite link with a second signed-in player.
- Host starts the game through the Nest API.
- Moves are submitted through the Nest API, validated by Supabase RPC, and synced through Supabase Realtime.
- Win/draw status is stored on the game row and synced to both players.
- Reload restores the active room, current game, and board state.

## V1 Local Verification Checklist

Run this checklist before a v1 handoff or before starting deployment work.

### Startup

- Start the Nest API from `../tic-tac-arena-server` with `pnpm start:dev`.
- Start this web app with `pnpm dev`.
- Open the web app in two different browser sessions.
- Confirm both sessions can reach the same Supabase project and local API.

### Auth and Profile

- Sign in with Google in session A.
- Confirm session A remains signed in after refresh.
- Confirm a profile row exists or updates in Supabase `profiles`.
- Sign in with Google in session B.
- Confirm session B has a different profile id.

### Room Flow

- Create a room in session A.
- Confirm the room code and invite link are visible.
- Join that room from session B using the code or invite link.
- Confirm session A updates to ready without refresh.
- Confirm a third signed-in user cannot join the full room.

### Gameplay

- Start the game from session A as host.
- Confirm both sessions see the board without refresh.
- Confirm X moves first.
- Confirm the wrong player cannot move out of turn.
- Confirm an occupied cell cannot be selected again.
- Play until X wins, O wins, or the round draws.
- Confirm both sessions show the same finished result.
- Confirm no more moves can be made after completion.
- Start the next game from the host session.

### Realtime and Recovery

- Make moves from both sessions and confirm the other session updates without refresh.
- Refresh session A during an active match and confirm room, game, board, and turn restore.
- Refresh session B during an active match and confirm the same restore behavior.
- Leave the room from one session.
- Confirm the other session returns to lobby with a friendly closed-room notice.

### Local Checks

- Run `pnpm test`.
- Run `pnpm build`.
- Run `pnpm lint` and confirm there are no errors.
