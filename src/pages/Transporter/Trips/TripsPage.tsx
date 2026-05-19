import React, { useState, useRef } from 'react';
import { Search, Upload, Plus, Eye, CheckCircle2, Clock, Truck, Share2 } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { TripSlipShareModal } from '../TripSlip/TripSlipShareModal';

const GET_ALL_TRIPS = gql`
  query GetAllTrips {
    getAllTrips {
      id
      tripId
      slipToken
      indentId
      originCity
      destinationCity
      vehicleType
      vehicleNumber
      driverName
      driverNumber
      status
      podUrl
      podStatus
      extraCharges {
        chargeType
        amount
        remarks
      }
      createdAt
      indent {
        indentNumber
      }
    }
  }
`;

const UPLOAD_POD = gql`
  mutation UploadTripPOD($tripId: ID!, $podUrl: String!) {
    uploadTripPOD(tripId: $tripId, podUrl: $podUrl) {
      id
      podStatus
      podUrl
    }
  }
`;

const UPDATE_TRIP_STATUS = gql`
  mutation UpdateTripStatus($tripId: ID!, $status: TripStatus!) {
    updateTripStatus(tripId: $tripId, status: $status) {
      id
      status
    }
  }
`;

const ADD_EXTRA_CHARGE = gql`
  mutation AddExtraCharge($input: AddExtraChargeInput!) {
    addExtraCharge(input: $input) {
      id
      extraCharges {
        chargeType
        amount
        remarks
      }
    }
  }
`;

type DetailTab = 'info' | 'pod' | 'charges';

const POD_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  UPLOADED: 'Uploaded',
  APPROVED: 'Approved',
};

const TRIP_STATUS_COLOR: Record<string, string> = {
  IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const POD_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-600',
  UPLOADED: 'text-green-600',
  APPROVED: 'text-blue-600',
};

export const TripsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [shareTrip, setShareTrip] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('info');
  const [chargeForm, setChargeForm] = useState({ chargeType: '', amount: '', remarks: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, loading, refetch } = useQuery<{ getAllTrips: any[] }>(GET_ALL_TRIPS, { fetchPolicy: 'network-only' });

  const [uploadPOD, { loading: uploading }] = useMutation<{ uploadTripPOD: any }>(UPLOAD_POD, {
    onCompleted: (d) => {
      toast.success('POD uploaded successfully');
      setSelectedTrip((prev: any) => prev ? { ...prev, podStatus: d.uploadTripPOD.podStatus, podUrl: d.uploadTripPOD.podUrl } : prev);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const [updateStatus] = useMutation(UPDATE_TRIP_STATUS, {
    onCompleted: () => { toast.success('Trip status updated'); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [addCharge, { loading: addingCharge }] = useMutation<{ addExtraCharge: any }>(ADD_EXTRA_CHARGE, {
    onCompleted: (d) => {
      toast.success('Extra charge added');
      setChargeForm({ chargeType: '', amount: '', remarks: '' });
      setSelectedTrip((prev: any) => prev ? { ...prev, extraCharges: d.addExtraCharge.extraCharges } : prev);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const trips: any[] = (data?.getAllTrips || []).filter((t: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.tripId.toLowerCase().includes(s) ||
      (t.originCity || '').toLowerCase().includes(s) ||
      (t.destinationCity || '').toLowerCase().includes(s)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTrip) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, PDF allowed');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      uploadPOD({ variables: { tripId: selectedTrip.id, podUrl: reader.result as string } });
    };
    reader.readAsDataURL(file);
  };

  const handleAddCharge = () => {
    if (!chargeForm.chargeType || !chargeForm.amount) {
      toast.error('Charge type and amount are required');
      return;
    }
    addCharge({
      variables: {
        input: {
          tripId: selectedTrip.id,
          chargeType: chargeForm.chargeType,
          amount: parseFloat(chargeForm.amount),
          remarks: chargeForm.remarks,
        },
      },
    });
  };

  const detailTabs: { key: DetailTab; label: string }[] = [
    { key: 'info', label: 'Trip Info' },
    { key: 'pod', label: 'POD Upload' },
    { key: 'charges', label: 'Extra Charges' },
  ];

  return (
    <div className="flex gap-4 h-full">
      {/* Trip List */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${selectedTrip ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Trip Details</h2>
          <p className="text-sm text-gray-500 mt-1">Track trips and manage POD uploads</p>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Trip ID / Indent ID / Route..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading trips...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trip ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">POD</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                      No trips found. Accept an indent to create a trip.
                    </td>
                  </tr>
                ) : (
                  trips.map((trip: any) => (
                    <tr
                      key={trip.id}
                      className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${selectedTrip?.id === trip.id ? 'bg-indigo-50/50' : ''}`}
                      onClick={() => { setSelectedTrip(trip); setDetailTab('info'); }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-indigo-600">{trip.tripId}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {trip.originCity && trip.destinationCity
                          ? `${trip.originCity} → ${trip.destinationCity}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${TRIP_STATUS_COLOR[trip.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {trip.status === 'IN_TRANSIT' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${POD_STATUS_COLOR[trip.podStatus] || 'text-gray-500'}`}>
                          {POD_STATUS_LABEL[trip.podStatus] || trip.podStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); setDetailTab('info'); }}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          {trip.slipToken && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShareTrip(trip); }}
                              title="Share Trip Slip"
                              className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1"
                            >
                              <Share2 className="w-3 h-3" /> Share
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Trip Detail Panel */}
      {selectedTrip && (
        <div className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
            <div>
              <p className="text-xs text-gray-500 font-medium">Trip ID</p>
              <h3 className="text-lg font-bold text-indigo-700">{selectedTrip.tripId}</h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedTrip.slipToken && (
                <button
                  onClick={() => setShareTrip(selectedTrip)}
                  className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 py-1.5 flex items-center gap-1.5 font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Slip
                </button>
              )}
              <button
                onClick={() => setSelectedTrip(null)}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          {/* Detail Sub-tabs */}
          <div className="flex border-b border-gray-100 px-5 pt-3 gap-1">
            {detailTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDetailTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  detailTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-5">
            {/* Trip Info */}
            {detailTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Route" value={selectedTrip.originCity && selectedTrip.destinationCity ? `${selectedTrip.originCity} → ${selectedTrip.destinationCity}` : '—'} />
                  <InfoField label="Vehicle Type" value={selectedTrip.vehicleType || '—'} />
                  <InfoField label="Vehicle Number" value={selectedTrip.vehicleNumber || '—'} />
                  <InfoField label="Driver Name" value={selectedTrip.driverName || '—'} />
                  <InfoField label="Status" value={selectedTrip.status.replace('_', ' ')} />
                  <InfoField label="POD Status" value={POD_STATUS_LABEL[selectedTrip.podStatus]} />
                  <InfoField label="Created" value={new Date(parseInt(selectedTrip.createdAt)).toLocaleDateString('en-IN')} />
                </div>

                {/* Update Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Update Trip Status</p>
                  <div className="flex gap-2">
                    {selectedTrip.status !== 'DELIVERED' && (
                      <button
                        onClick={() => updateStatus({ variables: { tripId: selectedTrip.id, status: 'DELIVERED' } })}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    )}
                    {selectedTrip.status !== 'IN_TRANSIT' && selectedTrip.status !== 'DELIVERED' && (
                      <button
                        onClick={() => updateStatus({ variables: { tripId: selectedTrip.id, status: 'IN_TRANSIT' } })}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark In Transit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* POD Upload */}
            {detailTab === 'pod' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600 mb-1">Upload POD</p>
                  <p className="text-xs text-gray-400 mb-4">Only JPG, PNG, PDF allowed, max 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </button>
                </div>

                {selectedTrip.podStatus !== 'PENDING' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">POD {POD_STATUS_LABEL[selectedTrip.podStatus]}</p>
                      <p className="text-xs text-green-600">Proof of delivery has been recorded</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extra Charges */}
            {detailTab === 'charges' && (
              <div className="space-y-5">
                {/* Existing charges */}
                {selectedTrip.extraCharges?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Added Charges</p>
                    <div className="space-y-2">
                      {selectedTrip.extraCharges.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                          <span className="text-sm font-medium text-gray-700">{c.chargeType}</span>
                          <div className="flex items-center gap-4">
                            {c.remarks && <span className="text-xs text-gray-400">{c.remarks}</span>}
                            <span className="text-sm font-bold text-gray-800">₹{c.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new charge */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3 uppercase flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add Extra Charges
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Charge Type</label>
                      <select
                        value={chargeForm.chargeType}
                        onChange={(e) => setChargeForm((p) => ({ ...p, chargeType: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="">Select Charge Type</option>
                        <option value="Loading Charges">Loading Charges</option>
                        <option value="Unloading Charges">Unloading Charges</option>
                        <option value="Toll Charges">Toll Charges</option>
                        <option value="Detention Charges">Detention Charges</option>
                        <option value="Late Delivery">Late Delivery</option>
                        <option value="Damage Charges">Damage Charges</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={chargeForm.amount}
                        onChange={(e) => setChargeForm((p) => ({ ...p, amount: e.target.value }))}
                        placeholder="Enter Amount"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                      <textarea
                        value={chargeForm.remarks}
                        onChange={(e) => setChargeForm((p) => ({ ...p, remarks: e.target.value }))}
                        placeholder="Enter Remarks"
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddCharge}
                        disabled={addingCharge}
                        className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {addingCharge ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {shareTrip && (
        <TripSlipShareModal
          open={!!shareTrip}
          onClose={() => setShareTrip(null)}
          slipToken={shareTrip.slipToken}
          tripId={shareTrip.tripId}
          indentNumber={shareTrip.indent?.indentNumber}
          pickup={shareTrip.originCity}
          drop={shareTrip.destinationCity}
          vehicleNumber={shareTrip.vehicleNumber}
          driverName={shareTrip.driverName}
          driverNumber={shareTrip.driverNumber}
        />
      )}
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-800">{value}</p>
  </div>
);
