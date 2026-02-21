import React, { useState } from 'react';
import { X, Save, Package, User, Truck, FileText } from 'lucide-react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

import { toast } from 'react-toastify';

const CREATE_INDENT_MUTATION = gql`
  mutation CreateTransporterIndent($input: CreateTransporterIndentInput!) {
    createTransporterIndent(input: $input) {
      id
      indentId
      customerName
      status
    }
  }
`;

const GET_CONTRACT_QUOTATIONS = gql`
  query GetContractQuotations {
    getContractQuotations {
      id
      contractId
      vendorName
      createdAt
    }
  }
`;

interface ContractSummary {
    id: string;
    contractId: string;
    vendorName: string;
    createdAt: string;
}

interface ContractQuotationsData {
    getContractQuotations: ContractSummary[];
}

interface CreateIndentModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateIndentModal = ({ onClose, onSuccess }: CreateIndentModalProps) => {
    const [formData, setFormData] = useState({
        indentId: `IND-${Math.floor(Math.random() * 10000)}`,
        customerName: '',
        contractId: '',
        vehicleType: 'TATA Ace',
    });

    const [showContractDropdown, setShowContractDropdown] = useState(false);

    const { data: contractData } = useQuery<ContractQuotationsData>(GET_CONTRACT_QUOTATIONS, {
        fetchPolicy: 'network-only'
    });

    const [createIndent, { loading }] = useMutation(CREATE_INDENT_MUTATION, {
        onCompleted: () => {
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (err) => {
            toast.error(`Error creating indent: ${err.message}`);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContractSelect = (contract: any) => {
        setFormData(prev => ({
            ...prev,
            contractId: contract.contractId,
            customerName: contract.vendorName // Auto-fill customer name
        }));
        setShowContractDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createIndent({
            variables: {
                input: {
                    indentId: formData.indentId,
                    customerName: formData.customerName,
                    contractId: formData.contractId,
                    vehicleType: formData.vehicleType
                }
            }
        });
    };

    const filteredContracts = contractData?.getContractQuotations.filter((c: any) => 
        c.contractId.toLowerCase().includes(formData.contractId.toLowerCase()) ||
        c.vendorName.toLowerCase().includes(formData.contractId.toLowerCase())
    ) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in duration-200" onClick={() => setShowContractDropdown(false)}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Create New Indent</h3>
                            <p className="text-xs text-gray-500">Add a new order/indent manually</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 mb-6">
                         <div className="flex gap-4 items-center">
                             <div className="flex-1">
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Indent ID</label>
                                 <input 
                                    name="indentId"
                                    value={formData.indentId}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-amber-200 rounded px-3 py-1.5 text-sm font-mono text-gray-800 focus:outline-none focus:border-amber-400"
                                 />
                             </div>
                             <div className="flex-1 relative">
                                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contract ID</label>
                                 <div className="relative" onClick={e => e.stopPropagation()}>
                                     <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                     <input 
                                        name="contractId"
                                        value={formData.contractId}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setShowContractDropdown(true);
                                        }}
                                        onFocus={() => setShowContractDropdown(true)}
                                        className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded px-3 text-sm font-mono text-gray-800 focus:outline-none focus:border-amber-400"
                                        placeholder="Search or Enter ID"
                                        autoComplete="off"
                                     />
                                     {showContractDropdown && filteredContracts.length > 0 && (
                                         <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                             {filteredContracts.map((contract: any) => (
                                                 <div 
                                                    key={contract.id}
                                                    onClick={() => handleContractSelect(contract)}
                                                    className="p-2 hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-0"
                                                 >
                                                     <div className="font-mono text-xs font-bold text-amber-700">{contract.contractId}</div>
                                                     <div className="text-xs text-gray-600 flex justify-between">
                                                         <span>{contract.vendorName}</span>
                                                         <span className="text-gray-400">{contract.createdAt}</span>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter customer name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type Required</label>
                            <div className="relative">
                                <Truck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select 
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                                >
                                    <option value="TATA Ace">TATA Ace</option>
                                    <option value="Pickup 8ft">Pickup 8ft</option>
                                    <option value="TATA 407">TATA 407</option>
                                    <option value="Eicher 14ft">Eicher 14ft</option>
                                    <option value="Container 20ft">Container 20ft</option>
                                    <option value="Trailer 40ft">Trailer 40ft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 shadow-md flex items-center gap-2"
                        >
                            {loading ? 'Creating...' : <><Save className="w-4 h-4" /> Create Indent</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
