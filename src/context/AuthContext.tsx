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
    const transporterToken = localStorage.getItem('transporterToken')
    const adminToken = localStorage.getItem('token')
    const token = transporterToken || adminToken

    if (!token) {
      Promise.resolve().then(() => setLoading(false))
      return
    }

    client
      .query<{ me: User }>({ 
        query: ME_QUERY,
        context: {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      })
      .then(({ data }) => {
        if (data?.me) {
          setUser(data.me)
          setRole(data.me.roles[0])
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('transporterToken')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [client])

  const login = (token: string, userData: User) => {
    const isTransporter = userData.roles.includes('TRANSPORTER')
    if (isTransporter) {
      localStorage.setItem('transporterToken', token)
      localStorage.removeItem('token') // Ensure no conflict
    } else {
      localStorage.setItem('token', token)
      localStorage.removeItem('transporterToken')
    }
    setUser(userData)
    setRole(userData.roles[0])
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('transporterToken')
    localStorage.removeItem('role')
    setUser(null)
    client.resetStore()
  }


  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
