import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { gql } from '@apollo/client'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import { toast } from 'react-toastify'
import { Link2, UserPlus, CheckCircle2, Loader2, Truck } from 'lucide-react'

// ─── GraphQL — Transporter Backend ───────────────────────────────────────────

const CHECK_EMAIL_EXISTS = gql`
  query CheckTransporterEmailExists($email: String!) {
    checkTransporterEmailExists(email: $email)
  }
`

const LINK_TMS_ACCOUNT = gql`
  mutation LinkTmsAccount($tmsTransporterId: String!, $email: String!) {
    linkTmsAccount(tmsTransporterId: $tmsTransporterId, email: $email)
  }
`

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = 'checking' | 'exists' | 'not-exists' | 'linked' | 'error'

interface CheckEmailData {
  checkTransporterEmailExists: boolean
}

interface LinkTmsAccountData {
  linkTmsAccount: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export const LinkAccount = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const transporterId = searchParams.get('transporterId') || ''
  const email = searchParams.get('email') || ''

  const [stage, setStage] = useState<Stage>('checking')
  const [linking, setLinking] = useState(false)

  const [checkEmail] = useLazyQuery<CheckEmailData>(CHECK_EMAIL_EXISTS, { fetchPolicy: 'network-only' })
  const [linkTmsAccount] = useMutation<LinkTmsAccountData>(LINK_TMS_ACCOUNT)

  // ── On mount: validate params and check if account exists ──────────────────
  useEffect(() => {
    if (!transporterId || !email) {
      setStage('error')
      return
    }

    checkEmail({ variables: { email } })
      .then(({ data }) => {
        setStage(data?.checkTransporterEmailExists ? 'exists' : 'not-exists')
      })
      .catch(() => setStage('error'))
  }, [email, transporterId, checkEmail])

  // ── Link handler ───────────────────────────────────────────────────────────
  const handleLink = async () => {
    const token = localStorage.getItem('transporterToken')
    if (!token) {
      toast.info('Please login first to link your account')
      navigate(
        `/trans-login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      )
      return
    }

    setLinking(true)
    try {
      await linkTmsAccount({
        variables: { tmsTransporterId: transporterId, email },
        context: { headers: { authorization: `Bearer ${token}` } },
      })

      setStage('linked')
      toast.success('Account linked successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link account'
      if (message.toLowerCase().includes('unauthorized')) {
        toast.info('Please login first to link your account')
        navigate(
          `/trans-login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
        )
      } else {
        toast.error(message)
      }
    } finally {
      setLinking(false)
    }
  }

  // ── Go to register (pre-fill email + pass transporterId for auto-link) ─────
  const handleGoToRegister = () => {
    navigate(
      `/trans-register?transporterId=${encodeURIComponent(transporterId)}&email=${encodeURIComponent(email)}`
    )
  }

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/Trucks-port-containers.jpg")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-400/90 via-yellow-200/80 to-transparent" />

      {/* Branding */}
      <div className="absolute top-6 left-6 lg:top-10 lg:left-12 text-left">
        <h1 className="text-4xl lg:text-5xl font-black flex gap-0 leading-none">
          <span className="text-transparent" style={{ WebkitTextStroke: '1.2px black' }}>IN</span>
          <span className="text-white">FI</span>
        </h1>
        <h2 className="text-[10px] lg:text-xs font-bold text-black tracking-[0.4em] uppercase mt-1 opacity-80">
          Logistics
        </h2>
        <div className="h-0.5 lg:h-[3px] w-10 lg:w-12 bg-black my-2 rounded-full" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* ── Checking ── */}
          {stage === 'checking' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <h2 className="text-2xl font-light text-gray-900">Checking account…</h2>
              <p className="text-sm text-gray-500">Looking up your email, please wait.</p>
            </div>
          )}

          {/* ── Account exists ── */}
          {stage === 'exists' && (
            <div className="text-center space-y-5">
              <h2 className="text-2xl font-light text-gray-900 tracking-tight">
                Link Your Account
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                We found a Transporter Portal account for<br />
                <strong className="text-gray-700">{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click below to link your portal account with TMS.
                You may need to login first.
              </p>

              <button
                id="btn-link-account"
                onClick={handleLink}
                disabled={linking}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {linking ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Linking…</>
                ) : (
                  <><Link2 className="w-4 h-4" /> Link My Account</>
                )}
              </button>

              <p className="text-xs text-gray-400">
                Not your account?{' '}
                <button
                  onClick={() =>
                    navigate(
                      `/trans-login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
                    )
                  }
                  className="text-amber-500 font-bold hover:underline"
                >
                  Login with the correct account
                </button>
              </p>
            </div>
          )}

          {/* ── No account found ── */}
          {stage === 'not-exists' && (
            <div className="text-center space-y-5">
              <h2 className="text-2xl font-light text-gray-900 tracking-tight">
                Create Your Account
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                No Transporter Portal account was found for<br />
                <strong className="text-gray-700">{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Register to create your account — it will be automatically linked to TMS after registration.
              </p>

              <button
                id="btn-go-register"
                onClick={handleGoToRegister}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                <UserPlus className="w-4 h-4" />
                Create Account &amp; Link
              </button>
            </div>
          )}

          {/* ── Linked successfully ── */}
          {stage === 'linked' && (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-light text-gray-900 tracking-tight">
                Account Linked!
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your Transporter Portal account has been successfully linked with the TMS platform.
                You can now manage your logistics through both systems.
              </p>
              <button
                id="btn-go-dashboard"
                onClick={() => navigate('/trans-dashboard')}
                className="w-full py-3 px-6 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-xl font-bold transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* ── Invalid / error ── */}
          {stage === 'error' && (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-light text-gray-900 tracking-tight">
                Invalid Link
              </h2>
              <p className="text-sm text-gray-500">
                This link is invalid or has expired. Please ask your TMS administrator to resend the invitation.
              </p>
              <button
                id="btn-go-login"
                onClick={() => navigate('/trans-login')}
                className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold transition-all"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
