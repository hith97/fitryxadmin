import React from 'react';
import { DollarSign, Users, UserPlus, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const MetricCard = ({ label, value, trend, color, iconType }) => {
  const icons = {
    dollar: DollarSign,
    people: Users,
    userPlus: UserPlus,
    calendar: Calendar,
  };

  const Icon = icons[iconType] || DollarSign;

  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', trend: 'text-emerald-500' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', trend: 'text-emerald-500' },
    purple: { bg: 'bg-indigo-50', icon: 'text-indigo-500', trend: 'text-emerald-500' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-500', trend: 'text-red-500' },
  };

  const style = colorClasses[color] || colorClasses.blue;
  const isNegative = trend.startsWith('-');

  return (
    <div className="card p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${style.bg}`}>
          <Icon size={24} className={style.icon} />
        </div>
        <div className={`flex items-center gap-1 text-[13px] font-bold ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
          {isNegative ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          {trend.replace('-', '').replace('+', '')}
        </div>
      </div>
      
      <div className="mt-6">
        <span className="text-[13px] text-gray-500 font-medium">{label}</span>
        <div className="text-[28px] font-bold text-gray-900 mt-1">{value}</div>
      </div>
    </div>
  );
};

export default MetricCard;


