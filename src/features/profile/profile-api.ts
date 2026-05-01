import type { User } from '@supabase/supabase-js'

import { supabase } from '../../lib/supabase'

export type Profile = {
  avatar_url: string | null
  display_name: string | null
  email: string | null
  id: string
}

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('id, email, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle<Profile>()
}

export async function syncProfile(user: User) {
  return supabase
    .from('profiles')
    .upsert(
      {
        avatar_url: getStringMetadata(user, 'avatar_url'),
        display_name:
          getStringMetadata(user, 'full_name') ?? getStringMetadata(user, 'name'),
        email: user.email ?? null,
        id: user.id,
      },
      { onConflict: 'id' },
    )
    .select('id, email, display_name, avatar_url')
    .single<Profile>()
}

function getStringMetadata(user: User, key: string) {
  const value = user.user_metadata[key]

  return typeof value === 'string' ? value : null
}
