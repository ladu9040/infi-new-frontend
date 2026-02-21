import { useEffect, useState } from 'react'
import { searchPlaces } from '../utils/placeAutoComplete'

/* ============================
   Types
============================ */

interface PlaceOption {
  label: string
  lat: string
  lon: string
}

/* ============================
   Props
============================ */

interface Props {
  value?: string
  onSelect: (place: PlaceOption) => void
  placeholder?: string
  disabled?: boolean
}

/* ============================
   Component
============================ */

export const PlaceAutocomplete = ({
  value = '',
  onSelect,
  placeholder = 'Enter location',
  disabled = false,
}: Props) => {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<PlaceOption[]>([])
  const [loading, setLoading] = useState(false)

  /* 🔁 Sync external value */
  useEffect(() => {
    setQuery(value)
  }, [value])

  /* 🔍 Autocomplete logic */
  useEffect(() => {
    if (disabled || query.length < 3) {
      setOptions([])
      return
    }

    const debounce = setTimeout(async () => {
      try {
        setLoading(true)
        const results = await searchPlaces(query)
        setOptions(results)
      } catch (err) {
        console.error('Autocomplete error:', err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(debounce)
  }, [query, disabled])

  /* ============================
     UI
  ============================ */

  return (
    <div className="relative w-full">
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full bg-transparent px-2 py-1 outline-none text-sm
          ${disabled ? 'cursor-not-allowed text-gray-500' : ''}
        `}
      />

      {/* Loading */}
      {loading && (
        <div className="absolute z-10 bg-white border border-gray-300 w-full p-2 text-xs text-gray-500">
          Searching...
        </div>
      )}

      {/* Suggestions */}
      {!disabled && options.length > 0 && !loading && (
        <ul className="absolute z-20 bg-white border border-gray-300 w-full max-h-60 overflow-auto shadow">
          {options.map((opt, index) => (
            <li
              key={`${opt.lat}-${opt.lon}-${index}`}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => {
                onSelect(opt)
                setQuery(opt.label)
                setOptions([])
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
