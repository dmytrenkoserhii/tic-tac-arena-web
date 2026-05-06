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
- Create a private room through the Nest API.
- Share the room code or invite link with a second signed-in player.
- Host starts the game.
- Moves are persisted through Supabase RPC and synced through Supabase Realtime.
- Win/draw status is stored on the game row and synced to both players.
- Reload restores the active room, current game, and board state.
