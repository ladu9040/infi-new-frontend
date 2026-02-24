import { useState } from 'react'
import { Eye, EyeOff, Truck, Upload, ChevronLeft, ChevronRight, CheckCircle2, User, Building2, Car, ShieldCheck, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { toast } from 'react-toastify'
import { REGISTER_TRANSPORTER_MUTATION } from './transRegister'
import { Alert } from '../../../../components/common/Alert'

const STEPS = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Business', icon: Building2 },
  { id: 3, title: 'Fleet', icon: Car },
  { id: 4, title: 'Documents', icon: ShieldCheck },
  { id: 5, title: 'Security', icon: Lock },
]

export const Trans_Register = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!form.fullName) newErrors.fullName = 'Full Name is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format'
      if (!/^\d{10}$/.test(form.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits'
    } else if (step === 2) {
      if (!form.companyName) newErrors.companyName = 'Company Name is required'
      if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
        newErrors.panNumber = 'Invalid PAN format'
      }
      if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.toUpperCase())) {
        newErrors.gstNumber = 'Invalid GST format'
      }
      if (!form.address) newErrors.address = 'Address is required'
      if (!form.city) newErrors.city = 'City is required'
      if (!form.state) newErrors.state = 'State is required'
      if (!/^\d{6}$/.test(form.pinCode)) newErrors.pinCode = 'PIN code must be 6 digits'
    } else if (step === 5) {
      if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (!agreeTerms) newErrors.agreeTerms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      setErrorMsg(null)
    } else {
      setErrorMsg('Please fix the errors before proceeding')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setErrorMsg(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
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
    if (!validateStep(5)) return

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
            businessType: form.businessType.toUpperCase() || 'PROPRIETORSHIP',
            primaryVehicleType: form.primaryVehicleType.toUpperCase() || 'OPEN',
            yearsInBusiness: Number(form.yearsInBusiness) || 0,
            businessAddress: {
              address: form.address,
              city: form.city,
              state: form.state,
              pinCode: form.pinCode,
            },
            numberOfVehicles: Number(form.numberOfVehicles) || 0,
            serviceAreas: form.serviceAreas.split(',').map((s) => s.trim()).filter(s => s),
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
      toast.success('Registration successful!');
      navigate('/trans-intro');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/Trucks-port-containers.jpg")' }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-400 via-yellow-200/90 to-transparent"
      />
      {/* Background Image elements removed for gradient alignment */}

        {/* Branding (Top Left Corner) */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-12 text-left animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-4xl lg:text-5xl font-black flex gap-0 leading-none">
            <span 
              className="text-transparent" 
              style={{ WebkitTextStroke: '1.2px black' }}
            >
              IN
            </span>
            <span className="text-white">
              FI
            </span>
          </h1>
          <h2 className="text-[10px] lg:text-xs font-bold text-black tracking-[0.4em] uppercase mt-1 opacity-80">
            Logistics
          </h2>
          <div className="h-0.5 lg:h-[3px] w-10 lg:w-12 bg-black my-2 rounded-full" />
        </div>
      {/* Main Content Container (Centered Form) */}
      <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center justify-center px-4 py-12">
        

        {/* Form Container (Widened and Centered - Minimalistic Design) */}
        <div className="w-full lg:w-[1000px] animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-14 w-full relative border border-gray-100">
            
            <h2 className="text-4xl font-light mb-12 text-gray-900 text-center tracking-tight">Create Account</h2>

            {/* Redesigned Steps Indicator */}
            <div className="flex items-center justify-between mb-12 relative px-4">
              
              
              {/* active progress line */}
              <div 
                className="absolute top-5 left-10 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-300 -z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                style={{ 
                  width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - ${currentStep === 1 ? '0px' : '20px'})`,
                  maxWidth: 'calc(100% - 80px)'
                }}
              />

              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                const isPast = currentStep > step.id
                
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`
                      group relative flex items-center justify-center
                      w-10 h-10 rounded-xl border transition-all duration-500
                      ${isCompleted ? 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-white' : 
                        isActive ? 'bg-white border-amber-500/50 text-amber-500 scale-110 shadow-[0_0_20px_rgba(0,0,0,0.05)]' : 
                        'bg-white border-gray-100 text-gray-300'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                      ) : (
                        <div className="relative">
                          <Icon size={18} className={`${isActive ? 'opacity-100' : 'opacity-40'}`} />
                        </div>
                      )}
                      
                      {/* Active Ring Pulse */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-xl border-2 border-amber-500/30 animate-ping opacity-75" />
                      )}
                    </div>

                    {/* Always visible label */}
                    <div className="mt-3 flex flex-col items-center">
                      <span className={`
                        text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300
                        ${isActive ? 'text-amber-500' : isCompleted ? 'text-gray-700' : 'text-gray-300'}
                      `}>
                        {step.title}
                      </span>
                      {isActive && (
                        <div className="h-1 w-1 bg-amber-500 rounded-full mt-1 animate-bounce" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {errorMsg && (
              <div className="mb-6 animate-shake">
                <Alert message={errorMsg} onClose={() => setErrorMsg(null)} />
              </div>
            )}

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar px-2 py-4 mb-8">
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <InputGroup label="Full Name *" name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" error={errors.fullName} />
                  <InputGroup label="Email Address *" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your email" error={errors.email} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Phone *" type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="10 Digits" error={errors.phoneNumber} />
                    <InputGroup label="Alt Phone" type="tel" name="alternatePhoneNumber" value={form.alternatePhoneNumber} onChange={handleChange} placeholder="Optional" error={errors.alternatePhoneNumber} />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <InputGroup label="Company Name *" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Logistics Co." error={errors.companyName} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="GST Number" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="Optional" error={errors.gstNumber} />
                    <InputGroup label="PAN Number" name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" error={errors.panNumber} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <SelectGroup label="Business Type" name="businessType" value={form.businessType} onChange={handleChange} options={[
                      { label: 'Sole Proprietorship', value: 'proprietorship' },
                      { label: 'Partnership', value: 'partnership' },
                      { label: 'Private Limited', value: 'private_limited' },
                      { label: 'LLP', value: 'llp' },
                    ]} />
                    <InputGroup label="Years" type="number" name="yearsInBusiness" value={form.yearsInBusiness} onChange={handleChange} placeholder="0" />
                  </div>
                  <InputGroup label="Address *" name="address" value={form.address} onChange={handleChange} placeholder="Registered Address" error={errors.address} isTextArea rows={2} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <InputGroup label="City *" name="city" value={form.city} onChange={handleChange} error={errors.city} />
                    <InputGroup label="State *" name="state" value={form.state} onChange={handleChange} error={errors.state} />
                    <InputGroup label="PIN *" name="pinCode" value={form.pinCode} onChange={handleChange} error={errors.pinCode} />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputGroup label="Vehicles" type="number" name="numberOfVehicles" value={form.numberOfVehicles} onChange={handleChange} placeholder="0" />
                    <SelectGroup label="Primary Type" name="primaryVehicleType" value={form.primaryVehicleType} onChange={handleChange} options={[
                      { label: 'Open', value: 'open' },
                      { label: 'Trailer', value: 'trailer' },
                      { label: 'Container', value: 'container' },
                      { label: 'Refrigerated', value: 'refrigerated' },
                    ]} />
                  </div>
                  <InputGroup label="Service Areas" name="serviceAreas" value={form.serviceAreas} onChange={handleChange} placeholder="Delhi, Mumbai..." isTextArea rows={3} />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocUpload label="License" />
                    <DocUpload label="Vehicle RC" />
                    <DocUpload label="Insurance" />
                    <DocUpload label="PAN Card" />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <PasswordInput label="Password *" name="password" value={form.password} onChange={handleChange} show={showPassword} toggle={() => setShowPassword(!showPassword)} error={errors.password} />
                  <PasswordInput label="Confirm Password *" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} error={errors.confirmPassword} />
                  
                  <label className="flex items-center gap-3 cursor-pointer group mt-6">
                    <input 
                      type="checkbox" 
                      checked={agreeTerms} 
                      onChange={(e) => setAgreeTerms(e.target.checked)} 
                      className="w-4 h-4 appearance-none bg-white/10 border border-white/30 rounded checked:bg-[#FFB800] checked:border-[#FFB800] transition-all cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-bold checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2" 
                    />
                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                      Accept <a href="#" className="text-[#FFB800] font-bold hover:underline">Terms & Privacy</a>.
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="text-red-400 text-[10px] mt-1 font-bold">{errors.agreeTerms}</p>}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {currentStep > 1 && (
                <button onClick={prevStep} className="flex-1 flex items-center justify-center gap-1 py-3 px-6 bg-white hover:bg-gray-50 text-gray-600 rounded-lg font-bold transition-all border border-gray-100 text-sm">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button onClick={nextStep} className={`flex-[2] flex items-center justify-center gap-1 py-3 px-6 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-lg font-bold transition-all shadow-lg shadow-amber-500/20 text-sm ${currentStep === 1 ? 'w-full' : ''}`}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex-[2] flex items-center justify-center gap-1 py-3 px-6 bg-[#FF9900] hover:bg-[#FF8800] text-white rounded-lg font-bold transition-all shadow-lg shadow-amber-500/20 text-sm disabled:opacity-50">
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              )}
            </div>

            <p className="text-gray-500 text-sm text-center">
              Already have an account? <a href="/trans-login" className="text-amber-400 font-bold hover:underline ml-1">Login</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}

const InputGroup = ({ label, type = 'text', name, value, onChange, placeholder, error, isTextArea, rows = 3 }: any) => (
  <div className="flex flex-col gap-2 pb-2">
    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">{label}</label>
    {isTextArea ? (
      <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} className={`w-full bg-gray-50 border ${error ? 'border-red-500/50' : 'border-gray-200'} rounded-lg px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none font-medium text-sm`} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-gray-50 border ${error ? 'border-red-500/50' : 'border-gray-200'} rounded-lg px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-medium`} />
    )}
    {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tight ml-2">{error}</p>}
  </div>
)

const SelectGroup = ({ label, name, value, onChange, options }: any) => (
  <div className="flex flex-col gap-2 pb-2">
    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-medium">
        <option value="" className="bg-white">Select...</option>
        {options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>)}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
    </div>
  </div>
)

const PasswordInput = ({ label, name, value, onChange, show, toggle, error }: any) => (
  <div className="flex flex-col gap-2 pb-2">
    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-600">{label}</label>
    <div className="relative">
      <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange} placeholder="••••••••" className={`w-full bg-gray-50 border ${error ? 'border-red-400/50' : 'border-gray-200'} rounded-lg px-5 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all pr-12 font-medium`} />
      <button type="button" onClick={toggle} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
    {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tight ml-2">{error}</p>}
  </div>
)

const DocUpload = ({ label }: any) => (
  <label className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/10 hover:border-amber-500/50 hover:bg-white/10 rounded-2xl cursor-pointer transition-all group">
    <div className="p-3 bg-white/5 rounded-xl text-white/30 group-hover:text-amber-500 transition-colors">
      <Upload size={24} />
    </div>
    <div className="text-center">
      <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[10px] text-white/30">Click to upload scan</p>
    </div>
    <input type="file" className="hidden" />
  </label>
)
