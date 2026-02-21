import { useState } from 'react'
import { Eye, EyeOff, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useMutation } from '@apollo/client/react'
import { useContext } from 'react'
import { AuthContext } from '../../../../context/AuthContextObject'
import { TRANSPORTER_LOGIN_MUTATION } from './transLogin.gql'
import { Alert } from '../../../../components/common/Alert'
import Loader from '../../../../components/common/Loader'

interface Transporter {
  id: string
  name: string
  fullName: string
  email: string
  phoneNumber: string
  alternatePhoneNumber?: string | null
  companyName: string
  gstNumber?: string
  panNumber?: string
  businessType?: string
  yearsInBusiness?: number
  businessAddress?: {
    address: string
    city: string
    state: string
    pinCode: string
  }
  numberOfVehicles?: number
  primaryVehicleType?: string
  serviceAreas?: string[]
  documents?: {
    transportLicense: any
    vehicleRC: any
    insuranceCertificate: any
    panCard: any
  }
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface LoginResponse {
  loginTransporter: {
    token: string
    transporter: Transporter
  }
}

interface LoginVariables {
  email: string
  password: string
}

export const Trans_Login = () => {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loginTransporter, { loading }] = useMutation<LoginResponse, LoginVariables>(
    TRANSPORTER_LOGIN_MUTATION,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    try {
      const result = await loginTransporter({
        variables: {
          email: form.email,
          password: form.password,
        },
      })

      if (!result.data) {
        setErrorMsg('Invalid credentials')
        return
      }

      const { token, transporter } = result.data.loginTransporter

      // Use AuthContext for centralized state
      authContext?.login(token, {
        ...transporter,
        // Match the User interface structure
        roles: ['TRANSPORTER'] as [string]
      })

      localStorage.setItem('role', 'TRANSPORTER')
      toast.success(`Welcome back, ${transporter.fullName}`)
      navigate('/trans-dashboard')
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <Truck size={28} />
          <h1 className="text-xl font-bold">
            INFi-<span className="text-amber-300">LOGISTICS</span>
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">Login</h2>

          {errorMsg && (
            <div className="mb-6">
              <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-md focus:ring-amber-300"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-md pr-12 focus:ring-amber-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          {/* Remember me */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            Remember me
          </div>

          <div className="flex justify-end mb-6 -mt-2">
            <a href="/trans-forget-pass" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Forgot Password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-3 rounded-md hover:bg-amber-600 flex items-center justify-center p-0"
          >
            {loading ? <div className="scale-40 h-10"><Loader /></div> : 'Sign in'}
          </button>

          <p className="text-center mt-4">
            Don’t have an account?{' '}
            <a href="/trans-register" className="text-blue-600">
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
