import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react';
import { GET_UNBILLED_LRS, GET_RATE_MASTER, GENERATE_INVOICE } from '../invoice.gql';
import { ChevronRight, ChevronLeft, Check, AlertCircle, FileText, Truck, DollarSign, Calculator, X } from 'lucide-react';
import { toast } from 'react-toastify';

const STEPS = [
    { id: 1, title: "Select LR", icon: FileText },
    { id: 2, title: "Verify Rate", icon: DollarSign },
    { id: 3, title: "Add Charges", icon: Calculator },
    { id: 4, title: "Review", icon: Check }
];

interface CreateInvoiceWizardProps {
    onClose?: () => void;
    onSuccess?: () => void;
}

export const CreateInvoiceWizard: React.FC<CreateInvoiceWizardProps> = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    
    // State
    const [selectedLR, setSelectedLR] = useState<any>(null);
    const [rateData, setRateData] = useState<any>(null);
    const [charges, setCharges] = useState({
        loadingCharges: 0,
        unloadingCharges: 0,
        miscellaneousCharges: 0,
        tax: 0
    });
    const [taxPercentage, setTaxPercentage] = useState(0);
    
    // Interfaces
    interface GetUnbilledLRsData {
        getUnbilledLRs: {
            id: string;
            lrNumber: string;
            consignee: string;
            consignor: string;
            date: string;
            weight: number;
            freightRate: number;
            totalFreight: number;
            materialName: string;
        }[];
    }

    interface GenerateInvoiceData {
        generateTransporterInvoice: {
            id: string;
            invoiceNumber: string;
            totalAmount: number;
            status: string;
        }
    }

    interface GenerateInvoiceVars {
        input: {
            lrId: string;
            loadingCharges: number;
            unloadingCharges: number;
            miscellaneousCharges: number;
            tax: number;
        }
    }

    // Queries
    const { data: lrsData, loading: lrsLoading } = useQuery<GetUnbilledLRsData>(GET_UNBILLED_LRS);
    const [getRate, { data: rateMasterData, loading: rateLoading }] = useLazyQuery(GET_RATE_MASTER);
    const [generateInvoice, { loading: generating }] = useMutation<GenerateInvoiceData, GenerateInvoiceVars>(GENERATE_INVOICE);

    // Rate Logic
    useEffect(() => {
        if (selectedLR && currentStep === 2) {
            // Try to fetch rate from master if needed, or just use LR rate
            // The flowchart says "Auto Pull Rate from Rate Master" -> "Rate Missing" logic
            // For now, we show LR Rate and allow comparison
            
            // If we implemented Rate Master fully, we would call getRate here
            // const { consignor, consignee, vehicleType } = selectedLR; // Assuming these fields exist maps to origin/dest
            // getRate({ variables: { origin: '...', destination: '...', vehicleType: '...' } });
        }
    }, [selectedLR, currentStep]);

    const handleNext = () => {
        if (currentStep === 1 && !selectedLR) {
            toast.error("Please select an LR");
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep === 1) {
            if (onClose) {
                onClose();
            } else {
                navigate(-1);
            }
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const { data } = await generateInvoice({
                variables: {
                    input: {
                        lrId: selectedLR.id,
                        ...charges
                    }
                }
            });
            
            if (data?.generateTransporterInvoice) {
                toast.success("Invoice generated successfully!");
                if (onSuccess) onSuccess();
                if (onClose) {
                    onClose();
                } else {
                    navigate('/trans-dashboard/invoices');
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to generate invoice");
        }
    };

    // Render Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Select Pending LR</h3>
                        {lrsLoading ? (
                            <div className="text-center py-8">Loading LRs...</div>
                        ) : lrsData?.getUnbilledLRs?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No unbilled LRs found.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {lrsData?.getUnbilledLRs.map((lr: any) => (
                                    <div 
                                        key={lr.id} 
                                        onClick={() => setSelectedLR(lr)}
                                        className={`p-4 border rounded-md cursor-pointer transition-all ${
                                            selectedLR?.id === lr.id 
                                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' 
                                            : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-gray-900">{lr.lrNumber}</div>
                                                <div className="text-sm text-gray-500">{lr.consignee}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-medium text-amber-700">₹{lr.totalFreight}</div>
                                                <div className="text-xs text-gray-400">{new Date(Number(lr.date)).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Rate Verification</h3>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-4 items-start">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900">System Rate Found</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    The LR has a pre-defined rate of <strong>₹{selectedLR.freightRate}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">LR Freight Rate</label>
                                <div className="text-xl font-mono font-bold text-gray-900 mt-1">₹{selectedLR.freightRate}</div>
                            </div>
                             <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Rate Master</label>
                                <div className="text-sm text-gray-500 mt-1 italic">Not configured for this route</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="confirmRate" className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500" defaultChecked />
                            <label htmlFor="confirmRate" className="text-sm text-gray-700">I confirm the rate is correct</label>
                        </div>
                    </div>
                );
             case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Additional Charges</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loading Charges</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={charges.loadingCharges}
                                        onChange={(e) => setCharges({...charges, loadingCharges: Number(e.target.value)})}
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unloading Charges</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={charges.unloadingCharges}
                                        onChange={(e) => setCharges({...charges, unloadingCharges: Number(e.target.value)})}
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Miscellaneous</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                                    <input 
                                        type="number" 
                                        value={charges.miscellaneousCharges}
                                        onChange={(e) => setCharges({...charges, miscellaneousCharges: Number(e.target.value)})}
                                        className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax / GST (%)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400">%</span>
                                    <input 
                                        type="number" 
                                        value={taxPercentage}
                                        onChange={(e) => {
                                            const newPercentage = Number(e.target.value);
                                            setTaxPercentage(newPercentage);
                                            const freight = selectedLR?.totalFreight || 0;
                                            const calculatedTax = (freight * newPercentage) / 100;
                                            setCharges({...charges, tax: calculatedTax});
                                        }}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-3 top-2.5 text-gray-500 text-sm">
                                        ₹{charges.tax.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                const total = (selectedLR?.totalFreight || 0) 
                    + charges.loadingCharges 
                    + charges.unloadingCharges 
                    + charges.miscellaneousCharges 
                    + charges.tax;

                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Ready to Generate</h3>
                            <p className="text-gray-500">Please review the invoice details below</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">LR Number</span>
                                <span className="font-medium text-gray-900">{selectedLR.lrNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Freight</span>
                                <span className="font-medium text-gray-900">₹{selectedLR.totalFreight}</span>
                            </div>
                             <div className="flex justify-between text-xs text-gray-400 border-t border-gray-200 pt-2 mt-2">
                                <span>+ Charges & Tax</span>
                                <span>₹{charges.loadingCharges + charges.unloadingCharges + charges.miscellaneousCharges + charges.tax}</span>
                            </div>
                             <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                                <span>Total Amount</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Generate Invoice</h2>
                    <button 
                        onClick={() => onClose ? onClose() : navigate(-1)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
                     <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10" />
                        {STEPS.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;
                            const Icon = step.icon;
                            
                            return (
                                <div key={step.id} className="flex flex-col items-center bg-gray-50 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isActive ? 'border-amber-600 bg-amber-50 text-amber-600' :
                                        isCompleted ? 'border-amber-600 bg-amber-600 text-white' :
                                        'border-gray-200 bg-white text-gray-400'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-medium mt-2 ${isActive ? 'text-amber-600' : 'text-gray-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {renderStepContent()}
                </div>
                
                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-100">
                    <button 
                        onClick={handleBack}
                        disabled={generating}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft size={18} />
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    {currentStep < 4 ? (
                         <button 
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                        >
                            Next Step <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                         <button 
                            onClick={handleSubmit}
                            disabled={generating}
                            className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-md hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200 disabled:opacity-70"
                        >
                            {generating ? 'Processing...' : 'Generate Invoice'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
