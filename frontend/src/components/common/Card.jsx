import { motion } from 'framer-motion';

const Card = ({ 
    children, 
    title, 
    className = '',
    headerClassName = '',
    bodyClassName = ''
  }) => {
    return (
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
        whileTap={{ scale: 0.98 }}
        className={`bg-white rounded-3xl border border-slate-100 w-full transition-all duration-300 shadow-sm ${className}`}
      >
        {title && (
          <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-50 page-header-row ${headerClassName}`}>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">{title}</h3>
          </div>
        )}
        <div className={`p-5 sm:p-6 ${bodyClassName} w-full`}>
          {children}
        </div>
      </motion.div>
    );
  };
  
  export default Card;