import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { FiLogOut, FiClock } from "react-icons/fi";
import appContext from '../../context/AppContext';
import ShatteredLogo from '../common/ShatteredLogo';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({
  links,
  logoText = 'Task Tracker',
  user,
  onLogout,
  onUpgradeClick,
  isOpen,
  onClose,
  onExpandToggle
}) => {
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [showFullLogo, setShowFullLogo] = useState(false);
  const [triggerLogoAnimation, setTriggerLogoAnimation] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const { subdomain } = useContext(appContext);

  // Desktop expanded condition: open via menu OR hovered
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    if (onExpandToggle) {
      onExpandToggle(isExpanded);
    }
  }, [isExpanded, onExpandToggle]);

  // Theme Colors
  const themeColor = "bg-white border-r border-gray-100"; // Premium White

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowFullLogo(true);
    }, 2000);
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTriggerLogoAnimation(prev => !prev);
      setShowFullLogo(false);
      const resetTimer = setTimeout(() => {
        setShowFullLogo(true);
      }, 2000);
      return () => clearTimeout(resetTimer);
    }
  }, [isOpen]);

  const handleItemClick = (to) => {
    setClickedItem(to);
    setTimeout(() => {
      setClickedItem(null);
    }, 1000);
    if (onClose) onClose();
  };

  const toggleDropdown = (key) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isAnyChildActive = (children) => {
    return children.some(child => location.pathname === child.to);
  };

  return (
    <>
      {/* Sidebar Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] md:hidden transition-all duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-[1001] ${themeColor} transform flex flex-col sidebar-container transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${isExpanded ? 'w-64 shadow-2xl md:w-64' : 'md:w-[84px]'}`}
        style={{ borderTopRightRadius: '32px', borderBottomRightRadius: '32px' }}
      >
        {/* Logo section */}
        <div className="flex items-center h-20 px-5 box-border w-full">
          <div className="flex items-center w-full">
            <div className="w-11 h-11 flex items-center justify-center bg-slate-900 rounded-2xl p-2.5 flex-shrink-0 shadow-lg shadow-slate-900/20">
              <ShatteredLogo
                triggerAnimation={triggerLogoAnimation}
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain brightness-0 invert"
                onComplete={() => {}}
              />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3.5 overflow-hidden whitespace-nowrap flex-1"
                >
                  <span className="text-[18px] font-extrabold !text-slate-900 tracking-tight font-poppins leading-[1.15] block">
                    {logoText.split(' ').map((line, i) => <span key={i} className="block">{line}</span>)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Links - Scrollable Area */}
        <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto no-scrollbar box-border w-full">
          {links.map((link, index) => {
            const isActive = location.pathname === link.to;

            if (link.isHeader) {
              return (
                <div key={`header-${index}`} className={`pt-6 pb-2 ${isExpanded ? 'px-2 text-left' : 'px-0 text-center'} transition-all duration-300 overflow-hidden`}>
                  {isExpanded ? (
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap opacity-100 transition-opacity duration-300">
                      {link.label}
                    </h3>
                  ) : (
                    <div className="w-6 h-0.5 bg-slate-200 rounded-full mx-auto my-2"></div>
                  )}
                </div>
              );
            }

            if (link.isDropdown) {
              const dropdownKey = `dropdown-${index}`;
              const isExpandedKey = expandedDropdowns[dropdownKey];
              const hasActiveChild = isAnyChildActive(link.children || []);

              return (
                <div key={dropdownKey} className="relative w-full">
                  <button
                    onClick={() => {
                      if (!isExpanded) setIsHovered(true);
                      toggleDropdown(dropdownKey);
                    }}
                    className={`
                      group flex items-center h-11 box-border rounded-2xl transition-all duration-300 font-poppins overflow-hidden border-0 cursor-pointer
                      ${isExpanded ? 'w-full' : 'w-11'}
                      ${isExpandedKey || hasActiveChild
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 bg-transparent'
                      }
                    `}
                    title={!isExpanded ? link.label : undefined}
                  >
                    <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                      <span className={`text-lg transition-colors flex items-center justify-center ${isExpandedKey || hasActiveChild ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                        {link.icon}
                      </span>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 flex items-center overflow-hidden whitespace-nowrap pr-3"
                        >
                          <span className="flex-1 text-left truncate tracking-tight font-semibold ml-1.5 text-[13px]">{link.label}</span>
                          <span className={`ml-2 flex items-center justify-center transition-transform duration-300 ${isExpandedKey ? 'rotate-180' : ''}`}>
                            <FaChevronDown size={10} className="opacity-50" />
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <AnimatePresence>
                    {isExpanded && isExpandedKey && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-1 ml-4 border-l-2 border-slate-100 pl-4 mt-1.5"
                      >
                        {link.children?.map((child) => {
                          const isSelected = location.pathname === child.to;
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              className={`flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold rounded-xl transition-all duration-200 ${isSelected ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                              onClick={() => handleItemClick(child.to)}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-900' : 'bg-slate-200 hover:bg-slate-400'}`}></span>
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <div key={link.to} className="relative w-full">
                <Link
                  to={link.to}
                  className={`
                    group flex items-center h-11 box-border rounded-2xl transition-all duration-300 font-poppins overflow-hidden
                    ${isExpanded ? 'w-full' : 'w-11'}
                    ${isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 active-pill'
                      : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                    }
                  `}
                  onClick={() => handleItemClick(link.to)}
                  title={!isExpanded ? link.label : undefined}
                >
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
                    <span className={`text-lg transition-colors flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                      {link.icon}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 flex items-center overflow-hidden whitespace-nowrap pr-3"
                      >
                        <span className="flex-1 text-left truncate tracking-tight font-semibold ml-1.5 text-[13px]">{link.label}</span>
                        {link.badge && (
                          <span className={`text-[10px] font-semibold rounded-lg px-2 py-0.5 flex-shrink-0 ml-2 ${isActive ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-sm'}`}>
                            {link.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        {user && (
          <div className="px-5 mt-auto mb-6 box-border w-full">
            <div className={`bg-slate-50 border border-slate-100 h-11 box-border ${isExpanded ? 'w-full rounded-3xl px-1.5 flex-row' : 'w-11 rounded-2xl p-1.5 flex-col'} group transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 flex items-center overflow-hidden`}>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 relative cursor-pointer" onClick={() => setShowLogoutModal(true)} title="Click to logout">
                <img
                  className={`w-8 h-8 rounded-xl object-cover border-2 border-white shadow-md transition-all duration-300 group-hover:scale-105`}
                  src={user.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'U')}&background=0f172a&color=ffffff&bold=true`}
                  alt={user.name || user.username}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 overflow-hidden whitespace-nowrap flex-1 flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-bold text-slate-900 truncate leading-none mb-0">
                          {user.displayName || user.name || user.username}
                        </p>
                        {user.accountType === 'premium' && (
                          <span className="text-[8px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm shadow-amber-500/20">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-bold mt-1.5 uppercase tracking-wider mb-0">
                        {user.departmentName || user.department?.name || 'Admin'}
                      </p>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => setShowLogoutModal(true)}
                      title="Logout"
                      className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-300 ml-1 border-0 cursor-pointer flex-shrink-0 shadow-sm"
                    >
                      <FiLogOut size={16} />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              setShowLogoutModal(false);
              if (onLogout) onLogout();
            }}>
              Logout
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
            <FiLogOut size={32} />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Are you sure you want to log out?</h4>
          <p className="text-sm text-slate-500 max-w-sm mb-0">
            You will be signed out of your account and returned to the login screen.
          </p>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 767px) {
          .active-pill {
            border-radius: 16px !important;
          }
          .sidebar-container {
            border-top-right-radius: 24px !important;
            border-bottom-right-radius: 24px !important;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;