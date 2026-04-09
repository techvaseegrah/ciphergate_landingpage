import { FiDownload, FiFileText } from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';

const AttachmentViewerModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen) return null;

  const fileExtension = fileName?.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPDF = fileExtension === 'pdf';

  const downloadFile = (e) => {
    e.preventDefault();
    // Use manual fetch to trigger download reliably
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName || 'attachment');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Download failed:', err);
        // Fallback to simple link click if fetch fails
        window.open(fileUrl, '_blank');
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Preview"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-500 flex items-center max-w-[50%]">
                <FiFileText className="mr-2 flex-shrink-0" /> 
                <span className="truncate">{fileName}</span>
            </div>
            <div className="flex space-x-2">
                <Button variant="secondary" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={downloadFile} className="flex items-center">
                    <FiDownload className="mr-2" /> Download
                </Button>
            </div>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {isImage ? (
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="max-w-full max-h-[65vh] object-contain shadow-sm bg-white" 
          />
        ) : isPDF ? (
          <iframe 
            src={`${fileUrl}#view=FitH`} 
            title={fileName} 
            className="w-full h-[65vh] border-none bg-white font-sans"
            style={{ minHeight: '500px' }}
          />
        ) : (
          <div className="text-center p-12">
            <FiFileText className="mx-auto h-20 w-20 text-gray-300 mb-6" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h4>
            <p className="text-gray-500 mb-8">This file type (.{fileExtension}) cannot be previewed in the browser.</p>
            <Button variant="primary" onClick={downloadFile} className="flex items-center mx-auto scale-110">
                <FiDownload className="mr-2" /> Download to View
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AttachmentViewerModal;
