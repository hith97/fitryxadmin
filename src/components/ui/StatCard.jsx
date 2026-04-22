import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ label, value, trend, detail, color, progress }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    teal: 'text-teal-600 bg-teal-50',
    warning: 'text-yellow-600 bg-yellow-50',
    danger: 'text-red-600 bg-red-50',
    primary: 'text-primary bg-primary-light',
  };

  return (
    <div className="card p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[12px] font-normal text-gray-500">{label}</span>
          {trend && (
            <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClasses[color]}`}>
              {trend.includes('%') && (trend.startsWith('+') ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
              {trend}
            </span>
          )}
        </div>
        <div className="text-stat font-bold text-gray-900">{value}</div>
        <div className="text-[11px] text-gray-400 mt-1">{detail}</div>
      </div>
      
      {progress !== undefined && (
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className={`h-full ${color === 'blue' ? 'bg-blue-500' : 'bg-primary'}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatCard;
