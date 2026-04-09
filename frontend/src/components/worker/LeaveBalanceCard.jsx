import React from 'react';

const LeaveBalanceCard = ({ title, value }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all hover:border-gray-300">
      <span className="text-[14px] font-medium text-gray-900 mb-1">
        {title}
      </span>
      <div className="flex flex-col items-center">
        <span className="text-[18px] font-semibold text-gray-900 leading-tight">
          {value}
        </span>
        <span className="text-[12px] text-gray-400">
          days left
        </span>
      </div>
    </div>
  );
};

export default LeaveBalanceCard;
