import { type PropsWithChildren, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AuthContext } from './auth-context'
import { syncProfile, type Profile } from '../profile/profile-api'
import { supabase } from '../../lib/supabase'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      setSession(activeSession)
      setIsLoading(false)
    }

    void bootstrapSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      if (!session?.user) {
        setProfile(null)
        setProfileError(null)
        return
      }

      const { data, error } = await syncProfile(session.user)

      if (!isMounted) {
        return
      }

      setProfile(data)
      setProfileError(error?.message ?? null)
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [session])

  return (
    <AuthContext
      value={{
        isLoading,
        profile,
        profileError,
        session,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext>
  )
}
