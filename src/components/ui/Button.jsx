import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-[13px] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#5b54d6]",
    secondary: "bg-white border border-border text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
