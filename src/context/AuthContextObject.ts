import { createContext } from 'react'
import type { User } from '../auth/auth.types'

export interface AuthContextType {
  user: User | null
  role: string
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
