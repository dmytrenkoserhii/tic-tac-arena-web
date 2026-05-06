import type { User } from '@supabase/supabase-js'

import { apiRequest } from '../../lib/api-client'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../types/profile'

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('id, email, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle<Profile>()
}

export async function syncProfile(user: User) {
  void user

  return apiRequest<Profile>('/profiles/sync', {
    method: 'POST',
  })
}
