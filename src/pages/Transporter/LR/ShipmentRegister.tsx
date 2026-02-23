import React, { useState } from 'react';
import { Search, FileText, Upload, Printer, Download, Eye, Plus, Calendar, Filter } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { UploadPODModal } from './UploadPODModal';
import { InvoiceGeneratorModal } from './InvoiceGeneratorModal';
import Loader from '../../../components/common/Loader';


const GET_ALL_LRS = gql`
  query GetAllLRs {
    getAllLRs {
      id
      lrNumber
      indentId
      indent {
        indentId
      }
      consignor
      consignee
      createdAt
      status
      freightRate
    }
  }
`;

interface LR {
  id: string;
  lrNumber: string;
  indentId: string;
  indent?: {
    indentId: string;
  };
  consignor?: string;
  consignee?: string;
  customerName?: string; // Derived from consignee/consignor
  createdAt: string;
  vehicleNumber?: string; // Not in getAllLRs yet, need to add if critical
  destination?: string; // From consignee address usually
  status: string; // 'Generated', 'Uploaded', 'Invoiced'
  freightRate: number;
}

interface GetAllLRsData {
  getAllLRs: LR[];
}

export const ShipmentRegister = ({ onGenerateLR }: { onGenerateLR: () => void }) => {
  const [activeView, setActiveView] = useState('All');
  const [selectedLR, setSelectedLR] = useState<LR | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const { data, loading, error, client } = useQuery<GetAllLRsData>(GET_ALL_LRS, {
    fetchPolicy: 'network-only'
  });

  if (loading) return <div className="p-12 text-center text-amber-600 font-medium">Loading shipments...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading shipments: {error.message}</div>;

  const lrs: LR[] = data?.getAllLRs || [];

  const filteredData = lrs.filter(item => {
     if (activeView === 'All') return true;
     return item.status === activeView.toUpperCase() || item.status === activeView;
  });

  const handleOpenUpload = (lr: LR) => {
      setSelectedLR(lr);
      setIsUploadModalOpen(true);
  };

  const handleOpenInvoice = (lr: LR) => {
      setSelectedLR(lr);
      setIsInvoiceModalOpen(true);
  };

  const handleUploadSuccess = () => {
      if (selectedLR) {
          // Optimistically update cache or refetch
          // Here we can manually update the cache to show the new status immediately
          client.writeQuery({
              query: GET_ALL_LRS,
              data: {
                  getAllLRs: lrs.map(lr => 
                      lr.id === selectedLR.id 
                          ? { ...lr, status: 'UPLOADED' } 
                          : lr
                  )
              }
          });
      }
  };

  const handleInvoiceSuccess = () => {
      if (selectedLR) {
           client.writeQuery({
              query: GET_ALL_LRS,
              data: {
                  getAllLRs: lrs.map(lr => 
                      lr.id === selectedLR.id 
                          ? { ...lr, status: 'INVOICED' } 
                          : lr
                  )
              }
          });
      }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
       {/* Header */}
       <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Shipment Register</h2>
          <p className="text-sm text-gray-500 mt-1">Manage LRs, PODs, and Customer Invoices</p>
        </div>
        <button 
            onClick={onGenerateLR}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-amber-700 transition-all flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            Generate New LR
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-100 bg-white flex gap-4">
           <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Search by LR No, Indent ID, Customer..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
           </div>
           
           <div className="flex bg-gray-100 p-1 rounded-lg">
                {['All', 'Generated', 'Uploaded', 'Invoiced'].map((view) => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === view ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {view}
                    </button>
                ))}
           </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">LR No.</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">LR Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Indent ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Freight Rate</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                            No shipments found.
                        </td>
                    </tr>
                ) : (
                filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">{item.lrNumber}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                              {/* Format Date */}
                              {new Date(parseInt(item.createdAt)).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.consignee || '-'}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.indent?.indentId || '-'}</td>
                         <td className="px-6 py-4 text-sm font-medium text-gray-900">₹ {item.freightRate?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                 item.status === 'Generated' || item.status === 'GENERATED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                 item.status === 'Uploaded' || item.status === 'UPLOADED' || item.status === 'POD_UPLOADED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                 'bg-green-50 text-green-700 border-green-200'
                             }`}>
                                 {item.status}
                             </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                             {(item.status === 'Generated' || item.status === 'GENERATED') && (
                                 <button 
                                    onClick={() => handleOpenUpload(item)}
                                    className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs hover:bg-amber-100"
                                 >
                                     <Upload className="w-3 h-3" /> Upload POD
                                 </button>
                             )}
                             {(item.status === 'Uploaded' || item.status === 'UPLOADED' || item.status === 'POD_UPLOADED') && (
                                  <button 
                                    onClick={() => handleOpenInvoice(item)}
                                    className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100"
                                  >
                                     <FileText className="w-3 h-3" /> Gen Invoice
                                 </button>
                             )}
                              {(item.status === 'Invoiced' || item.status === 'INVOICED') && (
                                  <button 
                                    onClick={() => handleOpenInvoice(item)}
                                    className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100"
                                  >
                                     <Eye className="w-3 h-3" /> View Invoice
                                 </button>
                             )}
                        </td>
                    </tr>
                ))
                )}
            </tbody>
        </table>
      </div>

      {selectedLR && (
          <>
            <UploadPODModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setIsUploadModalOpen(false)}
                lrId={selectedLR.id}
                lrNumber={selectedLR.lrNumber}
                onSuccess={handleUploadSuccess}
            />
            <InvoiceGeneratorModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                lrData={selectedLR}
                onSuccess={handleInvoiceSuccess}
            />
          </>
      )}

    </div>
  )
}
