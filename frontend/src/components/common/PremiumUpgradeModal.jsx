import React, { useState } from 'react';
import Modal from './Modal';
import PricingModal from './PricingModal';

const PremiumUpgradeModal = ({ isOpen, onClose }) => {
  const [showPricing, setShowPricing] = useState(false);

  const handleClose = () => {
    setShowPricing(false);
    onClose();
  };

  const handleUpgradeClick = () => {
    setShowPricing(true);
  };

  if (showPricing) {
    return <PricingModal isOpen={isOpen} onClose={handleClose} />;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upgrade Required"
      size="md"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Free Account Limit Reached</h3>
        <p className="text-gray-600 mb-6">
          You've reached the maximum number of workers (5) for free accounts.
          Upgrade to premium for unlimited workers and additional features.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgradeClick}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
          >
            View Premium Plans
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PremiumUpgradeModal;