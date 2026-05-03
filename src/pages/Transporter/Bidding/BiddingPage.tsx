import React, { useState } from 'react';
import { Search, Gavel, Clock, CheckCircle, X } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';

const GET_OPEN_BID_INDENTS = gql`
  query GetAllOpenBidIndents {
    getAllOpenBidIndents {
      id
      indentId
      originCity
      destinationCity
      vehicleType
      biddingEndDate
      status
      bids {
        id
        quotedRate
        status
        createdAt
      }
    }
  }
`;

const PLACE_BID = gql`
  mutation PlaceBid($input: PlaceBidInput!) {
    placeBid(input: $input) {
      id
      quotedRate
      remarks
      status
      createdAt
    }
  }
`;

const isExpired = (dateStr: string) => new Date(parseInt(dateStr)) < new Date();

const timeLeft = (dateStr: string) => {
  const diff = new Date(parseInt(dateStr)).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
};

export const BiddingPage = () => {
  const [search, setSearch] = useState('');
  const [selectedIndent, setSelectedIndent] = useState<any>(null);
  const [bidForm, setBidForm] = useState({ quotedRate: '', remarks: '' });

  const { data, loading, refetch } = useQuery(GET_OPEN_BID_INDENTS, {
    fetchPolicy: 'network-only',
    pollInterval: 60000,
  });

  const [placeBid, { loading: placing }] = useMutation(PLACE_BID, {
    onCompleted: () => {
      toast.success('Bid submitted successfully!');
      setBidForm({ quotedRate: '', remarks: '' });
      setSelectedIndent(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const indents: any[] = (data?.getAllOpenBidIndents || []).filter((i: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.indentId.toLowerCase().includes(s) ||
      i.originCity.toLowerCase().includes(s) ||
      i.destinationCity.toLowerCase().includes(s) ||
      i.vehicleType.toLowerCase().includes(s)
    );
  });

  const handlePlaceBid = () => {
    if (!bidForm.quotedRate || isNaN(Number(bidForm.quotedRate))) {
      toast.error('Please enter a valid rate');
      return;
    }
    placeBid({
      variables: {
        input: {
          bidIndentId: selectedIndent.id,
          quotedRate: parseFloat(bidForm.quotedRate),
          remarks: bidForm.remarks || undefined,
        },
      },
    });
  };

  const myBid = selectedIndent?.bids?.[0];

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Open Indents Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all duration-300 ${selectedIndent ? 'w-3/5' : 'w-full'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gavel className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Open Indents for Bidding</h2>
              <p className="text-sm text-gray-500 mt-0.5">Place competitive bids on available transport indents</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Route / Indent ID"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading open indents...</div>
          ) : indents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-purple-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No open indents for bidding</p>
              <p className="text-gray-400 text-xs mt-1">Check back later for new bidding opportunities</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Indent ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle Type</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bidding End Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {indents.map((indent: any) => {
                  const expired = isExpired(indent.biddingEndDate);
                  const hasBid = indent.bids?.length > 0;
                  const isSelected = selectedIndent?.id === indent.id;

                  return (
                    <tr
                      key={indent.id}
                      className={`transition-colors hover:bg-purple-50/30 ${isSelected ? 'bg-purple-50/50' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-purple-600">{indent.indentId}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {indent.originCity} → {indent.destinationCity}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{indent.vehicleType}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm text-gray-700">
                            {new Date(parseInt(indent.biddingEndDate)).toLocaleString('en-IN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', hour12: false,
                            })}
                          </p>
                          <p className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${expired ? 'text-red-500' : 'text-amber-500'}`}>
                            <Clock className="w-3 h-3" />
                            {timeLeft(indent.biddingEndDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {hasBid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-md">
                            <CheckCircle className="w-3.5 h-3.5" /> Bid Placed
                          </span>
                        ) : expired ? (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-semibold rounded-md">
                            Expired
                          </span>
                        ) : (
                          <button
                            onClick={() => { setSelectedIndent(indent); setBidForm({ quotedRate: '', remarks: '' }); }}
                            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                          >
                            <Gavel className="w-3.5 h-3.5" /> Place Bid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: Place Bid Panel */}
      {selectedIndent && (
        <div className="w-2/5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Panel Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white rounded-t-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Place Your Bid</p>
              <h3 className="text-lg font-bold text-purple-700">{selectedIndent.indentId}</h3>
            </div>
            <button
              onClick={() => setSelectedIndent(null)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-5">
            {/* Route summary card */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold text-gray-800">{selectedIndent.originCity} → {selectedIndent.destinationCity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vehicle Type</span>
                <span className="font-semibold text-gray-800">{selectedIndent.vehicleType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bidding Closes</span>
                <span className={`font-semibold ${isExpired(selectedIndent.biddingEndDate) ? 'text-red-600' : 'text-amber-600'}`}>
                  {new Date(parseInt(selectedIndent.biddingEndDate)).toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </span>
              </div>
            </div>

            {/* Already bid message */}
            {myBid ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">Bid Already Placed</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Your rate: <span className="font-bold">₹{myBid.quotedRate.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1 capitalize">Status: {myBid.status}</p>
                </div>
              </div>
            ) : isExpired(selectedIndent.biddingEndDate) ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-red-700">Bidding Deadline Passed</p>
                <p className="text-xs text-red-500 mt-1">This indent is no longer accepting bids</p>
              </div>
            ) : (
              <>
                {/* Bid Form */}
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Quoted Rate (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₹</span>
                      <input
                        type="number"
                        value={bidForm.quotedRate}
                        onChange={(e) => setBidForm((p) => ({ ...p, quotedRate: e.target.value }))}
                        placeholder="Enter Rate"
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={bidForm.remarks}
                      onChange={(e) => setBidForm((p) => ({ ...p, remarks: e.target.value }))}
                      placeholder="Enter Remarks"
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePlaceBid}
                  disabled={placing || !bidForm.quotedRate}
                  className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <Gavel className="w-4 h-4" />
                  {placing ? 'Submitting Bid...' : 'Submit Bid'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
