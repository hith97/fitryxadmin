import React from 'react';

const PopularClasses = ({ classes }) => {
  return (
    <div className="card p-6 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wider">Popular Classes</h3>
      <div className="space-y-6">
        {classes.map((cls) => (
          <div key={cls.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[13px] font-medium text-gray-800">{cls.name}</span>
              <span className="text-[11px] text-gray-400 font-semibold">{cls.current}/{cls.max}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(cls.current / cls.max) * 100}%`,
                  backgroundColor: cls.color 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularClasses;


