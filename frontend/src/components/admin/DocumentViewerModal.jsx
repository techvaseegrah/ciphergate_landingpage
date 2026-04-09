import React, { useState } from 'react';
import { FaFilePdf, FaFileImage, FaFileExcel, FaDownload, FaExternalLinkAlt, FaSpinner } from 'react-icons/fa';
import Modal from '../common/Modal';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DocumentViewerModal = ({ isOpen, onClose, document, getFullFileUrl }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!document) return null;

  const { url, name, type, workerId } = document;
  const fullUrl = getFullFileUrl(url);

  // Helper to get file type icon
  const getFileIcon = () => {
    switch (type) {
      case 'pdf': return <FaFilePdf className="w-6 h-6 text-red-500" />;
      case 'image': return <FaFileImage className="w-6 h-6 text-blue-500" />;
      case 'excel': return <FaFileExcel className="w-6 h-6 text-green-500" />;
      default: return null;
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // We use the new backend secure download route
      const response = await api.get(`/workers/${workerId}/download-proof`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      
      // Attempt to extract filename from content-disposition header if available, otherwise use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = name;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download the document. It might have been removed.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ID Proof Viewer" size="4xl">
      <div className="flex flex-col h-[70vh] max-h-[800px]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <p className="text-sm font-bold text-gray-800 break-all">{name}</p>
              <p className="text-xs text-gray-500 capitalize">{type} Document</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={fullUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FaExternalLinkAlt /> Open
            </a>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center justify-center min-w-[110px] gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-400"
            >
              {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
          {type === 'pdf' && (
            <iframe 
              src={fullUrl} 
              className="w-full h-full border-0 bg-white"
              title={name}
            />
          )}

          {type === 'image' && (
            <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-4">
               <img 
                 src={fullUrl} 
                 alt={name}
                 className="max-w-full max-h-full object-contain bg-white shadow-md rounded-md"
               />
            </div>
          )}

          {type === 'excel' && (
            <div className="text-center p-8 bg-white m-4 rounded-2xl shadow-sm max-w-md w-full border border-gray-100">
              <FaFileExcel className="w-20 h-20 text-green-500 mx-auto mb-4 opacity-80" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Spreadsheet Document</h4>
              <p className="text-sm text-gray-500 mb-6 px-4">Live preview is not currently available for Excel files in the browser.</p>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:bg-green-400"
              >
                {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                {isDownloading ? 'Downloading...' : 'Download File'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewerModal;
