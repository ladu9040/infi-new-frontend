import React, { useState } from 'react';
import { X, ArrowRight, Truck, Package, DollarSign, FileText } from 'lucide-react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

import { toast } from 'react-toastify';

const GET_ALLOCATED_INDENTS = gql`
  query GetAllocatedIndents {
    getAllTransporterIndents(status: "ALLOCATED") {
      id
      indentId
      customerName
      vehicleNumber
      marketTripCost
      vehicleType
    }
  }
`;

const GENERATE_LR_MUTATION = gql`
  mutation GenerateLR($input: GenerateLRInput!) {
    generateLR(input: $input) {
      id
      lrNumber
      status
    }
  }
`;

interface TransporterIndent {
    id: string;
    indentId: string;
    customerName: string;
    vehicleNumber: string;
    marketTripCost: number;
    vehicleType: string;
}

interface CreateLRModalData {
    getAllTransporterIndents: TransporterIndent[];
}

interface CreateLRModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateLRModal = ({ onClose, onSuccess }: CreateLRModalProps) => {
    // Form State
    const [selectedIndentId, setSelectedIndentId] = useState('');
    const [formData, setFormData] = useState({
        consignor: '',
        consignorGST: '',
        consignorAddress: '',
        consignee: '',
        consigneeGST: '',
        consigneeAddress: '',
        materialName: '',
        quantity: 0,
        weight: 0,
        freightRate: 0,
        loadingCharges: 0,
        unloadingCharges: 0,
        invoiceNumber: '',
        eWayBillNo: ''
    });

    // Indent Query
    const { data: indentData, loading: indentLoading } = useQuery<CreateLRModalData>(GET_ALLOCATED_INDENTS, {
        fetchPolicy: 'network-only'
    });

    // Generate Mutation
    const [generateLR, { loading: submitting }] = useMutation(GENERATE_LR_MUTATION, {
        onCompleted: () => {
             // Handle success (maybe show a toast or just close)
             if (onSuccess) onSuccess();
             onClose();
        },
        onError: (err) => {
            toast.error(`Error generating LR: ${err.message}`);
        }
    });

    // Handle Indent Selection
    const handleIndentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const indentId = e.target.value;
        setSelectedIndentId(indentId);
        
        if (indentId) {
            const indent = indentData?.getAllTransporterIndents.find((i: any) => i.id === indentId);
            if (indent) {
                setFormData(prev => ({
                    ...prev,
                    consignee: indent.customerName || '', // Assume customer is consignee usually? Or maybe consignor. Let's guess Consignee.
                    freightRate: indent.marketTripCost || 0,
                    // Reset other fields if needed or keep user input? Resetting seems safer to avoid mismatch.
                    consignor: '',
                    consignorGST: '', 
                    consignorAddress: '',
                    consigneeGST: '',
                    consigneeAddress: '',
                    materialName: '',
                    weight: 0,
                    quantity: 0,
                    loadingCharges: 0,
                    unloadingCharges: 0,
                    invoiceNumber: '',
                    eWayBillNo: ''
                }));
            }
        }
    };

    // Derived Logic
    const currentIndent = indentData?.getAllTransporterIndents.find((i: any) => i.id === selectedIndentId);
    
    // Calculate Total Freight
    const totalFreight = (Number(formData.freightRate) || 0) + (Number(formData.loadingCharges) || 0) + (Number(formData.unloadingCharges) || 0);

    const handleSubmit = () => {
        if (!selectedIndentId) {
            toast.error("Please select an indent first.");
            return;
        }
        
        const input = {
            indentId: selectedIndentId,
            consignor: formData.consignor,
            consignorAddress: formData.consignorAddress,
            consignorGST: formData.consignorGST,
            consignee: formData.consignee,
            consigneeAddress: formData.consigneeAddress,
            consigneeGST: formData.consigneeGST,
            materialName: formData.materialName,
            weight: parseFloat(formData.weight.toString()),
            quantity: parseInt(formData.quantity.toString()) || 0,
            noOfPackages: parseInt(formData.quantity.toString()) || 0, // Assuming quantity is packages
            freightRate: parseFloat(formData.freightRate.toString()),
            totalFreight: parseFloat(totalFreight.toString())
        };

        generateLR({ variables: { input } });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-in fade-in zoom-in duration-200 my-auto border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Create New LR</h3>
                            <p className="text-xs text-gray-500">Enter shipment details to generate LR</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Indent Selection Banner */}
                <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
                     <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">Select Allocated Indent</label>
                            <div className="relative">
                                <select 
                                    value={selectedIndentId}
                                    onChange={handleIndentChange}
                                    className="w-full pl-3 pr-10 py-2 bg-white border border-amber-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="">-- Select Indent --</option>
                                    {indentLoading ? (
                                        <option>Loading indents...</option>
                                    ) : (
                                        indentData?.getAllTransporterIndents.map((indent: any) => (
                                            <option key={indent.id} value={indent.id}>
                                                {indent.indentId} - {indent.customerName} ({indent.vehicleNumber})
                                            </option>
                                        ))
                                    )}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Truck className="w-4 h-4 text-amber-400" />
                                </div>
                            </div>
                        </div>
                        
                        {selectedIndentId && currentIndent && (
                            <div className="flex gap-4 text-xs text-gray-600 bg-white px-4 py-2 rounded-lg border border-amber-100 shadow-sm">
                                <div>
                                    <span className="block text-gray-400 text-[10px] uppercase">Vehicle No</span>
                                    <span className="font-semibold text-gray-800">{currentIndent.vehicleNumber}</span>
                                </div>
                                <div className="w-px bg-gray-200"></div>
                                <div>
                                    <span className="block text-gray-400 text-[10px] uppercase">Customer</span>
                                    <span className="font-semibold text-gray-800">{currentIndent.customerName}</span>
                                </div>
                                <div className="w-px bg-gray-200"></div>
                                <div>
                                    <span className="block text-gray-400 text-[10px] uppercase">Date</span>
                                    <span className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                     </div>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Section 1: Route & Parties */}
                    <div>
                         <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b pb-2">
                             <Truck className="w-4 h-4 text-amber-600" />
                             Consignment Details
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                             {/* Line connector for desktop */}
                             <div className="hidden md:block absolute left-1/2 top-10 bottom-0 w-px bg-gray-100 -translate-x-1/2"></div>
                             <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm z-10">
                                 <ArrowRight className="w-4 h-4 text-amber-500" />
                             </div>

                             {/* Consignor */}
                             <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors group">
                                 <h5 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Consignor (Sender)</h5>
                                 <div className="space-y-4">
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                                         <input 
                                            name="consignor"
                                            value={formData.consignor}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Enter sender company name"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">GSTIN</label>
                                         <input 
                                            name="consignorGST"
                                            value={formData.consignorGST}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Ex: 29ABCDE1234F1Z5"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Address & City</label>
                                         <textarea 
                                            name="consignorAddress"
                                            value={formData.consignorAddress}
                                            onChange={handleInputChange}
                                            rows={2} 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Full address"
                                         ></textarea>
                                     </div>
                                 </div>
                             </div>

                             {/* Consignee */}
                              <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors group">
                                 <h5 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider group-hover:text-amber-600 transition-colors">Consignee (Receiver)</h5>
                                 <div className="space-y-4">
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                                         <input 
                                            name="consignee"
                                            value={formData.consignee}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Enter receiver company name"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">GSTIN</label>
                                         <input 
                                            name="consigneeGST"
                                            value={formData.consigneeGST}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Ex: 29ABCDE1234F1Z5"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Address & City</label>
                                         <textarea 
                                            name="consigneeAddress"
                                            value={formData.consigneeAddress}
                                            onChange={handleInputChange}
                                            rows={2} 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none" 
                                            placeholder="Full address"
                                         ></textarea>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 2: Material Details */}
                        <div>
                             <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b pb-2">
                                 <Package className="w-4 h-4 text-amber-600" />
                                 Material Information
                             </h4>
                             <div className="space-y-4 p-5 bg-gray-50/50 border border-gray-100 rounded-xl">
                                 <div>
                                     <label className="block text-xs font-medium text-gray-700 mb-1">Material Name</label>
                                     <input 
                                        name="materialName"
                                        value={formData.materialName}
                                        onChange={handleInputChange}
                                        type="text" 
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                        placeholder="e.g. Cement Bags" 
                                     />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Quantity (Pkts)</label>
                                         <input 
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                            placeholder="0" 
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-700 mb-1">Actual Weight (KG)</label>
                                         <input 
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                            placeholder="0.00" 
                                         />
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Section 3: Freight & Billing */}
                         <div>
                             <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b pb-2">
                                 <DollarSign className="w-4 h-4 text-amber-600" />
                                 Freight & Charges
                             </h4>
                             <div className="p-5 bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-xl space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-medium text-gray-600 mb-1">Base Freight</label>
                                         <div className="relative">
                                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                             <input 
                                                name="freightRate"
                                                value={formData.freightRate}
                                                onChange={handleInputChange}
                                                type="number" 
                                                className="w-full pl-6 pr-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                             />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-600 mb-1">Loading Charges</label>
                                         <input 
                                            name="loadingCharges"
                                            value={formData.loadingCharges}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-medium text-gray-600 mb-1">Unloading Charges</label>
                                         <input 
                                            name="unloadingCharges"
                                            value={formData.unloadingCharges}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 transition-all outline-none" 
                                         />
                                     </div>
                                 </div>
                                 
                                 <div className="pt-3 border-t border-amber-200 mt-2 flex items-center justify-between">
                                     <span className="text-sm font-bold text-gray-700">Total Payable Freight</span>
                                     <span className="text-xl font-bold text-amber-700">₹ {totalFreight.toLocaleString()}</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                </div>

                 {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center sticky bottom-0 rounded-b-xl">
                   <div className="flex gap-4">
                       <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                           <input type="checkbox" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                           Invoice Attached
                       </label>
                       <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                           <input type="checkbox" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" defaultChecked />
                           POD Required
                       </label>
                   </div>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={submitting || !selectedIndentId}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        {submitting ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                Generate LR
                            </>
                        )}
                    </button>
                  </div>
                </div>

             </div>
        </div>
    );
};
