import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-[220px] bg-white z-50 transform transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar mobile onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="lg:pl-[220px]">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="pt-14 p-6 min-h-[calc(100vh-56px)]">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
