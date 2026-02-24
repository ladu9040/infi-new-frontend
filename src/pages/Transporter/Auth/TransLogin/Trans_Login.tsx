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
      console.error('Login error detail:', err)
      setErrorMsg(err.message || 'Login failed')
    }

  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/Trucks-port-containers.jpg")' }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-400 via-yellow-200/90 to-transparent"
      />

      {/* Content Container */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center relative z-10 px-4 md:px-24 gap-12">
        
        {/* Branding Section (Left Side) */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[22rem] -ml-3 md:text-[13rem] font-black flex flex-wrap justify-center md:justify-start gap-0 leading-tight">
            <span 
              className="text-transparent" 
              style={{ WebkitTextStroke: '4px black' }}
            >
              IN
            </span>
            <span className="text-white">
              FI
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-black tracking-[0.3em] uppercase mt-2 opacity-90">
            Logistics
          </h2>
          <div className="h-1 w-24 bg-black my-6 mx-auto md:mx-0 rounded-full" />
          <p className="text-lg md:text-xl text-black/80 max-w-md font-medium italic leading-relaxed">
            "Seamless Logistics, Boundless Reach. Delivering Excellence to Your Doorstep, Every Single Mile."
          </p>
        </div>

        {/* Login Form (Right Side) */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-2xl p-10 w-full border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">Login</h2>

            {errorMsg && (
              <div className="mb-6">
                <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />
              </div>
            )}

            {/* Email */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-800">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-800">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg pr-12 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900 placeholder-gray-400 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center text-gray-700 text-sm cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 w-4 h-4 appearance-none bg-white border border-gray-300 rounded checked:bg-yellow-500 checked:border-yellow-500 transition-all cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-bold checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2"
                />

                Remember me
              </label>
              <a href="/trans-forget-pass" className="text-sm text-yellow-700 hover:text-yellow-800 font-bold transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3.5 rounded-lg font-bold hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-black/10"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>


            <p className="text-center mt-6 text-gray-600 font-medium">
              Don’t have an account?{' '}
              <a href="/trans-register" className="text-yellow-700 hover:text-yellow-800 font-bold ml-1 transition-colors">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>

    </div>
  )

}
