import React, { useState, useEffect } from 'react';
import { Search, Gavel, Clock, CheckCircle, X, Users, IndianRupee, RefreshCw } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const GET_OPEN_BID_INDENTS = gql`
  query GetAllOpenBidIndents {
    getAllOpenBidIndents {
      id
      indentId
      indentNumber
      originCity
      destinationCity
      vehicleType
      biddingEndDate
      minimumBidAmount
      status
      totalBids
      myBid {
        id
        quotedRate
        remarks
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
      transporterEmail
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
    pollInterval: 10000,
  });

  // Real-time: socket broadcast when any new bidding opens
  useEffect(() => {
    const token =
      localStorage.getItem('transporterToken') ||
      localStorage.getItem('token');
    if (!token) return;

    const apiBase = (import.meta as any).env?.VITE_API_URL?.replace('/graphql', '')
      ?? 'http://localhost:4001';

    const socket = io(apiBase, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('bidding:newIndent', (indent: any) => {
      toast.info(
        `🔔 New bidding open: ${indent.originCity} → ${indent.destinationCity} (${indent.vehicleType})`,
        { autoClose: 6000 },
      );
      refetch();
    });

    // When a bid is awarded, that indent leaves the open list — refresh
    socket.on('bidding:closed', (info: any) => {
      // Close the detail panel if user was looking at the closed indent
      setSelectedIndent((prev: any) => prev?.indentNumber === info.indentNumber ? null : prev);
      refetch();
    });

    return () => { socket.disconnect(); };
  }, [refetch]);

  const [placeBid, { loading: placing }] = useMutation(PLACE_BID, {
    onCompleted: () => {
      toast.success('Bid submitted successfully!');
      setBidForm({ quotedRate: '', remarks: '' });
      refetch(); // refresh to update myBid in the list
    },
    onError: (e) => toast.error(e.message),
  });

  const indents: any[] = (data?.getAllOpenBidIndents || []).filter((i: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (i.indentNumber || i.indentId).toLowerCase().includes(s) ||
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

  // Use myBid from the server — correctly scoped to the logged-in transporter
  const myBid = selectedIndent?.myBid;

  // Keep selected indent in sync after refetch (so myBid updates live)
  const selectedFromList = selectedIndent
    ? indents.find((i) => i.id === selectedIndent.id)
    : null;
  const syncedSelectedIndent = selectedFromList ?? selectedIndent;

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Open Indents Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col transition-all duration-300 ${syncedSelectedIndent ? 'w-3/5' : 'w-full'}`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gavel className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Open Indents for Bidding</h2>
                <p className="text-xs text-gray-500 mt-0.5">{indents.length} open · refreshes every 10s</p>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors text-purple-600"
              title="Refresh now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route, indent ID, vehicle type..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading bidding indents...</div>
          ) : indents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-purple-300" />
              </div>
              <p className="text-gray-600 text-sm font-semibold">No open bidding indents</p>
              <p className="text-gray-400 text-xs mt-1">
                Bidding opens automatically when a transporter rejects an assigned indent.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Indent</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Closing</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bids</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {indents.map((indent: any) => {
                  const expired = isExpired(indent.biddingEndDate);
                  // ✅ myBid from server — only true if THIS transporter has bid
                  const iHaveBid = !!indent.myBid;
                  const isSelected = syncedSelectedIndent?.id === indent.id;

                  return (
                    <tr
                      key={indent.id}
                      onClick={() => { setSelectedIndent(indent); setBidForm({ quotedRate: indent.myBid?.quotedRate?.toString() || '', remarks: indent.myBid?.remarks || '' }); }}
                      className={`cursor-pointer transition-colors hover:bg-purple-50/30 ${isSelected ? 'bg-purple-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-purple-600">
                          {indent.indentNumber || indent.indentId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {indent.originCity} → {indent.destinationCity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{indent.vehicleType}</td>
                      <td className="px-4 py-3">
                        <p className={`text-xs font-semibold flex items-center gap-1 ${expired ? 'text-red-500' : 'text-amber-600'}`}>
                          <Clock className="w-3 h-3" />
                          {timeLeft(indent.biddingEndDate)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {indent.totalBids ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {iHaveBid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-md">
                            <CheckCircle className="w-3.5 h-3.5" />
                            ₹{indent.myBid.quotedRate.toLocaleString('en-IN')}
                          </span>
                        ) : expired ? (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs font-semibold rounded-md">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-200 text-xs font-semibold rounded-md flex items-center gap-1">
                            <Gavel className="w-3 h-3" /> Bid
                          </span>
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

      {/* Right: Bid Panel */}
      {syncedSelectedIndent && (
        <div className="w-2/5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white rounded-t-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Indent Details & Bid</p>
              <h3 className="text-base font-bold text-purple-700">
                {syncedSelectedIndent.indentNumber || syncedSelectedIndent.indentId}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIndent(null)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-4 overflow-auto">
            {/* Route summary */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-semibold text-gray-800">
                  {syncedSelectedIndent.originCity} → {syncedSelectedIndent.destinationCity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-semibold text-gray-800">{syncedSelectedIndent.vehicleType}</span>
              </div>
              {syncedSelectedIndent.minimumBidAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Min. Bid</span>
                  <span className="font-semibold text-gray-800">
                    ₹{syncedSelectedIndent.minimumBidAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Total Bids</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  {syncedSelectedIndent.totalBids ?? 0} transporter{(syncedSelectedIndent.totalBids ?? 0) !== 1 ? 's' : ''} bid
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Closes</span>
                <span className={`font-semibold text-xs ${isExpired(syncedSelectedIndent.biddingEndDate) ? 'text-red-600' : 'text-amber-600'}`}>
                  {new Date(parseInt(syncedSelectedIndent.biddingEndDate)).toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                  })}
                </span>
              </div>
            </div>

            {/* My bid status / bid form */}
            {syncedSelectedIndent.myBid ? (
              /* ── Already bid — show current bid + allow update ── */
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800">Your Bid</p>
                    <p className="text-lg font-bold text-green-700 mt-0.5">
                      ₹{syncedSelectedIndent.myBid.quotedRate.toLocaleString('en-IN')}
                    </p>
                    {syncedSelectedIndent.myBid.remarks && (
                      <p className="text-xs text-green-600 mt-1 italic">"{syncedSelectedIndent.myBid.remarks}"</p>
                    )}
                    <p className="text-xs text-green-500 mt-1 capitalize">
                      Status: {syncedSelectedIndent.myBid.status}
                    </p>
                  </div>
                </div>

                {!isExpired(syncedSelectedIndent.biddingEndDate) && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-medium">Update your bid:</p>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={bidForm.quotedRate}
                        onChange={(e) => setBidForm((p) => ({ ...p, quotedRate: e.target.value }))}
                        placeholder="New rate"
                        className="w-full pl-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <textarea
                      value={bidForm.remarks}
                      onChange={(e) => setBidForm((p) => ({ ...p, remarks: e.target.value }))}
                      placeholder="Update remarks (optional)"
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                    <button
                      onClick={handlePlaceBid}
                      disabled={placing || !bidForm.quotedRate}
                      className="w-full py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      {placing ? 'Updating...' : 'Update Bid'}
                    </button>
                  </div>
                )}
              </div>
            ) : isExpired(syncedSelectedIndent.biddingEndDate) ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-red-700">Bidding Deadline Passed</p>
                <p className="text-xs text-red-500 mt-1">This indent is no longer accepting bids</p>
              </div>
            ) : (
              /* ── Place new bid ── */
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={bidForm.quotedRate}
                      onChange={(e) => setBidForm((p) => ({ ...p, quotedRate: e.target.value }))}
                      placeholder="Enter your competitive rate"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
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
                    placeholder="e.g. Can deliver within 24 hours"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>
                <button
                  onClick={handlePlaceBid}
                  disabled={placing || !bidForm.quotedRate}
                  className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md mt-auto"
                >
                  <Gavel className="w-4 h-4" />
                  {placing ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
