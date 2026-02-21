import React, { useState } from 'react';
import { Search, Filter, Truck, Calendar, MapPin, User, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_TRANSPORTER_INDENTS = gql`
  query GetAllTransporterIndents($status: String) {
    getAllTransporterIndents(status: $status) {
      id
      indentId
      customerName
      contractId
      vehicleNumber
      vehicleType
      ownerType
      marketTripCost
      status
      loadingStartTime
    }
  }
`;

interface Indent {
  id: string;
  indentId: string;
  customerName: string;
  contractId: string;
  vehicleNumber: string;
  vehicleType: string;
  ownerType: string;
  marketTripCost: number;
  status: string;
  loadingStartTime: string;
}

interface IndentData {
  getAllTransporterIndents: Indent[];
}

interface IndentVars {
  status?: string;
}

export const VehicleAllocationList = ({ onAllocateClick }: { onAllocateClick: (indentId: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All Vehicles');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, loading, error } = useQuery<IndentData, IndentVars>(GET_TRANSPORTER_INDENTS, {
    variables: { status: statusFilter !== 'All' ? statusFilter : undefined },
    fetchPolicy: 'network-only'
  });

  if (loading) return <div className="p-6 text-center text-gray-500">Loading indents...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error loading indents: {error.message}</div>;

  const indents: Indent[] = data?.getAllTransporterIndents || [];

  // Extract unique customers
  const customers = Array.from(new Set(indents.map(i => i.customerName).filter(Boolean)));

  const filteredData = indents.filter(item => {
    const matchesSearch = (item.indentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (item.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCustomer = customerFilter === 'All Customers' || item.customerName === customerFilter;
    
    // Check for both casing just in case, though backend likely returns uppercase
    const ownerType = item.ownerType?.toUpperCase() || '';
    const matchesVehicleType = vehicleTypeFilter === 'All Vehicles' 
        || (vehicleTypeFilter === 'Market' && ownerType === 'MARKET') 
        || (vehicleTypeFilter === 'Own' && ownerType === 'OWN');

    return matchesSearch && matchesCustomer && matchesVehicleType;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vehicle Allocation Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and allocate vehicles to indents</p>
        </div>
        <div className="flex gap-3">
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden p-1 gap-1">
                {['All', 'PENDING', 'ALLOCATED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status === 'PENDING' ? 'PENDING' : status === 'ALLOCATED' ? 'ALLOCATED' : 'All')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            (statusFilter === status || (statusFilter === 'All' && status === 'All'))
                            ? 'bg-amber-100 text-amber-700' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {status === 'All' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative col-span-2">
          <input
            type="text"
            placeholder="Search Indent ID, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        <div className="relative">
             <select 
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
             >
                <option>All Customers</option>
                {customers.map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
             </select>
             <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <div className="relative">
             <select 
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
             >
                <option>All Vehicles</option>
                <option value="Own">Own Fleet</option>
                <option value="Market">Market Vehicle</option>
             </select>
             <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Indent ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle No</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip Cost</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredData.length === 0 ? (
                <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
                        No indents found.
                    </td>
                </tr>
            ) : (
                filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-amber-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors">{item.indentId}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.customerName || '-'}</td>
                <td className="px-6 py-4 text-xs text-gray-500 font-mono">{item.contractId || '-'}</td>
                <td className="px-6 py-4">
                    {item.vehicleNumber ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {item.vehicleNumber}
                         </span>
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.ownerType || '-'}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.marketTripCost ? `₹ ${item.marketTripCost.toLocaleString()}` : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.status === 'ALLOCATED'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {item.status === 'ALLOCATED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {item.status === 'PENDING' ? (
                    <button
                      onClick={() => onAllocateClick(item.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-all hover:shadow-md"
                    >
                      Allocate
                    </button>
                  ) : (
                     <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                  )}
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {filteredData.length} entries</span>
          <div className="flex gap-2">
              <button disabled className="p-1 px-2 border border-gray-300 bg-white rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-xs flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3"/> Previous
              </button>
              <button disabled className="p-1 px-2 border border-gray-300 bg-white rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-xs flex items-center gap-1">
                  Next <ChevronRight className="w-3 h-3"/>
              </button>
          </div>
      </div>
    </div>
  );
};
