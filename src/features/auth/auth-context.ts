import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import type { Profile } from '../../types/profile';

export type AuthContextValue = {
  isLoading: boolean;
  profile: Profile | null;
  profileError: string | null;
  session: Session | null;
  user: User | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
