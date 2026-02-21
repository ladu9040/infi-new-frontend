import { useState } from 'react'
import { Eye, EyeOff, Truck, Upload, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { toast } from 'react-toastify'
import { REGISTER_TRANSPORTER_MUTATION } from './transRegister'
import { Alert } from '../../../../components/common/Alert'
import Loader from '../../../../components/common/Loader'

export const Trans_Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    companyName: '',
    gstNumber: '',
    panNumber: '',
    businessType: '',
    yearsInBusiness: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    numberOfVehicles: '',
    primaryVehicleType: '',
    serviceAreas: '',
    password: '',
    confirmPassword: '',
  })
  const [registerTransporter, { loading }] = useMutation(REGISTER_TRANSPORTER_MUTATION)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    // Phone numbers (10 digits)
    if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits'
    }
    if (form.alternatePhoneNumber && !/^\d{10}$/.test(form.alternatePhoneNumber)) {
      newErrors.alternatePhoneNumber = 'Alternate phone number must be 10 digits'
    }
    
    // PAN (10 alphanumeric)
    if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)'
    }
    
    // GST (15 alphanumeric)
    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
      newErrors.gstNumber = 'Invalid GST format (15 characters)'
    }
    
    // PIN Code (6 digits)
    if (!/^\d{6}$/.test(form.pinCode)) {
      newErrors.pinCode = 'PIN code must be 6 digits'
    }
    
    // Password
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    // Confirm Password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    
    if (!validateForm()) {
      setErrorMsg('Please fix the errors below')
      return
    }

    if (!agreeTerms) {
      setErrorMsg('Please accept Terms & Conditions')
      return
    }

    try {
      await registerTransporter({
        variables: {
          input: {
            fullName: form.fullName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            alternatePhoneNumber: form.alternatePhoneNumber || null,
            companyName: form.companyName,
            gstNumber: form.gstNumber,
            panNumber: form.panNumber,

            businessType: form.businessType.toUpperCase(),
            primaryVehicleType: form.primaryVehicleType.toUpperCase(),

            yearsInBusiness: Number(form.yearsInBusiness),
            businessAddress: {
              address: form.address,
              city: form.city,
              state: form.state,
              pinCode: form.pinCode,
            },
            numberOfVehicles: Number(form.numberOfVehicles),
            serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()),

            documents: {
              transportLicense: { url: 'pending' },
              vehicleRC: { url: 'pending' },
              insuranceCertificate: { url: 'pending' },
              panCard: { url: 'pending' },
            },

            password: form.password,
          },
        },
      })

      toast.success('Registration successful. Await verification.')
      navigate('/trans-login')
    } catch (err: any) {
      console.error('Registration error:', err)
      setErrorMsg(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="py-3 sm:py-4 px-4 sm:px-6 shadow-md">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          <Truck className="text-white" size={28} />
          <h1 className="text-black text-xl sm:text-2xl font-bold">
            INFi-<span className="font-bold text-amber-300">LOGISTICS</span>
          </h1>
        </div>
      </div>

      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8 md:py-12"
      >
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 w-full max-w-5xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Transporter Registration
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8">
            Join our logistics network and start transporting today
          </p>

          {errorMsg && (
            <div className="mb-8">
                <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />
            </div>
          )}

          <div className="space-y-5 sm:space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-amber-300">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Full Name <span className="text-amber-300">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Alternate Phone Number
                  </label>
                  <input
                    type="tel"
                    name="alternatePhoneNumber"
                    value={form.alternatePhoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.alternatePhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.alternatePhoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-amber-300">
                Business Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Company Name */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Company/Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="22AAAAA0000A1Z5"
                  />
                  {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
                </div>

                {/* PAN Number */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={form.panNumber}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="ABCDE1234F"
                  />
                  {errors.panNumber && <p className="text-red-500 text-xs mt-1">{errors.panNumber}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Business Type
                  </label>
                  <select
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Limited</option>
                    <option value="public_limited">Public Limited</option>
                    <option value="llp">LLP</option>
                  </select>
                </div>

                {/* Years in Business */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Years in Business
                  </label>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    value={form.yearsInBusiness}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {/* Business Address */}
                <div className="lg:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter complete business address"
                    required
                  ></textarea>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter city"
                    required
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="Enter state"
                    required
                  />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="000000"
                    required
                  />
                  {errors.pinCode && <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>}
                </div>
              </div>
            </div>

            {/* Fleet Information Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-amber-300">
                Fleet Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Number of Vehicles */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Number of Vehicles
                  </label>
                  <input
                    type="number"
                    name="numberOfVehicles"
                    value={form.numberOfVehicles}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="0"
                    min="1"
                  />
                </div>

                {/* Vehicle Types */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Primary Vehicle Type
                  </label>
                  <select
                    name="primaryVehicleType"
                    value={form.primaryVehicleType}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="open">Open</option>
                    <option value="trailer">Trailer</option>
                    <option value="container">Container</option>
                    <option value="refrigerated">Refer Vehicle/Cold Storage</option>
                  </select>
                </div>

                {/* Service Areas */}
                <div className="lg:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Service Areas (Cities/States)
                  </label>
                  <textarea
                    name="serviceAreas"
                    value={form.serviceAreas}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    placeholder="e.g., Delhi, Mumbai, Rajasthan, Gujarat"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-amber-300">
                Documents Upload
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Transport License */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Transport License
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-500" />
                        <p className="text-xs sm:text-sm text-gray-500">Click to upload</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>

                {/* Vehicle RC */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Vehicle RC Copy
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-500" />
                        <p className="text-xs sm:text-sm text-gray-500">Click to upload</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>

                {/* Insurance */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Insurance Certificate
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-500" />
                        <p className="text-xs sm:text-sm text-gray-500">Click to upload</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>

                {/* PAN Card */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    PAN Card
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-28 md:h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-500" />
                        <p className="text-xs sm:text-sm text-gray-500">Click to upload</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b-2 border-amber-300">
                Account Security
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Password */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-10 sm:pr-12"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="sm:w-5 sm:h-5" />
                      ) : (
                        <Eye size={18} className="sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent pr-10 sm:pr-12"
                      placeholder="Re-enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} className="sm:w-5 sm:h-5 cursor-pointer" />
                      ) : (
                        <Eye size={18} className="sm:w-5 sm:h-5 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 border-gray-300 rounded focus:ring-amber-300 mt-0.5 sm:mt-1"
              />
              <label htmlFor="terms" className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white py-2.5 sm:py-3 md:py-3.5 rounded-md font-medium hover:bg-amber-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0"
              >
                {loading ? <div className="scale-50 h-10"><Loader /></div> : 'Register as Transporter'}
              </button>
              <a
                href="/trans-login"
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 md:py-3.5 rounded-md font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base text-center flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </form>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-3 sm:py-4 px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-600">
        <p className="break-words">
          Copyright 2025 © Created By INFi-Logistics, All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
