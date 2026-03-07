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
    // Base classes matching the admin Download Report button
    const baseClasses = 'rounded-xl font-medium shadow-md transition-colors duration-200 focus:outline-none';
    
    // Updated variant classes to match admin Download Report button styling
    const variantClasses = {
      primary: 'bg-[#111111] hover:bg-[#000000] text-white focus:ring-[#111111]',
      secondary: 'bg-[#111111] hover:bg-[#000000] text-white focus:ring-[#111111]',
      danger: 'bg-[#111111] hover:bg-[#000000] text-white focus:ring-[#111111]',
      success: 'bg-[#111111] hover:bg-[#000000] text-white focus:ring-[#111111]',
      outline: 'bg-[#111111] hover:bg-[#000000] text-white focus:ring-[#111111]'
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
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${widthClass}
          ${disabledClass}
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