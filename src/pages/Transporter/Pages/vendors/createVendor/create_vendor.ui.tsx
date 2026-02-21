import React from 'react'

export const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
)

export const Input = ({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      required={required}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  </div>
)

export const Textarea = ({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
}) => (
  <div className="flex flex-col gap-1 md:col-span-2">
    <label className="text-sm text-gray-600">{label}</label>
    <textarea
      {...props}
      rows={3}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  </div>
)

export const Select = ({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: string[]
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    <select
      {...props}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.replace('_', ' ')}
        </option>
      ))}
    </select>
  </div>
)

export const Button = ({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}) => {
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'

  return (
    <button {...props} className={`px-5 py-2 rounded-lg text-sm font-medium transition ${styles}`}>
      {children}
    </button>
  )
}
export const MultiSelect = ({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}) => (
  <div className="flex flex-col gap-2 md:col-span-2">
    <label className="text-sm text-gray-600 font-medium">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selectedValues.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (isSelected) {
                onChange(selectedValues.filter((v) => v !== opt))
              } else {
                onChange([...selectedValues, opt])
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isSelected
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-amber-200 hover:text-amber-600'
            }`}
          >
            {opt.replace('_', ' ')}
          </button>
        )
      })}
    </div>
  </div>
)
