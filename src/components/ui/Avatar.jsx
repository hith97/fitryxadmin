import React from 'react';

const Avatar = ({ name, size = 'md' }) => {
  const getInitials = (n) => {
    return n.split(' ').map(i => i[0]).join('').toUpperCase().slice(0, 2);
  };

  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 
    'bg-orange-500', 'bg-pink-500', 'bg-emerald-500'
  ];
  
  // Deterministic color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
