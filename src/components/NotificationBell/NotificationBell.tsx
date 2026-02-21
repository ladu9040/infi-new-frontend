'use client'

import { Bell, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { GET_NOTIFICATIONS } from './NotificationBell.gql'
import type { Notification } from './Notification.types'

/* ============================
   COMPONENT
============================ */

interface NotificationBellProps {
  filterQuotationIds?: string[]
}

export const NotificationBell = ({ filterQuotationIds }: NotificationBellProps) => {
  const navigate = useNavigate()
  const popupRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data } = useQuery<{ getNotifications: Notification[] }>(GET_NOTIFICATIONS, {
    pollInterval: 10000,
  })

  const notifications = data?.getNotifications ?? []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  /* ============================
     CLOSE ON OUTSIDE CLICK
  ============================ */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ============================
     SEARCH FILTER
  ============================ */
  const filtered = notifications.filter((n) => {
    // 1. Text Search
    const matchesSearch =
      n.type.toLowerCase().includes(search.toLowerCase()) ||
      n.quotationId.toLowerCase().includes(search.toLowerCase())

    // 2. Optional Quotation Filter
    const matchesQuotation =
      !filterQuotationIds || filterQuotationIds.includes(n.quotationId)

    return matchesSearch && matchesQuotation
  })

  return (
    <div className="relative" ref={popupRef}>
      {/* 🔔 Bell */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg
        bg-white border border-gray-200
        hover:bg-gray-100 transition"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1
            bg-red-600 text-white text-xs
            rounded-full px-1.5"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80
          bg-white border border-gray-200
          rounded-xl shadow-lg z-50"
        >
          <div className="p-3 border-b flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications"
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
            )}

            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={async () => {
                  //   if (!n.isRead) {
                  //     await markRead({ variables: { id: n.id } });
                  //   }
                  setOpen(false)
                  navigate(`/quotation-review/${n.quotationId}`)
                }}
                className={`p-3 text-sm cursor-pointer border-b
                hover:bg-gray-50 transition
                ${!n.isRead ? 'bg-amber-50' : ''}`}
              >
                <div className="font-medium text-gray-800">Vendor submitted amended quotation</div>
                <div className="text-xs text-gray-500">Quotation ID: {n.quotationId.slice(-6)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
