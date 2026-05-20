import { motion } from 'framer-motion';

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
    const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider';
    
    // Properly scoped variant classes restoring functional styling
    const variantClasses = {
      primary: 'bg-slate-900 hover:bg-black text-white focus:ring-slate-200 border border-transparent shadow-lg shadow-slate-900/10',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-100 border border-transparent',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-100 border border-transparent shadow-lg shadow-rose-500/10',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-100 border border-transparent shadow-lg shadow-emerald-500/10',
      outline: 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 focus:ring-slate-100'
    };
    
    // Updated size classes to match admin Download Report button styling
    const sizeClasses = {
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-6 py-3 text-[11px]',
      lg: 'px-8 py-4 text-[13px]'
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
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
      </motion.button>
    );
  };
  
  export default Button;