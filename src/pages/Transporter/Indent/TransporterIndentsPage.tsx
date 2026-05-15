import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Truck, User, Calendar, X } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';

const GET_INDENTS = gql`
  query GetTransporterIndentsByStatus($status: String) {
    getAllTransporterIndents(status: $status) {
      id
      indentId
      indentNumber
      transporterEmail
      customerName
      originCity
      destinationCity
      pickupDate
      goodsType
      vehicleType
      status
      createdAt
    }
  }
`;

const ACCEPT_INDENT = gql`
  mutation AcceptIndent($input: AcceptIndentInput!) {
    acceptIndent(input: $input) {
      id
      indentId
      status
    }
  }
`;

const REJECT_INDENT = gql`
  mutation RejectIndent($id: ID!, $remarks: String) {
    rejectIndent(id: $id, remarks: $remarks) {
      id
      indentId
      status
    }
  }
`;

type SubTab = 'new' | 'accepted' | 'rejected';

const STATUS_MAP: Record<SubTab, string> = {
  new: 'PENDING',
  accepted: 'ALLOCATED',
  rejected: 'CANCELLED',
};

interface AcceptForm {
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  driverNumber: string;
  expectedPickup: string;
  expectedArrival: string;
}

export const TransporterIndentsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('new');
  const [search, setSearch] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptForm, setAcceptForm] = useState<AcceptForm>({
    vehicleNumber: '',
    vehicleType: '32FT Container',
    driverName: '',
    driverNumber: '',
    expectedPickup: '',
    expectedArrival: '',
  });

  const { data, loading, refetch } = useQuery<{ getAllTransporterIndents: any[] }>(GET_INDENTS, {
    variables: { status: STATUS_MAP[activeSubTab] },
    fetchPolicy: 'network-only',
  });

  const [acceptIndent, { loading: accepting }] = useMutation(ACCEPT_INDENT, {
    onCompleted: () => {
      toast.success('Indent accepted — trip created');
      setAcceptingId(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const [rejectIndent, { loading: rejecting }] = useMutation(REJECT_INDENT, {
    onCompleted: () => {
      toast.success('Indent rejected');
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const indents = (data?.getAllTransporterIndents || []).filter((i: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.indentId.toLowerCase().includes(s) ||
      (i.customerName || '').toLowerCase().includes(s) ||
      (i.originCity || '').toLowerCase().includes(s) ||
      (i.destinationCity || '').toLowerCase().includes(s)
    );
  });

  const handleAcceptSubmit = (indentId: string) => {
    if (!acceptForm.vehicleNumber.trim()) {
      toast.error('Vehicle number is required');
      return;
    }
    acceptIndent({
      variables: {
        input: {
          id: indentId,
          vehicleNumber: acceptForm.vehicleNumber,
          vehicleType: acceptForm.vehicleType,
          driverName: acceptForm.driverName,
          driverNumber: acceptForm.driverNumber,
          expectedPickup: acceptForm.expectedPickup || null,
          expectedArrival: acceptForm.expectedArrival || null,
        },
      },
    });
  };

  const handleReject = (id: string) => {
    rejectIndent({ variables: { id } });
  };

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'new', label: 'New Indents' },
    { key: 'accepted', label: 'Accepted Indents' },
    { key: 'rejected', label: 'Rejected Indents' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
        <h2 className="text-xl font-bold text-gray-800">Indents</h2>
        <p className="text-sm text-gray-500 mt-1">Accept or reject incoming transport indents</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100 px-6 pt-3 gap-1">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveSubTab(tab.key); setAcceptingId(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeSubTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Indent ID, Route, Customer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading indents...</div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Indent ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Pickup Date</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Goods</th>
                  {activeSubTab === 'new' && (
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {indents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No {activeSubTab} indents found.
                    </td>
                  </tr>
                ) : (
                  indents.map((item: any) => (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-blue-600">{item.indentId}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.originCity && item.destinationCity
                            ? `${item.originCity} → ${item.destinationCity}`
                            : item.customerName || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.pickupDate
                            ? new Date(parseInt(item.pickupDate)).toLocaleDateString('en-IN')
                            : new Date(parseInt(item.createdAt)).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{item.goodsType || item.vehicleType || '—'}</span>
                        </td>
                        {activeSubTab === 'new' && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setAcceptingId(acceptingId === item.id ? null : item.id);
                                  setAcceptForm({ vehicleNumber: '', vehicleType: item.vehicleType || '32FT Container', driverName: '', driverNumber: '', expectedPickup: '', expectedArrival: '' });
                                }}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                disabled={rejecting}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>

                      {/* Inline Accept Form */}
                      {activeSubTab === 'new' && acceptingId === item.id && (
                        <tr>
                          <td colSpan={5} className="px-6 pb-5 bg-blue-50/60">
                            <div className="border border-blue-200 rounded-xl p-5 bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-gray-800">Vehicle & Driver Details (On Accept)</h4>
                                <button onClick={() => setAcceptingId(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                  <X className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle No. *</label>
                                  <input
                                    value={acceptForm.vehicleNumber}
                                    onChange={(e) => setAcceptForm((p) => ({ ...p, vehicleNumber: e.target.value }))}
                                    placeholder="MH12AB1234"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Type</label>
                                  <select
                                    value={acceptForm.vehicleType}
                                    onChange={(e) => setAcceptForm((p) => ({ ...p, vehicleType: e.target.value }))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                  >
                                    <option>TATA Ace</option>
                                    <option>Pickup 8ft</option>
                                    <option>TATA 407</option>
                                    <option>Eicher 14ft</option>
                                    <option>24FT Container</option>
                                    <option>32FT Container</option>
                                    <option>Truck 10 Ton</option>
                                    <option>Trailer 40ft</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
                                  <div className="relative">
                                    <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      value={acceptForm.driverName}
                                      onChange={(e) => setAcceptForm((p) => ({ ...p, driverName: e.target.value }))}
                                      placeholder="Enter Driver Name"
                                      className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Mobile</label>
                                  <div className="relative">
                                    <Truck className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      value={acceptForm.driverNumber}
                                      onChange={(e) => setAcceptForm((p) => ({ ...p, driverNumber: e.target.value }))}
                                      placeholder="Enter Mobile No."
                                      className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Pickup</label>
                                  <div className="relative">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="date"
                                      value={acceptForm.expectedPickup}
                                      onChange={(e) => setAcceptForm((p) => ({ ...p, expectedPickup: e.target.value }))}
                                      className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Arrival</label>
                                  <div className="relative">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="date"
                                      value={acceptForm.expectedArrival}
                                      onChange={(e) => setAcceptForm((p) => ({ ...p, expectedArrival: e.target.value }))}
                                      className="w-full pl-8 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleAcceptSubmit(item.id)}
                                  disabled={accepting}
                                  className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  {accepting ? 'Submitting...' : 'Submit'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};
