import { useState } from 'react'
import { Truck, ChevronLeft, Mail, Phone, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Alert } from '../../../components/common/Alert'
import Loader from '../../../components/common/Loader'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPasswordTransporter($email: String!) {
    forgotPasswordTransporter(email: $email)
  }
`

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPasswordTransporter($email: String!, $otp: String!, $newPassword: String!) {
    resetPasswordTransporter(email: $email, otp: $otp, newPassword: $newPassword)
  }
`

type ResetMethod = 'email' | 'phone'
type Step = 1 | 2 | 3 | 4

export const Trans_ForgotPassword = () => {
  const [resetMethod, setResetMethod] = useState<ResetMethod>('email')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [step, setStep] = useState<Step>(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [forgotPassword, { loading: sendingOtp }] = useMutation(FORGOT_PASSWORD_MUTATION)
  const [resetPassword, { loading: resettingPassword }] = useMutation(RESET_PASSWORD_MUTATION)

  const handleSendOTP = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Please enter your email address')
      return
    }
    setErrorMsg(null)
    
    try {
      await forgotPassword({ variables: { email } })
      setStep(2)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP')
    }
  }

  const handleOtpChange = (index: number, value: string): void => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null
        nextInput?.focus()
      }
    }
  }

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    digit: string,
  ): void => {
    if (e.key === 'Backspace' && !digit && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null
      prevInput?.focus()
    }
  }

  const handleVerifyOTP = (e: React.FormEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    setErrorMsg(null)
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP')
      return
    }
    setStep(3)
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    setErrorMsg(null)

    try {
      await resetPassword({
        variables: {
          email,
          otp: otp.join(''),
          newPassword
        }
      })
      setStep(4)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password')
    }
  }

  const handleResend = async () => {
    setOtp(['', '', '', '', '', ''])
    setErrorMsg(null)
    try {
      await forgotPassword({ variables: { email } })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className=" py-3 sm:py-4 px-4 sm:px-6 shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <Truck className="text-white" size={28} />
          <h1 className="text-black text-xl sm:text-2xl font-bold">
            INFi-<span className="font-bold text-amber-300">LOGISTICS</span>
          </h1>
        </div>
      </div>

      {/* Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 w-full max-w-lg">
          {errorMsg && (
            <div className="mb-6">
              <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />
            </div>
          )}

          {/* Enter Email/Phone */}
          {step === 1 && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full mb-4 sm:mb-6">
                  {resetMethod === 'email' ? (
                    <Mail className="text-amber-500" size={32} />
                  ) : (
                    <Phone className="text-amber-500" size={32} />
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Forgot Password?
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Choose your preferred method to reset password
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {/* Reset Method Toggle */}
                <div className="flex gap-2 sm:gap-3 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setResetMethod('email')}
                    className={`flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                      resetMethod === 'email'
                        ? 'bg-white text-amber-500 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Mail size={18} />
                    Email
                  </button>
                  <button
                    onClick={() => setResetMethod('phone')}
                    className={`flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 sm:py-3 rounded-md font-medium transition-colors text-sm sm:text-base ${
                      resetMethod === 'phone'
                        ? 'bg-white text-amber-500 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Phone size={18} />
                    Phone
                  </button>
                </div>

                {/* Email or Phone Input */}
                {resetMethod === 'email' ? (
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Enter your registered email"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      We'll send a 6-digit OTP to your email
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPhone(e.target.value)
                      }
                      className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                    />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                      We'll send a 6-digit OTP to your phone number
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={sendingOtp}
                  className="w-full bg-amber-500 cursor-pointer text-white py-3.5 rounded-md font-medium hover:bg-amber-600 transition-colors text-base flex items-center justify-center p-0"
                >
                  {sendingOtp ? <div className="scale-40 h-10"><Loader /></div> : 'Send OTP'}
                </button>

                <div className="text-center">
                  <a
                    href="/trans-login"
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <ChevronLeft size={18} />
                    Back to Login
                  </a>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Need help?{' '}
                  <a href="#" className="text-amber-500 hover:text-amber-600 font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </>
          )}

          {/*  Verify OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full mb-4 sm:mb-6">
                  {resetMethod === 'email' ? (
                    <Mail className="text-amber-500" size={32} />
                  ) : (
                    <Phone className="text-amber-500" size={32} />
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Enter OTP
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  We've sent a 6-digit code to
                </p>
                <p className="text-base font-semibold text-gray-800 break-words px-4">
                  {resetMethod === 'email' ? email : phone}
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                          handleOtpKeyDown(e, index, digit)
                        }
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs sm:text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResend}
                      disabled={sendingOtp}
                      className="text-amber-500 cursor-pointer hover:text-amber-600 font-medium disabled:opacity-50"
                    >
                      {sendingOtp ? 'Resending...' : 'Resend OTP'}
                    </button>
                  </p>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  className="w-full bg-amber-500 cursor-pointer text-white py-3.5 rounded-md font-medium hover:bg-amber-600 transition-colors text-base flex items-center justify-center p-0"
                >
                  Verify OTP
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center cursor-pointer gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 font-medium"
                  >
                    <ChevronLeft size={18} />
                    Change {resetMethod === 'email' ? 'Email' : 'Phone Number'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Reset Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full mb-4 sm:mb-6">
                  <CheckCircle className="text-amber-500" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Create New Password
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Your new password must be different from previous passwords
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewPassword(e.target.value)
                      }
                      className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                  className="w-full bg-amber-500 text-white py-3.5 rounded-md font-medium hover:bg-amber-600 transition-colors text-base flex items-center justify-center p-0"
                >
                  {resettingPassword ? <div className="scale-40 h-10"><Loader /></div> : 'Reset Password'}
                </button>
              </div>
            </>
          )}

          {/* Success */}
          {step === 4 && (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
                  <CheckCircle className="text-green-500" size={40} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Password Reset Successful!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-8">
                  Your password has been successfully reset. You can now login with your new
                  password.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm text-green-800">
                    <strong>Success!</strong> Your account is now secure with the new password
                  </p>
                </div>

                <a
                  href="/trans-login"
                  className="flex items-center justify-center gap-2 w-full bg-amber-500 text-white py-3.5 rounded-md font-medium hover:bg-amber-600 transition-colors text-base"
                >
                  Go to Login
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-3 sm:py-4 px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
        <p className="break-words">
          Copyright 2025 © Theme Created By INFi-Logistics, All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
