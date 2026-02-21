import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { toast } from 'react-toastify';

interface UploadPODModalProps {
    isOpen: boolean;
    onClose: () => void;
    lrId: string;
    lrNumber: string;
    onSuccess: () => void;
}

// Since we don't have the actual backend mutation, we'll simulate it locally 
// or define a placeholder if one existed.
// For now, we'll just simulate success after a delay.

export const UploadPODModal = ({ isOpen, onClose, lrId, lrNumber, onSuccess }: UploadPODModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    
    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setUploading(true);

        // SV: Simulate network request
        setTimeout(() => {
            setUploading(false);
            toast.success(`POD uploaded successfully for LR: ${lrNumber}`);
            onSuccess();
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 m-4 border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white rounded-t-xl">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-amber-600" />
                        Upload POD
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>Upload the signed Proof of Delivery (POD) for <strong>{lrNumber}</strong> to proceed with invoicing.</p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <div className="flex flex-col items-center text-green-600">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <span className="font-medium text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <FileText className="w-10 h-10 mb-2 text-gray-300" />
                                <span className="font-medium text-sm text-gray-700">Click to Browse or Drag File</span>
                                <span className="text-xs mt-1">Supports PDF, JPG, PNG</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2"
                    >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                </div>
             </div>
        </div>
    );
};
