import React, { useState } from 'react';
import { X, FileText, Download, Mail, MessageCircle, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import { gql } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';

interface InvoiceGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    lrData: any; 
    onSuccess: () => void;
}

const GET_INVOICE_PDF = gql`
  query GetInvoicePdf($lrId: ID!) {
    getInvoicePdf(lrId: $lrId)
  }
`;

const SEND_INVOICE_EMAIL = gql`
  mutation SendInvoiceEmail($lrId: ID!) {
    sendInvoiceEmail(lrId: $lrId)
  }
`;

interface GetInvoicePdfData {
  getInvoicePdf: string;
}

interface GetInvoicePdfVars {
  lrId: string;
}

interface SendInvoiceEmailData {
  sendInvoiceEmail: boolean;
}

interface SendInvoiceEmailVars {
  lrId: string;
}

export const InvoiceGeneratorModal = ({ isOpen, onClose, lrData, onSuccess }: InvoiceGeneratorModalProps) => {
    const [generating, setGenerating] = useState(false);
    
    const [getInvoicePdf] = useLazyQuery<GetInvoicePdfData, GetInvoicePdfVars>(GET_INVOICE_PDF);
    const [sendInvoiceEmail] = useMutation<SendInvoiceEmailData, SendInvoiceEmailVars>(SEND_INVOICE_EMAIL);

    if (!isOpen || !lrData) return null;

    const handleDownload = async () => {
        setGenerating(true);
        try {
            const { data } = await getInvoicePdf({ variables: { lrId: lrData.id || lrData._id } });
            
            if (data?.getInvoicePdf) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${data.getInvoicePdf}`;
                link.download = `Invoice_${lrData.lrNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success("Invoice downloaded successfully");
                onSuccess(); 
            } else {
                toast.error("Failed to generate invoice PDF");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to download PDF");
        } finally {
            setGenerating(false);
        }
    };

    const handleEmail = async () => {
        setGenerating(true);
        try {
            const { data } = await sendInvoiceEmail({ variables: { lrId: lrData.id || lrData._id } });
            if (data?.sendInvoiceEmail) {
                toast.success("Invoice email sent successfully");
                onSuccess();
            } else {
                toast.error("Failed to send email");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send email");
        } finally {
            setGenerating(false);
        }
    };

    const handleWhatsApp = () => {
        const message = `Hello, please find the invoice for LR *${lrData.lrNumber}*. Total Amount: *${lrData.freightRate}*.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        onSuccess();
        toast.success("WhatsApp opened");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 m-4 border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        Generate & Share Invoice
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                        <Printer className="w-8 h-8 text-amber-600" />
                    </div>
                     <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-800 mb-1">Invoice Ready</h4>
                        <p className="text-gray-500 text-sm">Choose an action for LR: <span className="font-mono font-semibold text-gray-700">{lrData.lrNumber}</span></p>
                    </div>

                    <div className="grid grid-cols-1 w-full gap-3">
                        <button 
                            onClick={handleDownload}
                            disabled={generating}
                            className="flex items-center justify-center gap-3 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-amber-200 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Download className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="block font-semibold text-gray-800 text-sm">
                                    {generating ? "Processing..." : "Download PDF"}
                                </span>
                                <span className="block text-xs text-gray-500">Save to your device</span>
                            </div>
                        </button>

                         <button 
                            onClick={handleEmail}
                            disabled={generating}
                            className="flex items-center justify-center gap-3 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-amber-200 group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                             <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="block font-semibold text-gray-800 text-sm">
                                    {generating ? "Sending..." : "Send Email"}
                                </span>
                                <span className="block text-xs text-gray-500">Send directly to vendor</span>
                            </div>
                        </button>

                         <button 
                            onClick={handleWhatsApp}
                            className="flex items-center justify-center gap-3 w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-amber-200 group transition-all"
                        >
                             <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="block font-semibold text-gray-800 text-sm">Share on WhatsApp</span>
                                <span className="block text-xs text-gray-500">Send directly to vendor</span>
                            </div>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};
