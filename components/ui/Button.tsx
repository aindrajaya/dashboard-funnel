import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-['Architects_Daughter'] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-[#a5d8ff] text-gray-900 border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#7cc5ff]",
    secondary: "bg-white text-gray-900 border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50",
    danger: "bg-[#ffc9c9] text-gray-900 border-2 border-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffb3b3]",
    ghost: "hover:bg-gray-100 text-gray-900",
    icon: "bg-transparent text-gray-700 hover:bg-gray-100 rounded-md",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 py-2 text-sm rounded-md",
    lg: "h-12 px-6 text-base rounded-lg",
    icon: "h-9 w-9 p-1.5 rounded-md",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};