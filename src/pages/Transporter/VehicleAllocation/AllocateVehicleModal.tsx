import React, { useState, useEffect } from 'react';
import { X, Truck, User, CreditCard, Calendar, Clock, Save, FileText } from 'lucide-react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

import { toast } from 'react-toastify';

const ALLOCATE_VEHICLE_MUTATION = gql`
  mutation AllocateVehicleToIndent($input: AllocateVehicleInput!) {
    allocateVehicleToIndent(input: $input) {
      id
      status
      vehicleNumber
      driverName
    }
  }
`;

interface AllocateVehicleModalProps {
  onClose: () => void;
  indentId: string;
  onSuccess?: () => void;
}

export const AllocateVehicleModal = ({ onClose, indentId, onSuccess }: AllocateVehicleModalProps) => {
  const [vehicleType, setVehicleType] = useState('Market'); // Own or Market
  
  const [formData, setFormData] = useState({
      vehicleNumber: '',
      vehicleSize: '20 FT',
      marketTripCost: '',
      vendorTransporter: '',
      advancePaid: '',
      driverName: '',
      driverNumber: '',
      loadingStartTime: '',
      dispatchPlannedTime: '',
  });

  const [allocateVehicle, { loading }] = useMutation(ALLOCATE_VEHICLE_MUTATION, {
      onCompleted: () => {
          if (onSuccess) onSuccess();
          onClose();
      },
      onError: (err) => {
          toast.error(`Error allocating vehicle: ${err.message}`);
      }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateBalance = () => {
      const cost = parseFloat(formData.marketTripCost) || 0;
      const advance = parseFloat(formData.advancePaid) || 0;
      return (cost - advance).toFixed(2);
  };

  const handleAllocate = () => {
      if (!formData.vehicleNumber) {
          toast.error("Please enter vehicle number");
          return;
      }

      allocateVehicle({
          variables: {
              input: {
                  id: indentId,
                  vehicleNumber: formData.vehicleNumber,
                  ownerType: vehicleType.toUpperCase(),
                  marketTripCost: parseFloat(formData.marketTripCost) || 0,
                  vendorTransporter: formData.vendorTransporter,
                  advancePaid: parseFloat(formData.advancePaid) || 0,
                  balanceDue: parseFloat(calculateBalance()),
                  driverName: formData.driverName,
                  driverNumber: formData.driverNumber,
                  loadingStartTime: formData.loadingStartTime,
                  dispatchPlannedTime: formData.dispatchPlannedTime
              }
          }
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Truck className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">Indent Wise Vehicle Allocation</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    Indent ID: <span className="font-mono font-medium text-gray-700 bg-gray-100 px-1 rounded">IND-{indentId.slice(-6)}</span>
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Vehicle Details */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-amber-600"/>
                <h4 className="text-sm font-semibold text-gray-800">Vehicle Allocation</h4>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Source</label>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 pointer-events-auto">
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${vehicleType === 'Own' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setVehicleType('Own')}
                        >
                            Own Fleet
                        </button>
                        <button 
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${vehicleType === 'Market' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setVehicleType('Market')}
                        >
                            Market Vehicle
                        </button>
                    </div>
                 </div>

                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Size</label>
                    <select 
                        name="vehicleSize"
                        value={formData.vehicleSize}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                        <option>20 FT</option>
                        <option>32 FT MXL</option>
                        <option>32 FT SXL</option>
                    </select>
                 </div>

                 <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input 
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        type="text" 
                        placeholder="Ex: OD02XY1234" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent uppercase font-mono placeholder:normal-case"
                    />
                 </div>
             </div>
          </div>

          {/* Section 2: Financials */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-amber-600"/>
                <h4 className="text-sm font-semibold text-gray-800">Financial Details</h4>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Market Trip Cost</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input 
                            name="marketTripCost"
                            value={formData.marketTripCost}
                            onChange={handleChange}
                            type="number" 
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                            placeholder="0.00"
                        />
                    </div>
                 </div>

                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vendor/Transporter Name</label>
                    <input 
                        name="vendorTransporter"
                        value={formData.vendorTransporter}
                        onChange={handleChange}
                        type="text" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter transporter name"
                    />
                 </div>

                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Advance Paid</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input 
                            name="advancePaid"
                            value={formData.advancePaid}
                            onChange={handleChange}
                            type="number" 
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                            placeholder="0.00"
                        />
                    </div>
                 </div>

                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Balance Due</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <input 
                            value={calculateBalance()}
                            readOnly
                            type="number" 
                            className="w-full pl-7 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium text-gray-500"
                            placeholder="0.00"
                        />
                    </div>
                 </div>
             </div>
          </div>

           {/* Section 3: Driver & Schedule */}
           <div className="grid grid-cols-2 gap-4">
               <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Driver Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input 
                            name="driverName"
                            value={formData.driverName}
                            onChange={handleChange}
                            type="text" 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="Driver Name"
                        />
                    </div>
               </div>
               <div>
                     <label className="block text-xs font-medium text-gray-700 mb-1">Driver Number</label>
                    <div className="relative">
                        <input 
                            name="driverNumber"
                            value={formData.driverNumber}
                            onChange={handleChange}
                            type="text" 
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
               </div>
               
               <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loading Start Time</label>
                    <input 
                        name="loadingStartTime"
                        value={formData.loadingStartTime}
                        onChange={handleChange}
                        type="datetime-local" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
               </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dispatch Planned Time</label>
                    <input 
                        name="dispatchPlannedTime"
                        value={formData.dispatchPlannedTime}
                        onChange={handleChange}
                        type="datetime-local" 
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
               </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleAllocate}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg hover:from-amber-700 hover:to-amber-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Allocate Vehicle</>}
          </button>
        </div>
      </div>
    </div>
  );
};
