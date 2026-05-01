import { type PropsWithChildren, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { AuthContext } from './auth-context'
import { supabase } from '../../lib/supabase'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
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

  return (
    <AuthContext
      value={{
        isLoading,
        session,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext>
  )
}
