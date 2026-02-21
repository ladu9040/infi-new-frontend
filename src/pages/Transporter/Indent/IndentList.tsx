import React, { useState } from 'react';
import { Search, Plus, Filter, Package, Truck, User } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { CreateIndentModal } from './CreateIndentModal';

const GET_ALL_INDENTS = gql`
  query GetAllTransporterIndents {
    getAllTransporterIndents {
      id
      indentId
      customerName
      vehicleType
      status
      createdAt
    }
  }
`;

interface Indent {
    id: string;
    indentId: string;
    customerName: string;
    vehicleType: string;
    status: string;
    createdAt: string;
}

interface GetAllIndentsData {
    getAllTransporterIndents: Indent[];
}

export const IndentList = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data, loading, error, refetch } = useQuery<GetAllIndentsData>(GET_ALL_INDENTS, {
        fetchPolicy: 'network-only'
    });

    if (loading) return <div className="p-6 text-center text-gray-500">Loading orders...</div>;
    if (error) return <div className="p-6 text-center text-red-500">Error loading orders: {error.message}</div>;

    const indents = data?.getAllTransporterIndents || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
           {/* Header */}
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Indents / Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Manage incoming transport orders</p>
            </div>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-amber-700 transition-all flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Create New Indent
            </button>
          </div>
    
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 bg-white flex gap-4">
               <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search Indent ID, Customer..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
               </div>
          </div>
    
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Indent ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vehicle Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {indents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                No indents found. create one to get started.
                            </td>
                        </tr>
                    ) : (
                    indents.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-6 py-4">
                                <span className="text-sm font-medium text-gray-900">{item.indentId}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(parseInt(item.createdAt)).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{item.customerName || '-'}</td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.vehicleType}</td>
                            <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                     item.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                     item.status === 'ALLOCATED' ? 'bg-green-50 text-green-700 border-green-200' :
                                     'bg-gray-50 text-gray-700 border-gray-200'
                                 }`}>
                                     {item.status}
                                 </span>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
          </div>

          {isCreateModalOpen && (
              <CreateIndentModal 
                  onClose={() => setIsCreateModalOpen(false)}
                  onSuccess={() => refetch()}
              />
          )}

        </div>
      )
};
