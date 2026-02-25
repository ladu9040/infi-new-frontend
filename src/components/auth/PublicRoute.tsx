import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContextObject'

export const PublicRoute: React.FC = () => {
  const auth = useContext(AuthContext)

  if (!auth) {
    return null
  }

  const { user, loading } = auth

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/trans-dashboard" replace />
  }

  return <Outlet />
}
