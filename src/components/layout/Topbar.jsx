import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle, Bell, LogOut, Menu, Search, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate('/settings/profile');
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    queryClient.clear();
    logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="fixed top-0 right-0 h-14 bg-white border-b border-border z-30 flex items-center justify-between px-4 lg:left-[220px] left-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer transition-colors border border-transparent hover:border-border group">
          <span className="text-[13px] font-medium text-gray-700">All Locations</span>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search members, plans..." 
            className="w-full bg-gray-50 border-none rounded-lg pl-10 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hidden sm:flex items-center gap-1.5">
          <HelpCircle size={18} />
          <span className="text-[13px] font-medium">Help</span>
        </button>
        
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex items-center gap-3 rounded-2xl border-l border-border pl-3 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-[13px] font-semibold text-gray-900 leading-tight">{currentUser?.fullName || 'Admin User'}</div>
              <div className="text-[11px] text-gray-400 font-medium">{currentUser?.role || 'Owner'}</div>
            </div>
            <Avatar name={currentUser?.fullName || 'Admin User'} size="sm" />
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
              <div className="rounded-[20px] bg-slate-50 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{currentUser?.fullName || 'Admin User'}</div>
                <div className="mt-1 text-sm text-slate-500">{currentUser?.email || 'owner@fitryx.com'}</div>
                <div className="mt-2 inline-flex rounded-full bg-primary-light px-3 py-1 text-[11px] font-semibold text-primary">
                  {currentUser?.approvalStatus === 'approved' ? 'Approved' : 'Pending approval'}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <UserCircle2 size={18} />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
