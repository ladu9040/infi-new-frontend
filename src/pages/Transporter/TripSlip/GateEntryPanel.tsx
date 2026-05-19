import { useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'react-toastify';
import { CheckCircle2, Camera, LogIn, LogOut, MapPin, X, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';

const GET_GATE_ENTRIES = gql`
  query GetGateEntriesBySlipToken($slipToken: String!) {
    getGateEntriesBySlipToken(slipToken: $slipToken) {
      id
      gateEntryId
      gateType
      location
      capturedAt
      operatorName
      notes
      photos
      odometerKm
      sealNumber
    }
  }
`;

const RECORD_GATE_ENTRY = gql`
  mutation RecordGateEntry($input: RecordGateEntryInput!) {
    recordGateEntry(input: $input) {
      gateEntry {
        id
        gateEntryId
        gateType
        location
        capturedAt
        operatorName
        photos
      }
      newTripStatus
    }
  }
`;

type GateType = 'GATE_IN' | 'GATE_OUT';
type GateLocation = 'PICKUP' | 'DROP';

interface Props {
  slipToken: string;
  currentTripStatus: string;
  onStatusUpdate?: (newStatus: string) => void;
}

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: 'In Transit to Pickup',
  AT_PICKUP: 'At Pickup Gate',
  LOADED: 'Loaded · In Transit to Drop',
  AT_DROP: 'At Drop Gate',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  AT_PICKUP: 'bg-amber-100 text-amber-700',
  LOADED: 'bg-indigo-100 text-indigo-700',
  AT_DROP: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-200 text-gray-600',
};

export const GateEntryPanel = ({ slipToken, currentTripStatus, onStatusUpdate }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [gateType, setGateType] = useState<GateType>('GATE_IN');
  const [location, setLocation] = useState<GateLocation>('PICKUP');
  const [operatorName, setOperatorName] = useState('');
  const [notes, setNotes] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, refetch } = useQuery<{ getGateEntriesBySlipToken: any[] }>(GET_GATE_ENTRIES, {
    variables: { slipToken },
    fetchPolicy: 'network-only',
  });

  const [record, { loading: saving }] = useMutation<{ recordGateEntry: { newTripStatus: string } }>(
    RECORD_GATE_ENTRY,
    {
      onCompleted: (d) => {
        toast.success(`Gate entry recorded · status: ${STATUS_LABEL[d.recordGateEntry.newTripStatus] || d.recordGateEntry.newTripStatus}`);
        onStatusUpdate?.(d.recordGateEntry.newTripStatus);
        setShowForm(false);
        resetForm();
        refetch();
      },
      onError: (e) => toast.error(e.message),
    },
  );

  const resetForm = () => {
    setOperatorName('');
    setNotes('');
    setOdometerKm('');
    setSealNumber('');
    setPhotos([]);
  };

  const entries = data?.getGateEntriesBySlipToken ?? [];

  // Already-completed checks
  const completed = new Set(entries.map((e) => `${e.gateType}_${e.location}`));

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const MAX = 3;
    if (photos.length + files.length > MAX) {
      toast.error(`Max ${MAX} photos`);
      return;
    }
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name}: too large (max 2MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!operatorName.trim()) {
      toast.error('Operator name is required');
      return;
    }
    if (completed.has(`${gateType}_${location}`)) {
      toast.error(`${gateType} at ${location} already recorded`);
      return;
    }
    record({
      variables: {
        input: {
          slipToken,
          gateType,
          location,
          operatorName: operatorName.trim(),
          notes: notes.trim() || undefined,
          photos,
          odometerKm: odometerKm ? parseFloat(odometerKm) : undefined,
          sealNumber: sealNumber.trim() || undefined,
        },
      },
    });
  };

  const fmtTime = (d: string) => {
    const n = Number(d);
    const date = isNaN(n) ? new Date(d) : new Date(n);
    return isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="bg-white border-y border-gray-200 print:hidden">
      <div className="max-w-4xl mx-auto px-6 py-5">
        {/* Status banner */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Status</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-md text-xs font-bold ${STATUS_COLOR[currentTripStatus] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABEL[currentTripStatus] || currentTripStatus}
            </span>
          </div>

          {currentTripStatus !== 'DELIVERED' && currentTripStatus !== 'CANCELLED' && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" />
              {showForm ? 'Cancel' : 'Record Gate Entry'}
              {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
            {/* Gate type & location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">Event</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGateType('GATE_IN')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border ${
                      gateType === 'GATE_IN' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <LogIn className="w-4 h-4" /> Gate In
                  </button>
                  <button
                    onClick={() => setGateType('GATE_OUT')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border ${
                      gateType === 'GATE_OUT' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" /> Gate Out
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">Location</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLocation('PICKUP')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border ${
                      location === 'PICKUP' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Pickup
                  </button>
                  <button
                    onClick={() => setLocation('DROP')}
                    className={`px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 border ${
                      location === 'DROP' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Drop
                  </button>
                </div>
              </div>
            </div>

            {/* Operator name (required) */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">
                Operator Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">Odometer (km)</label>
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  placeholder="e.g. 142350"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">Seal Number</label>
                <input
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="e.g. SL-1234"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations — seal intact, cargo condition, delays, etc."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1.5 block">
                Photos <span className="text-gray-400 font-normal normal-case tracking-normal">(vehicle, seal, cargo · max 3 · 2MB each)</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? 'Saving...' : 'Submit Gate Entry'}
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {entries.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2.5">Gate Activity</p>
            <div className="space-y-2">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    e.gateType === 'GATE_IN' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {e.gateType === 'GATE_IN' ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">
                        {e.gateType === 'GATE_IN' ? 'Gate In' : 'Gate Out'} · {e.location === 'PICKUP' ? 'Pickup' : 'Drop'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{e.gateEntryId}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmtTime(e.capturedAt)} · by <span className="font-semibold text-gray-700">{e.operatorName}</span>
                      {e.odometerKm ? ` · ${e.odometerKm.toLocaleString('en-IN')} km` : ''}
                      {e.sealNumber ? ` · seal ${e.sealNumber}` : ''}
                    </p>
                    {e.notes && <p className="text-xs text-gray-600 mt-1 italic">"{e.notes}"</p>}
                    {e.photos && e.photos.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-500">
                        <ImageIcon className="w-3 h-3" />
                        {e.photos.length} photo{e.photos.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
