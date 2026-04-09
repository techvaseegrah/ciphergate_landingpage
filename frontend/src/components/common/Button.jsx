const Button = ({ 
    children, 
    type = 'button', 
    variant = 'primary', 
    size = 'md', 
    onClick, 
    disabled = false,
    fullWidth = false,
    className = ''
  }) => {
    // Base classes incorporating modern flex layout for icons and text
    const baseClasses = 'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    // Properly scoped variant classes restoring functional styling
    const variantClasses = {
      primary: 'bg-[#111111] hover:bg-black text-white focus:ring-[#111111]/50 border border-transparent',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-200 border border-transparent',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/50 border border-transparent',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/50 border border-transparent',
      outline: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 focus:ring-gray-200'
    };
    
    // Updated size classes to match admin Download Report button styling
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2 text-sm',
      lg: 'px-6 py-3 text-lg'
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    return (
      <button
        type={type}
        className={`
          ${baseClasses}
          ${variantClasses[variant] || variantClasses.primary}
          ${sizeClasses[size] || sizeClasses.md}
          ${widthClass}
          ${className}
        `}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };
  
  export default Button;