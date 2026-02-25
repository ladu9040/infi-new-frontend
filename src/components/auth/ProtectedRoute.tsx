import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContextObject'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const auth = useContext(AuthContext)

  if (!auth) {
    return null
  }

  const { user, loading, role } = auth

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/trans-login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/no-access" replace />
  }

  return <Outlet />
}
