import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Truck, MapPin, Package, User, Calendar, FileText, AlertCircle, Printer } from 'lucide-react';
import { GateEntryPanel } from './GateEntryPanel';

const GET_TRIP_BY_SLIP_TOKEN = gql`
  query GetTripBySlipToken($slipToken: String!) {
    getTripBySlipToken(slipToken: $slipToken) {
      id
      tripId
      slipToken
      originCity
      destinationCity
      vehicleType
      vehicleNumber
      driverName
      driverNumber
      status
      createdAt
      indent {
        indentNumber
        indentId
        sourceLocationName
        sourceAddress
        destinationAddress
        soldToPartyName
        consigneeName
        materialSummary
        totalWeightKg
        totalVolumeCbm
        totalOrderCount
        orderIds
        expectedDispatchDate
        expectedDeliveryDate
        agreedFreightAmount
        routeCode
      }
    }
  }
`;

export const TripSlipPage = () => {
  const { slipToken } = useParams<{ slipToken: string }>();
  const [liveStatus, setLiveStatus] = useState<string>('');

  const { data, loading, error } = useQuery<{ getTripBySlipToken: any }>(
    GET_TRIP_BY_SLIP_TOKEN,
    {
      variables: { slipToken: slipToken ?? '' },
      skip: !slipToken,
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    if (data?.getTripBySlipToken?.status) setLiveStatus(data.getTripBySlipToken.status);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data?.getTripBySlipToken) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-xl font-bold text-gray-700">Trip Slip Not Found</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          This link may have expired or the slip token is invalid. Please ask the transporter to share a fresh slip.
        </p>
      </div>
    );
  }

  const trip = data.getTripBySlipToken;
  const indent = trip.indent ?? {};
  const slipUrl = window.location.href;

  const fmtDate = (d?: string) => {
    if (!d) return '—';
    const n = Number(d);
    const date = isNaN(n) ? new Date(d) : new Date(n);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      {/* Action bar — hidden on print */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-900 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Slip — printable */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-6 print:bg-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Truck className="w-7 h-7" />
                <h1 className="text-2xl font-bold">Trip Slip</h1>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Driver must show this slip / QR at the gate
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-blue-200">Trip ID</p>
              <p className="text-2xl font-bold font-mono">{trip.tripId}</p>
              <p className="text-xs text-blue-100 mt-1">{indent.indentNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left + middle: trip details */}
          <div className="md:col-span-2 p-8 space-y-6">
            {/* Route */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Route
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Pickup</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {indent.sourceLocationName || indent.soldToPartyName || trip.originCity || '—'}
                  </p>
                  {indent.sourceAddress && (
                    <p className="text-xs text-gray-600 mt-1">{indent.sourceAddress}</p>
                  )}
                  {trip.originCity && indent.sourceLocationName && (
                    <p className="text-xs text-gray-500 mt-0.5">{trip.originCity}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Drop</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {indent.consigneeName || trip.destinationCity || '—'}
                  </p>
                  {indent.destinationAddress && (
                    <p className="text-xs text-gray-600 mt-1">{indent.destinationAddress}</p>
                  )}
                  {trip.destinationCity && indent.consigneeName && (
                    <p className="text-xs text-gray-500 mt-0.5">{trip.destinationCity}</p>
                  )}
                </div>
              </div>
              {indent.routeCode && (
                <p className="text-[11px] text-gray-500 mt-3 font-mono">
                  Route: <span className="font-semibold">{indent.routeCode}</span>
                </p>
              )}
            </section>

            <hr className="border-gray-100" />

            {/* Vehicle & Driver */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Vehicle &amp; Driver
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Vehicle</p>
                  <p className="font-bold text-gray-800 font-mono text-lg mt-0.5">
                    {trip.vehicleNumber || '—'}
                  </p>
                  <p className="text-xs text-gray-500">{trip.vehicleType}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Driver</p>
                  <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {trip.driverName || '—'}
                  </p>
                  {trip.driverNumber && (
                    <p className="text-xs text-gray-600 mt-0.5">📞 {trip.driverNumber}</p>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Cargo */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Cargo
              </h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Weight</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {indent.totalWeightKg ? `${(indent.totalWeightKg / 1000).toFixed(1)} T` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Volume</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {indent.totalVolumeCbm ? `${indent.totalVolumeCbm.toFixed(1)} cbm` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">SKUs</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {indent.totalOrderCount ?? '—'}
                  </p>
                </div>
              </div>
              {indent.materialSummary && (
                <p className="text-sm text-gray-600 mt-3 italic">"{indent.materialSummary}"</p>
              )}
            </section>

            {indent.orderIds && indent.orderIds.length > 0 && (
              <>
                <hr className="border-gray-100" />
                <section>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Sales Documents
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {indent.orderIds.map((doc: string) => (
                      <span
                        key={doc}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-mono rounded"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}

            <hr className="border-gray-100" />

            {/* Schedule + freight */}
            <section className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Dispatch
                </p>
                <p className="font-bold text-gray-800 mt-0.5">{fmtDate(indent.expectedDispatchDate)}</p>
              </div>
              {indent.agreedFreightAmount > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Agreed Freight</p>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    ₹{indent.agreedFreightAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right: QR Code */}
          <div className="bg-gray-50 p-6 flex flex-col items-center justify-center border-l border-gray-100 print:bg-white">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <QRCodeSVG value={slipUrl} size={180} level="M" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-4">
              Scan at Gate
            </p>
            <p className="text-[10px] text-gray-400 mt-1 break-all text-center px-2">
              {slipToken}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-3 text-[10px] text-gray-500 text-center border-t border-gray-100 print:bg-white">
          Generated by Swiss TMS — keep this slip with the driver at all times. Gate operators will scan the QR for verification.
        </div>
      </div>

      {/* Gate Entry (operator) — hidden on print */}
      <div className="max-w-4xl mx-auto mt-6 rounded-xl overflow-hidden shadow-sm print:hidden">
        <GateEntryPanel
          slipToken={slipToken ?? ''}
          currentTripStatus={liveStatus || trip.status}
          onStatusUpdate={(s) => setLiveStatus(s)}
        />
      </div>
    </div>
  );
};
