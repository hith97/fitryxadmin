import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, RefreshCw, CreditCard, UserPlus } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  const getIcon = (type, status) => {
    switch(type) {
      case 'registration': return <UserPlus size={16} />;
      case 'payment': return <CreditCard size={16} />;
      case 'renewal': return <RefreshCw size={16} />;
      case 'cancellation': return <XCircle size={16} />;
      case 'issue': return <AlertTriangle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-emerald-500 bg-emerald-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      case 'danger': return 'text-red-500 bg-red-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="card p-6 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}>
              {getIcon(activity.type, activity.status)}
            </div>
            <div className="flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <h4 className="text-[13px] font-bold text-gray-900">{activity.title}</h4>
                <span className="text-[11px] text-gray-400 font-medium">{activity.time}</span>
              </div>
              <p className="text-[12px] text-gray-500 mt-1">{activity.user}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;


