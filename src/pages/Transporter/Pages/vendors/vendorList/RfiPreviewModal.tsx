
import { X, Send, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface RfiPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (message: string) => void
  vendorName: string
  companyName: string
  isLoading?: boolean
}

export const RfiPreviewModal = ({
  isOpen,
  onClose,
  onSend,
  vendorName,
  companyName,
  isLoading = false,
}: RfiPreviewModalProps) => {
  const [message, setMessage] = useState(
    'We’d like to briefly introduce our company and understand if there’s an opportunity to work together.'
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Review RFI Message</h3>
            <p className="text-xs text-slate-500 font-medium">Sending to <span className="text-amber-600 font-bold">{vendorName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 shadow-sm">
                <div className="p-1.5 bg-blue-100 rounded-full text-blue-600 shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-900 mb-1">Company Profile Attached</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        This message will be included in the formal introduction email. Your full company profile (fleet size, services, etc.) is automatically attached.
                    </p>
                </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        Introduction Message
                    </label>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {message.length} characters
                    </span>
                </div>
                
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full min-h-[140px] p-4 text-sm text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none leading-relaxed shadow-sm transition-all"
                    placeholder="Write a custom introduction..."
                />
            </div>

            {/* Preview Box */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 relative">
                 <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded-md shadow-sm">
                     Preview
                 </div>
                 <div className="text-sm text-slate-600 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <p className="mb-4">Hello <strong>{vendorName}</strong>,</p>
                    <p className="mb-4 whitespace-pre-line text-slate-800">{message}</p>
                    <p>Regards,<br/><strong>{companyName}</strong></p>
                 </div>
            </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
                if(!message.trim()) {
                    toast.error("Please enter a message");
                    return;
                }
                onSend(message);
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl shadow-lg shadow-amber-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
           {isLoading ? (
               <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                   Sending...
               </span>
           ): (
               <>
                <Send size={16} /> Send RFI Now
               </>
           )}
          </button>
        </div>
      </div>
    </div>
  )
}
