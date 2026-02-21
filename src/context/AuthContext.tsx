import { useApolloClient } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { ME_QUERY } from '../auth/auth.queries'
import type { User } from '../auth/auth.types'
import { AuthContext } from './AuthContextObject'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const client = useApolloClient()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      Promise.resolve().then(() => setLoading(false))
      return
    }

    client
      .query<{ me: User }>({ query: ME_QUERY })
      .then(({ data }) => {
        if (data?.me) {
          setUser(data.me)
          setRole(data.me.roles[0])
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [client])

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    setUser(userData)
    setRole(userData.roles[0])
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    client.resetStore()
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
