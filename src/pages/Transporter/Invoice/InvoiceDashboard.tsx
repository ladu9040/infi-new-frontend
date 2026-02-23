import { useState, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_ALL_INVOICES, GET_INVOICE_PDF } from './invoice.gql';
import { Plus, FileText, Download, Loader2, Search, Filter, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { CreateInvoiceWizard } from './CreateInvoice/CreateInvoiceWizard';

export const InvoiceDashboard = () => {
    const { data, loading, error, refetch } = useQuery(GET_ALL_INVOICES);
    const [getInvoicePdf] = useLazyQuery(GET_INVOICE_PDF);
    
    // State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleDownloadPdf = async (lrId: string, invoiceNumber: string) => {
        try {
            setDownloadingId(lrId);
            const { data } = await getInvoicePdf({ variables: { lrId } });
            
            const pdfData = (data as any)?.getInvoicePdf;

            if (pdfData) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${pdfData}`;
                link.download = `${invoiceNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Invoice downloaded successfully");
            } else {
                toast.error("Failed to generate PDF");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error downloading invoice");
        } finally {
            setDownloadingId(null);
        }
    };

    const invoices = (data as any)?.getAllTransporterInvoices || [];

    // Filter Logic
    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice: any) => {
            const matchesSearch = 
                invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.lr?.lrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.lr?.consignee.toLowerCase().includes(searchQuery.toLowerCase());
            
            let matchesDate = true;
            if (startDate || endDate) {
                const invoiceDate = new Date(Number(invoice.createdAt)).toISOString().split('T')[0];
                if (startDate && invoiceDate < startDate) matchesDate = false;
                if (endDate && invoiceDate > endDate) matchesDate = false;
            }

            return matchesSearch && matchesDate;
        });
    }, [invoices, searchQuery, startDate, endDate]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-amber-600 font-medium">
            Loading invoices...
        </div>
    );


    if (error) return (
        <div className="text-center text-red-500 p-8">
            Error loading invoices: {error.message}
        </div>
    );

    return (
        <div className="p-4 space-y-4">
            {/* Header & Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage and track all generated invoices ({filteredInvoices.length})</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Invoice, LR, Client..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="relative">
                            <label className="text-[10px] text-gray-400 absolute -top-3 left-1">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-3 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent w-36"
                            />
                        </div>
                        <div className="relative">
                            <label className="text-[10px] text-gray-400 absolute -top-3 left-1">End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-3 pr-2 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent w-36"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors shadow-sm font-medium whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        New Invoice
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3">Invoice Details</th>
                                <th className="px-4 py-3">LR Information</th>
                                <th className="px-4 py-3">Client</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No invoices found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice: any) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-50 rounded text-amber-600">
                                                    <FileText className="w-3 h-3" />
                                                </div>
                                                <span className="text-gray-600">{invoice.lr?.lrNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {invoice.lr?.consignee}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-amber-600">
                                            ₹{invoice.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                invoice.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-100' :
                                                invoice.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => handleDownloadPdf(invoice.lrId, invoice.invoiceNumber)}
                                                disabled={downloadingId === invoice.lrId}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                                                title="Download PDF"
                                            >
                                                {downloadingId === invoice.lrId ? (
                                                    <span className="text-[10px] animate-pulse">...</span>
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}

                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {isCreateModalOpen && (
                <CreateInvoiceWizard 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => refetch()} 
                />
            )}
        </div>
    );
};
